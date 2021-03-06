/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import HeaderCollection from "./HeaderCollection.js";
import Message from "./Message.js";
import { reasonPhrases } from "./ResponseStatus.js";

/**
 * Representation of an outgoing, server-side response.
 *
 * Per the HTTP specification, this interface includes properties for
 * each of the following:
 *
 * - Protocol version
 * - Status code and reason phrase
 * - Headers
 * - Message body
 *
 * Responses are considered immutable; all methods that might change state MUST
 * be implemented such that they retain the internal state of the current
 * message and return an instance that contains the changed state.
 */
class Response extends Message {
    /**
     * Create a new response instance.
     *
     * @public
     * @param {ResponseStatus} statusCode Response status code.
     * @param {string} protocolVersion HTTP protocol version.
     * @param {HeaderCollection} headers Message headers.
     * @param {stream.Writable} body Message body.
     * @param {?string} reasonPhrase Response reason phrase.
     */
    constructor(statusCode, protocolVersion, headers, body, reasonPhrase) {
        super(protocolVersion, headers, body);

        /**
         * Response status code.
         *
         * @private
         * @type {ResponseStatus}
         */
        this._statusCode = statusCode;

        /**
         * Response reason phrase.
         *
         * @private
         * @type {?string}
         */
        this._reasonPhrase = reasonPhrase;
    }

    /**
     * Gets the response status code.
     *
     * The status code is a 3-digit integer result code of the server's attempt
     * to understand and satisfy the request.
     *
     * @public
     * @return {ResponseStatus} Response status code.
     */
    get statusCode() {
        return this._statusCode;
    }

    /**
     * Gets the response reason phrase associated with the status code.
     *
     * Because a reason phrase is not a required element in a response
     * status line, the reason phrase value MAY be empty. Implementations MAY
     * choose to return the default RFC 7231 recommended reason phrase (or those
     * listed in the IANA HTTP Status Code Registry) for the response's
     * status code.
     *
     * @see http://tools.ietf.org/html/rfc7231#section-6
     * @see http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
     *
     * @public
     * @return {string} Reason phrase; must return an empty string if none present.
     */
    get reasonPhrase() {
        return this._reasonPhrase || reasonPhrases[this.statusCode];
    }

    /**
     * Return an instance with the specified status code and, optionally, reason phrase.
     *
     * If no reason phrase is specified, implementations MAY choose to default
     * to the RFC 7231 or IANA recommended reason phrase for the response's
     * status code.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * updated status and reason phrase.
     *
     * @see http://tools.ietf.org/html/rfc7231#section-6
     * @see http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
     *
     * @public
     * @param {ResponseStatus} code The 3-digit integer result code to set.
     * @param {?string} reasonPhrase The reason phrase to use with the
     *     provided status code; if none is provided, implementations MAY
     *     use the defaults as suggested in the HTTP specification.
     * @return {Response} Response instance with given status and reason phrase.
     * @throws {TypeError} For invalid status code arguments.
     */
    withStatus(code, reasonPhrase) {
        if (code === this.statusCode && reasonPhrase  === this._reasonPhrase) {
            return this;
        }

        return new Response(
            code,
            this.protocolVersion,
            this._headers,
            this.body,
            reasonPhrase || this._reasonPhrase
        );
    }

    /**
     * @inheritdoc
     */
    createMessage(protocolVersion, headers, body) {
        return new Response(this.statusCode, protocolVersion, headers, body, this._reasonPhrase);
    }
}

export default Response;
