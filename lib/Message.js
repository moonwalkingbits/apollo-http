/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import HeaderCollection from "./HeaderCollection.js";

/**
 * HTTP messages consist of requests from a client to a server and responses
 * from a server to a client. This interface defines the methods common to
 * each.
 *
 * Messages are considered immutable; all methods that might change state MUST
 * be implemented such that they retain the internal state of the current
 * message and return an instance that contains the changed state.
 *
 * @see http://www.ietf.org/rfc/rfc7230.txt
 * @see http://www.ietf.org/rfc/rfc7231.txt
 */
class Message {
    /**
     * Create a new message instance.
     *
     * @public
     * @param {string} protocolVersion HTTP protocol version.
     * @param {HeaderCollection} headers Message headers.
     * @param {(stream.Readable|stream.Writable)} body Message body.
     */
    constructor(protocolVersion, headers, body) {
        /**
         * HTTP protocol version.
         *
         * @private
         * @type {string}
         */
        this._protocolVersion = protocolVersion;

        /**
         * Message headers.
         *
         * @private
         * @type {HeaderCollection}
         */
        this._headers = headers;

        /**
         * Message body.
         *
         * @private
         * @type {(stream.Readable|stream.Writable)}
         */
        this._body = body;
    }

    /**
     * Retrieves the HTTP protocol version as a string.
     *
     * The string MUST contain only the HTTP version number (e.g., "1.1", "1.0").
     *
     * @public
     * @return {string} HTTP protocol version.
     */
    get protocolVersion() {
        return this._protocolVersion;
    }

    /**
     * Return an instance with the specified HTTP protocol version.
     *
     * The version string MUST contain only the HTTP version number (e.g.,
     * "1.1", "1.0").
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * new protocol version.
     *
     * @public
     * @param {string} protocolVersion HTTP protocol version
     * @return {Message} Message instance with protocol version.
     */
    withProtocolVersion(protocolVersion) {
        if (protocolVersion === this.protocolVersion) {
            return this;
        }

        return this.createMessage(
            protocolVersion,
            this._headers,
            this.body
        );
    }

    /**
     * Retrieves all message header values.
     *
     * The keys represent the header name as it will be sent over the wire, and
     * each value is an array of strings associated with the header.
     *
     * While header names are not case-sensitive, the exact case in which
     * headers were originally specified will be preserved.
     *
     * @public
     * @return {Object.<string, Array.<string>>} Returns an object of the message's headers.
     *     Each key MUST be a header name, and each value MUST be an array of
     *     strings for that header.
     */
    get headers() {
        return this._headers.all();
    }

    /**
     * Checks if a header exists by the given case-insensitive name.
     *
     * @public
     * @param {string} name Case-insensitive header field name.
     * @return {boolean} Returns true if any header names match the given header
     *     name using a case-insensitive string comparison. Returns false if
     *     no matching header name is found in the message.
     */
    hasHeader(name) {
        return this._headers.has(name);
    }

    /**
     * Retrieves a message header value by the given case-insensitive name.
     *
     * This method returns an array of all the header values of the given
     * case-insensitive header name.
     *
     * If the header does not appear in the message, this method MUST return an
     * empty array.
     *
     * @public
     * @param {string} name Case-insensitive header field name.
     * @return {Array.<string>} An array of string values as provided for the given
     *    header. If the header does not appear in the message, this method MUST
     *    return an empty array.
     */
    header(name) {
        return this._headers.get(name);
    }

    /**
     * Retrieves a comma-separated string of the values for a single header.
     *
     * This method returns all of the header values of the given
     * case-insensitive header name as a string concatenated together using
     * a comma.
     *
     * NOTE: Not all header values may be appropriately represented using
     * comma concatenation. For such headers, use header() instead
     * and supply your own delimiter when concatenating.
     *
     * If the header does not appear in the message, this method MUST return
     * an empty string.
     *
     * @public
     * @param {string} name Case-insensitive header field name.
     * @return {string} A string of values as provided for the given header
     *    concatenated together using a comma. If the header does not appear in
     *    the message, this method MUST return an empty string.
     */
    headerLine(name) {
        return this.header(name).join(",");
    }

    /**
     * Return an instance with the provided value replacing the specified header.
     *
     * While header names are case-insensitive, the casing of the header will
     * be preserved by this function.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * new and/or updated header and value.
     *
     * @public
     * @param {string} name Case-insensitive header field name.
     * @param {(string|Array.<string>)} value Header value(s).
     * @return {Message} Message instance with given header.
     * @throws {TypeError} For invalid header names or values.
     */
    withHeader(name, value) {
        const values = Array.isArray(value) ? value : [value];

        if (values.join(",") === this.headerLine(name)) {
            return this;
        }

        const headers = new HeaderCollection(Object.entries(this.headers));
        headers.set(name, values);

        return this.createMessage(
            this.protocolVersion,
            headers,
            this.body
        );
    }

    /**
     * Return an instance with the specified header appended with the given value.
     *
     * Existing values for the specified header will be maintained. The new
     * value(s) will be appended to the existing list. If the header did not
     * exist previously, it will be added.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * new header and/or value.
     *
     * @public
     * @param {string} name Case-insensitive header field name to add.
     * @param {string|Array.<string>} value Header value(s).
     * @return {Message} Message instance with added header.
     * @throws {TypeError} For invalid header names or values.
     */
    withAddedHeader(name, value) {
        const headers = new HeaderCollection(Object.entries(this.headers));
        headers.add(name, value);

        return this.createMessage(
            this.protocolVersion,
            headers,
            this.body
        );
    }

    /**
     * Return an instance without the specified header.
     *
     * Header resolution MUST be done without case-sensitivity.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that removes
     * the named header.
     *
     * @public
     * @param {string} name Case-insensitive header field name to remove.
     * @return {Message} Message instance without given header.
     */
    withoutHeader(name) {
        if (!this.hasHeader(name)) {
            return this;
        }

        const headers = new HeaderCollection(Object.entries(this.headers));
        headers.remove(name);

        return this.createMessage(
            this.protocolVersion,
            headers,
            this.body
        );
    }

    /**
     * Gets the body of the message.
     *
     * @public
     * @return {(stream.Readable|stream.Writable)} Returns the body as a stream.
     */
    get body() {
        return this._body;
    }

    /**
     * Return an instance with the specified message body.
     *
     * The body MUST be a stream object.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return a new instance that has the
     * new body stream.
     *
     * @public
     * @param {(stream.Readable|stream.Writable)} body Body.
     * @return {Message} Message instance with given body.
     * @throws {TypeError} When the body is not valid.
     */
    withBody(body) {
        if (body === this.body) {
            return this;
        }

        return this.createMessage(
            this.protocolVersion,
            this._headers,
            body
        );
    }

    /**
     * Create a new instance of this class.
     *
     * Separating this into an overridable method enables extending classes
     * with non compatible constructors to create their instances here.
     *
     * @protected
     * @param {string} protocolVersion HTTP protocol version.
     * @param {HeaderCollection} headers Message headers.
     * @param {(stream.Readable|stream.Writable)} body Message body.
     * @return {Message} New message instance.
     */
    createMessage(protocolVersion, headers, body) {
        return new Message(protocolVersion, headers, body);
    }
}

export default Message;
