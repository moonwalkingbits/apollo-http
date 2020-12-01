/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Duplex } from "stream";

declare type Readable = import("stream").Readable;
declare type Writable = import("stream").Writable;

/**
 * A specialized collection of HTTP headers.
 */
declare class HeaderCollection {
    /**
     * Create a new collection instance.
     *
     * @param headers Initial set of headers.
     */
    public constructor(headers?: {[name: string]: Array<string>});

    /**
     * Retrieve all headers.
     *
     * @return Header names and values.
     */
    public all(): {[name: string]: Array<string>};

    /**
     * Determine if a header exists in the collection.
     *
     * @param name Name of header to check.
     * @return True if the header exists in the collection.
     */
    public has(name: string): boolean;

    /**
     * Retrieve header values.
     *
     * @param name Header name.
     * @return List of header values.
     */
    public get(name: string): Array<string>;

    /**
     * Set the header value(s).
     *
     * @param name Header name.
     * @param value Header value to override any existing value.
     */
    public set(name: string, value: string | Array<string>): void;

    /**
     * Add value(s) to the list of header values.
     *
     * If the header doesn't exist it will be created.
     *
     * @param name Header name.
     * @param Header value(s) to be added.
     */
    public add(name: string, value: string | Array<string>): void;

    /**
     * Remove the header and its values from the collection.
     *
     * @param name Header name.
     */
    remove(name: string): void;
}

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
declare interface MessageInterface {
    /**
     * Retrieves the HTTP protocol version as a string.
     *
     * The string MUST contain only the HTTP version number (e.g., "1.1", "1.0").
     *
     * @return HTTP protocol version.
     */
    getProtocolVersion(): string;

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
     * @param protocolVersion HTTP protocol version
     * @return Message instance with given protocol version.
     */
    withProtocolVersion(protocolVersion: string): Message;

    /**
     * Retrieves all message header values.
     *
     * The keys represent the header name as it will be sent over the wire, and
     * each value is an array of strings associated with the header.
     *
     * While header names are not case-sensitive, getHeaders() will preserve the
     * exact case in which headers were originally specified.
     *
     * @return Returns an object of the message's headers.
     *     Each key MUST be a header name, and each value MUST be an array of
     *     strings for that header.
     */
    getHeaders(): {[name: string]: Array<string>};

    /**
     * Checks if a header exists by the given case-insensitive name.
     *
     * @param name Case-insensitive header field name.
     * @return Returns true if any header names match the given header
     *     name using a case-insensitive string comparison. Returns false if
     *     no matching header name is found in the message.
     */
    hasHeader(name: string): boolean;

    /**
     * Retrieves a message header value by the given case-insensitive name.
     *
     * This method returns an array of all the header values of the given
     * case-insensitive header name.
     *
     * If the header does not appear in the message, this method MUST return an
     * empty array.
     *
     * @param name Case-insensitive header field name.
     * @return An array of string values as provided for the given
     *    header. If the header does not appear in the message, this method MUST
     *    return an empty array.
     */
    getHeader(name: string): Array<string>;

    /**
     * Retrieves a comma-separated string of the values for a single header.
     *
     * This method returns all of the header values of the given
     * case-insensitive header name as a string concatenated together using
     * a comma.
     *
     * NOTE: Not all header values may be appropriately represented using
     * comma concatenation. For such headers, use getHeader() instead
     * and supply your own delimiter when concatenating.
     *
     * If the header does not appear in the message, this method MUST return
     * an empty string.
     *
     * @param name Case-insensitive header field name.
     * @return A string of values as provided for the given header
     *    concatenated together using a comma. If the header does not appear in
     *    the message, this method MUST return an empty string.
     */
    getHeaderLine(name: string): string;

    /**
     * Return an instance with the provided value replacing the specified header.
     *
     * While header names are case-insensitive, the casing of the header will
     * be preserved by this function, and returned from getHeaders().
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * new and/or updated header and value.
     *
     * @param name Case-insensitive header field name.
     * @param value Header value(s).
     * @return Message instance with given header.
     * @throws {TypeError} For invalid header names or values.
     */
    withHeader(name: string, value: string | Array<string>): Message;

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
     * @param name Case-insensitive header field name to add.
     * @param value Header value(s).
     * @return Message instance with added header.
     * @throws {TypeError} For invalid header names or values.
     */
    withAddedHeader(name: string, value: string | Array<string>): Message;

    /**
     * Return an instance without the specified header.
     *
     * Header resolution MUST be done without case-sensitivity.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that removes
     * the named header.
     *
     * @param name Case-insensitive header field name to remove.
     * @return Message instance without given header.
     */
    withoutHeader(name: string): Message;

    /**
     * Gets the body of the message.
     *
     * @return Returns the body as a stream.
     */
    getBody(): Readable | Writable;

    /**
     * Return an instance with the specified message body.
     *
     * The body MUST be a stream object.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return a new instance that has the
     * new body stream.
     *
     * @param body Body.
     * @return Message instance with body.
     * @throws {TypeError} When the body is not valid.
     */
    withBody(body: Readable | Writable): Message;
}

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
declare class Message implements MessageInterface {
    /**
     * Create a new message instance.
     *
     * @param protocolVersion HTTP protocol version.
     * @param headers Message headers.
     * @param body Message body.
     */
    public constructor(protocolVersion: string, headers: HeaderCollection, body: Readable | Writable);

    /**
     * Retrieves the HTTP protocol version as a string.
     *
     * The string MUST contain only the HTTP version number (e.g., "1.1", "1.0").
     *
     * @return HTTP protocol version.
     */
    public getProtocolVersion(): string;

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
     * @param protocolVersion HTTP protocol version
     * @return Message instance with given protocol version.
     */
    public withProtocolVersion(protocolVersion: string): Message;

    /**
     * Retrieves all message header values.
     *
     * The keys represent the header name as it will be sent over the wire, and
     * each value is an array of strings associated with the header.
     *
     * While header names are not case-sensitive, getHeaders() will preserve the
     * exact case in which headers were originally specified.
     *
     * @return Returns an object of the message's headers.
     *     Each key MUST be a header name, and each value MUST be an array of
     *     strings for that header.
     */
    public getHeaders(): {[name: string]: Array<string>};

    /**
     * Checks if a header exists by the given case-insensitive name.
     *
     * @param name Case-insensitive header field name.
     * @return Returns true if any header names match the given header
     *     name using a case-insensitive string comparison. Returns false if
     *     no matching header name is found in the message.
     */
    public hasHeader(name: string): boolean;

    /**
     * Retrieves a message header value by the given case-insensitive name.
     *
     * This method returns an array of all the header values of the given
     * case-insensitive header name.
     *
     * If the header does not appear in the message, this method MUST return an
     * empty array.
     *
     * @param name Case-insensitive header field name.
     * @return An array of string values as provided for the given
     *    header. If the header does not appear in the message, this method MUST
     *    return an empty array.
     */
    public getHeader(name: string): Array<string>;

    /**
     * Retrieves a comma-separated string of the values for a single header.
     *
     * This method returns all of the header values of the given
     * case-insensitive header name as a string concatenated together using
     * a comma.
     *
     * NOTE: Not all header values may be appropriately represented using
     * comma concatenation. For such headers, use getHeader() instead
     * and supply your own delimiter when concatenating.
     *
     * If the header does not appear in the message, this method MUST return
     * an empty string.
     *
     * @param name Case-insensitive header field name.
     * @return A string of values as provided for the given header
     *    concatenated together using a comma. If the header does not appear in
     *    the message, this method MUST return an empty string.
     */
    public getHeaderLine(name: string): string;

    /**
     * Return an instance with the provided value replacing the specified header.
     *
     * While header names are case-insensitive, the casing of the header will
     * be preserved by this function, and returned from getHeaders().
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * new and/or updated header and value.
     *
     * @param name Case-insensitive header field name.
     * @param value Header value(s).
     * @return Message instance with given header.
     * @throws {TypeError} For invalid header names or values.
     */
    public withHeader(name: string, value: string | Array<string>): Message;

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
     * @param name Case-insensitive header field name to add.
     * @param value Header value(s).
     * @return Message instance with added header.
     * @throws {TypeError} For invalid header names or values.
     */
    public withAddedHeader(name: string, value: string | Array<string>): Message;

    /**
     * Return an instance without the specified header.
     *
     * Header resolution MUST be done without case-sensitivity.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that removes
     * the named header.
     *
     * @param name Case-insensitive header field name to remove.
     * @return Message instance without given header.
     */
    public withoutHeader(name: string): Message;

    /**
     * Gets the body of the message.
     *
     * @return Returns the body as a stream.
     */
    public getBody(): Readable | Writable;

    /**
     * Return an instance with the specified message body.
     *
     * The body MUST be a stream object.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return a new instance that has the
     * new body stream.
     *
     * @param body Body.
     * @return Message instance with given body.
     * @throws {TypeError} When the body is not valid.
     */
    public withBody(body: Readable | Writable): Message;
}

/**
 * Interface representing a URL.
 */
declare interface UrlInterface {
    /**
     * Retrieve the scheme component of the URL.
     *
     * If no scheme is present, this method MUST return an empty string.
     *
     * The value returned MUST be normalized to lowercase, per RFC 3986
     * Section 3.1.
     *
     * The trailing ":" character is not part of the scheme and MUST NOT be
     * added.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-3.1
     * @return The URL scheme.
     */
    getScheme(): string;

    /**
     * Retrieve the authority component of the URL.
     *
     * If no authority information is present, this method MUST return an empty
     * string.
     *
     * The authority syntax of the URL is:
     *
     * <pre>
     * [user-info@]host[:port]
     * </pre>
     *
     * If the port component is not set or is the standard port for the current
     * scheme, it SHOULD NOT be included.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-3.2
     * @return The URL authority, in "[user-info@]host[:port]" format.
     */
    getAuthority(): string;

    /**
     * Retrieve the user information component of the URL.
     *
     * If no user information is present, this method MUST return an empty
     * string.
     *
     * If a user is present in the URL, this will return that value;
     * additionally, if the password is also present, it will be appended to the
     * user value, with a colon (":") separating the values.
     *
     * The trailing "@" character is not part of the user information and MUST
     * NOT be added.
     *
     * @return The URL user information, in "username[:password]" format.
     */
    getUserInfo(): string;

    /**
     * Retrieve the host component of the URL.
     *
     * If no host is present, this method MUST return an empty string.
     *
     * The value returned MUST be normalized to lowercase, per RFC 3986
     * Section 3.2.2.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-3.2.2
     * @return The URL host.
     */
    getHost(): string;

    /**
     * Retrieve the port component of the URL.
     *
     * If a port is present, and it is non-standard for the current scheme,
     * this method MUST return it as an integer. If the port is the standard port
     * used with the current scheme, this method SHOULD return null.
     *
     * If no port is present, and no scheme is present, this method MUST return
     * a null value.
     *
     * If no port is present, but a scheme is present, this method MAY return
     * the standard port for that scheme, but SHOULD return null.
     *
     * @return The URL port.
     */
    getPort(): number | null;

    /**
     * Retrieve the path component of the URL.
     *
     * The path can either be empty or absolute (starting with a slash) or
     * rootless (not starting with a slash). Implementations MUST support all
     * three syntaxes.
     *
     * Normally, the empty path "" and absolute path "/" are considered equal as
     * defined in RFC 7230 Section 2.7.3. But this method MUST NOT automatically
     * do this normalization because in contexts with a trimmed base path, e.g.
     * the front controller, this difference becomes significant. It's the task
     * of the user to handle both "" and "/".
     *
     * The value returned MUST be percent-encoded, but MUST NOT double-encode
     * any characters. To determine what characters to encode, please refer to
     * RFC 3986, Sections 2 and 3.3.
     *
     * As an example, if the value should include a slash ("/") not intended as
     * delimiter between path segments, that value MUST be passed in encoded
     * form (e.g., "%2F") to the instance.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-2
     * @see https://tools.ietf.org/html/rfc3986#section-3.3
     * @return The URL path.
     */
    getPath(): string;

    /**
     * Retrieve the query string of the URL.
     *
     * If no query string is present, this method MUST return an empty string.
     *
     * The leading "?" character is not part of the query and MUST NOT be
     * added.
     *
     * The value returned MUST be percent-encoded, but MUST NOT double-encode
     * any characters. To determine what characters to encode, please refer to
     * RFC 3986, Sections 2 and 3.4.
     *
     * As an example, if a value in a key/value pair of the query string should
     * include an ampersand ("&") not intended as a delimiter between values,
     * that value MUST be passed in encoded form (e.g., "%26") to the instance.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-2
     * @see https://tools.ietf.org/html/rfc3986#section-3.4
     * @return The URL query string.
     */
    getQuery(): string;

    /**
     * Retrieve the fragment component of the URL.
     *
     * If no fragment is present, this method MUST return an empty string.
     *
     * The leading "#" character is not part of the fragment and MUST NOT be
     * added.
     *
     * The value returned MUST be percent-encoded, but MUST NOT double-encode
     * any characters. To determine what characters to encode, please refer to
     * RFC 3986, Sections 2 and 3.5.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-2
     * @see https://tools.ietf.org/html/rfc3986#section-3.5
     * @return The URL fragment.
     */
    getFragment(): string;

    /**
     * Return an instance with the specified scheme.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified scheme.
     *
     * Implementations MUST support the schemes "http" and "https" case
     * insensitively, and MAY accommodate other schemes if required.
     *
     * An empty scheme is equivalent to removing the scheme.
     *
     * @param scheme The scheme to use with the new instance.
     * @return A URL instance with the specified scheme.
     * @throws For invalid or unsupported schemes.
     */
    withScheme(scheme: string): Url;

    /**
     * Return an instance with the specified user information.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified user information.
     *
     * Password is optional, but the user information MUST include the
     * user; an empty string for the user is equivalent to removing user
     * information.
     *
     * @param user The user name to use for authority.
     * @param password The password associated with $user.
     * @return A URL instance with the specified user information.
     */
    withUserInfo(user: string, password?: string): Url;

    /**
     * Return an instance with the specified host.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified host.
     *
     * An empty host value is equivalent to removing the host.
     *
     * @param host The hostname to use with the new instance.
     * @return A URL instance with the specified host.
     * @throws {TypeError} For invalid hostnames.
     */
    withHost(host: string): Url;

    /**
     * Return an instance with the specified port.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified port.
     *
     * Implementations MUST raise an exception for ports outside the
     * established TCP and UDP port ranges.
     *
     * A null value provided for the port is equivalent to removing the port
     * information.
     *
     * @param port The port to use with the new instance; a null value
     *     removes the port information.
     * @return A URL instance with the specified port.
     * @throws {TypeError} For invalid ports.
     */
    withPort(port: number | null): Url;

    /**
     * Return an instance with the specified path.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified path.
     *
     * The path can either be empty or absolute (starting with a slash) or
     * rootless (not starting with a slash). Implementations MUST support all
     * three syntaxes.
     *
     * If an HTTP path is intended to be host-relative rather than path-relative
     * then it must begin with a slash ("/"). HTTP paths not starting with a slash
     * are assumed to be relative to some base path known to the application or
     * consumer.
     *
     * Users can provide both encoded and decoded path characters.
     * Implementations ensure the correct encoding as outlined in getPath().
     *
     * @param path The path to use with the new instance.
     * @return A URL instance with the specified path.
     * @throws {TypeError} For invalid paths.
     */
    withPath(path: string): Url;

    /**
     * Return an instance with the specified query string.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified query string.
     *
     * Users can provide both encoded and decoded query characters.
     * Implementations ensure the correct encoding as outlined in getQuery().
     *
     * An empty query string value is equivalent to removing the query string.
     *
     * @param query The query string to use with the new instance.
     * @return A URL instance with the specified query string.
     * @throws {TypeError} For invalid query strings.
     */
    withQuery(query: string): Url;

    /**
     * Return an instance with the specified URL fragment.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified URL fragment.
     *
     * Users can provide both encoded and decoded fragment characters.
     * Implementations ensure the correct encoding as outlined in getFragment().
     *
     * An empty fragment value is equivalent to removing the fragment.
     *
     * @param fragment The fragment to use with the new instance.
     * @return A URL instance with the specified fragment.
     */
    withFragment(fragment: string): Url;

    /**
     * Return the string representation as a URL reference.
     *
     * Depending on which components of the URL are present, the resulting
     * string is either a full URL or relative reference according to RFC 3986,
     * Section 4.1. The method concatenates the various components of the URL,
     * using the appropriate delimiters:
     *
     * - If a scheme is present, it MUST be suffixed by ":".
     * - If an authority is present, it MUST be prefixed by "//".
     * - The path can be concatenated without delimiters. But there are two
     *   cases where the path has to be adjusted to make the URL reference
     *   valid as PHP does not allow to throw an exception in __toString():
     *     - If the path is rootless and an authority is present, the path MUST
     *       be prefixed by "/".
     *     - If the path is starting with more than one "/" and no authority is
     *       present, the starting slashes MUST be reduced to one.
     * - If a query is present, it MUST be prefixed by "?".
     * - If a fragment is present, it MUST be prefixed by "#".
     *
     * @see http://tools.ietf.org/html/rfc3986#section-4.1
     * @return A string representation of the URL.
     */
    toString(): string;
}

/**
 * Class representing a URL.
 */
declare class Url implements UrlInterface {
    /**
     * Create a new URL instance.
     *
     * @param scheme Url scheme.
     * @param user User of the authority component.
     * @param password Password of the authority component.
     * @param host Url host.
     * @param port Url port.
     * @param path Url path.
     * @param query Url query.
     * @param fragment Url fragment.
     */
    public constructor(
        scheme?: string,
        user?: string,
        password?: string,
        host?: string,
        port?: number,
        path?: string,
        query?: string,
        fragment?: string
    );

    /**
     * Retrieve the scheme component of the URL.
     *
     * If no scheme is present, this method MUST return an empty string.
     *
     * The value returned MUST be normalized to lowercase, per RFC 3986
     * Section 3.1.
     *
     * The trailing ":" character is not part of the scheme and MUST NOT be
     * added.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-3.1
     * @return The URL scheme.
     */
    public getScheme(): string;

    /**
     * Retrieve the authority component of the URL.
     *
     * If no authority information is present, this method MUST return an empty
     * string.
     *
     * The authority syntax of the URL is:
     *
     * <pre>
     * [user-info@]host[:port]
     * </pre>
     *
     * If the port component is not set or is the standard port for the current
     * scheme, it SHOULD NOT be included.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-3.2
     * @return The URL authority, in "[user-info@]host[:port]" format.
     */
    public getAuthority(): string;

    /**
     * Retrieve the user information component of the URL.
     *
     * If no user information is present, this method MUST return an empty
     * string.
     *
     * If a user is present in the URL, this will return that value;
     * additionally, if the password is also present, it will be appended to the
     * user value, with a colon (":") separating the values.
     *
     * The trailing "@" character is not part of the user information and MUST
     * NOT be added.
     *
     * @return The URL user information, in "username[:password]" format.
     */
    public getUserInfo(): string;

    /**
     * Retrieve the host component of the URL.
     *
     * If no host is present, this method MUST return an empty string.
     *
     * The value returned MUST be normalized to lowercase, per RFC 3986
     * Section 3.2.2.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-3.2.2
     * @return The URL host.
     */
    public getHost(): string;

    /**
     * Retrieve the port component of the URL.
     *
     * If a port is present, and it is non-standard for the current scheme,
     * this method MUST return it as an integer. If the port is the standard port
     * used with the current scheme, this method SHOULD return null.
     *
     * If no port is present, and no scheme is present, this method MUST return
     * a null value.
     *
     * If no port is present, but a scheme is present, this method MAY return
     * the standard port for that scheme, but SHOULD return null.
     *
     * @return The URL port.
     */
    public getPort(): number | null;

    /**
     * Retrieve the path component of the URL.
     *
     * The path can either be empty or absolute (starting with a slash) or
     * rootless (not starting with a slash). Implementations MUST support all
     * three syntaxes.
     *
     * Normally, the empty path "" and absolute path "/" are considered equal as
     * defined in RFC 7230 Section 2.7.3. But this method MUST NOT automatically
     * do this normalization because in contexts with a trimmed base path, e.g.
     * the front controller, this difference becomes significant. It's the task
     * of the user to handle both "" and "/".
     *
     * The value returned MUST be percent-encoded, but MUST NOT double-encode
     * any characters. To determine what characters to encode, please refer to
     * RFC 3986, Sections 2 and 3.3.
     *
     * As an example, if the value should include a slash ("/") not intended as
     * delimiter between path segments, that value MUST be passed in encoded
     * form (e.g., "%2F") to the instance.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-2
     * @see https://tools.ietf.org/html/rfc3986#section-3.3
     * @return The URL path.
     */
    public getPath(): string;

    /**
     * Retrieve the query string of the URL.
     *
     * If no query string is present, this method MUST return an empty string.
     *
     * The leading "?" character is not part of the query and MUST NOT be
     * added.
     *
     * The value returned MUST be percent-encoded, but MUST NOT double-encode
     * any characters. To determine what characters to encode, please refer to
     * RFC 3986, Sections 2 and 3.4.
     *
     * As an example, if a value in a key/value pair of the query string should
     * include an ampersand ("&") not intended as a delimiter between values,
     * that value MUST be passed in encoded form (e.g., "%26") to the instance.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-2
     * @see https://tools.ietf.org/html/rfc3986#section-3.4
     * @return The URL query string.
     */
    public getQuery(): string;

    /**
     * Retrieve the fragment component of the URL.
     *
     * If no fragment is present, this method MUST return an empty string.
     *
     * The leading "#" character is not part of the fragment and MUST NOT be
     * added.
     *
     * The value returned MUST be percent-encoded, but MUST NOT double-encode
     * any characters. To determine what characters to encode, please refer to
     * RFC 3986, Sections 2 and 3.5.
     *
     * @see https://tools.ietf.org/html/rfc3986#section-2
     * @see https://tools.ietf.org/html/rfc3986#section-3.5
     * @return The URL fragment.
     */
    public getFragment(): string;

    /**
     * Return an instance with the specified scheme.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified scheme.
     *
     * Implementations MUST support the schemes "http" and "https" case
     * insensitively, and MAY accommodate other schemes if required.
     *
     * An empty scheme is equivalent to removing the scheme.
     *
     * @param scheme The scheme to use with the new instance.
     * @return A URL instance with the specified scheme.
     * @throws For invalid or unsupported schemes.
     */
    public withScheme(scheme: string): Url;

    /**
     * Return an instance with the specified user information.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified user information.
     *
     * Password is optional, but the user information MUST include the
     * user; an empty string for the user is equivalent to removing user
     * information.
     *
     * @param user The user name to use for authority.
     * @param password The password associated with $user.
     * @return A URL instance with the specified user information.
     */
    public withUserInfo(user: string, password?: string): Url;

    /**
     * Return an instance with the specified host.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified host.
     *
     * An empty host value is equivalent to removing the host.
     *
     * @param host The hostname to use with the new instance.
     * @return A URL instance with the specified host.
     * @throws {TypeError} For invalid hostnames.
     */
    public withHost(host: string): Url;

    /**
     * Return an instance with the specified port.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified port.
     *
     * Implementations MUST raise an exception for ports outside the
     * established TCP and UDP port ranges.
     *
     * A null value provided for the port is equivalent to removing the port
     * information.
     *
     * @param port The port to use with the new instance; a null value
     *     removes the port information.
     * @return A URL instance with the specified port.
     * @throws {TypeError} For invalid ports.
     */
    public withPort(port: number | null): Url;

    /**
     * Return an instance with the specified path.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified path.
     *
     * The path can either be empty or absolute (starting with a slash) or
     * rootless (not starting with a slash). Implementations MUST support all
     * three syntaxes.
     *
     * If an HTTP path is intended to be host-relative rather than path-relative
     * then it must begin with a slash ("/"). HTTP paths not starting with a slash
     * are assumed to be relative to some base path known to the application or
     * consumer.
     *
     * Users can provide both encoded and decoded path characters.
     * Implementations ensure the correct encoding as outlined in getPath().
     *
     * @param path The path to use with the new instance.
     * @return A URL instance with the specified path.
     * @throws {TypeError} For invalid paths.
     */
     public withPath(path: string): Url;

    /**
     * Return an instance with the specified query string.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified query string.
     *
     * Users can provide both encoded and decoded query characters.
     * Implementations ensure the correct encoding as outlined in getQuery().
     *
     * An empty query string value is equivalent to removing the query string.
     *
     * @param query The query string to use with the new instance.
     * @return A URL instance with the specified query string.
     * @throws {TypeError} For invalid query strings.
     */
    public withQuery(query: string): Url;

    /**
     * Return an instance with the specified URL fragment.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified URL fragment.
     *
     * Users can provide both encoded and decoded fragment characters.
     * Implementations ensure the correct encoding as outlined in getFragment().
     *
     * An empty fragment value is equivalent to removing the fragment.
     *
     * @param fragment The fragment to use with the new instance.
     * @return A URL instance with the specified fragment.
     */
    public withFragment(fragment: string): Url;

    /**
     * Return the string representation as a URL reference.
     *
     * Depending on which components of the URL are present, the resulting
     * string is either a full URL or relative reference according to RFC 3986,
     * Section 4.1. The method concatenates the various components of the URL,
     * using the appropriate delimiters:
     *
     * - If a scheme is present, it MUST be suffixed by ":".
     * - If an authority is present, it MUST be prefixed by "//".
     * - The path can be concatenated without delimiters. But there are two
     *   cases where the path has to be adjusted to make the URL reference
     *   valid as PHP does not allow to throw an exception in __toString():
     *     - If the path is rootless and an authority is present, the path MUST
     *       be prefixed by "/".
     *     - If the path is starting with more than one "/" and no authority is
     *       present, the starting slashes MUST be reduced to one.
     * - If a query is present, it MUST be prefixed by "?".
     * - If a fragment is present, it MUST be prefixed by "#".
     *
     * @see http://tools.ietf.org/html/rfc3986#section-4.1
     * @return A string representation of the URL.
     */
    public toString(): string;
}

/**
 * Has the ability to create URLs.
 */
declare interface UrlFactoryInterface {
    /**
     * Create a new URL.
     *
     * @param url The URL to parse.
     * @returns A URL instance representing the given URL.
     * @throws {TypeError} If the given URL cannot be parsed.
     */
    createUrl(urlString: string): Url;
}

/**
 * Has the ability to create URLs.
 */
declare class UrlFactory implements UrlFactoryInterface {
    /**
     * Create a new URL factory instance;
     */
    public constructor();

    /**
     * Create a new URL.
     *
     * @param url The URL to parse.
     * @returns A URL instance representing the given URL.
     * @throws {TypeError} If the given URL cannot be parsed.
     */
    public createUrl(urlString: string): Url;
}

/**
 * Represents a fixed set of request methods.
 *
 * @readonly
 * @enum {string}
 */
declare enum RequestMethod {
    OPTIONS = "OPTIONS",
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    TRACE = "TRACE",
    CONNECT = "CONNECT"
}

/**
 * Representation of an outgoing, client-side request.
 *
 * Per the HTTP specification, this interface includes properties for
 * each of the following:
 *
 * - Protocol version
 * - HTTP method
 * - URL
 * - Headers
 * - Message body
 *
 * During construction, implementations MUST attempt to set the Host header from
 * a provided URL if no Host header is provided.
 *
 * Requests are considered immutable; all methods that might change state MUST
 * be implemented such that they retain the internal state of the current
 * message and return an instance that contains the changed state.
 */
declare interface RequestInterface extends MessageInterface {
    /**
     * Retrieves the message's request target.
     *
     * Retrieves the message's request-target either as it will appear (for
     * clients), as it appeared at request (for servers), or as it was
     * specified for the instance (see withRequestTarget()).
     *
     * In most cases, this will be the origin-form of the composed URL,
     * unless a value was provided to the concrete implementation (see
     * withRequestTarget() below).
     *
     * If no URL is available, and no request-target has been specifically
     * provided, this method MUST return the string "/".
     *
     * @return Request method.
     */
    getMethod(): RequestMethod;

    /**
     * Return an instance with the provided HTTP method.
     *
     * While HTTP method names are typically all uppercase characters, HTTP
     * method names are case-sensitive and thus implementations SHOULD NOT
     * modify the given string.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * changed request method.
     *
     * @param method Case-sensitive method.
     * @return Request instance with given method.
     */
    withMethod(method: RequestMethod): Request;

    /**
     * Retrieves the URL instance.
     *
     * This method MUST return a Url instance.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-4.3
     * @return A Url instance representing the URL of the request.
     */
    getUrl(): Url;

    /**
     * Returns an instance with the provided URL.
     *
     * This method MUST update the Host header of the returned request by
     * default if the URL contains a host component. If the URL does not
     * contain a host component, any pre-existing Host header MUST be carried
     * over to the returned request.
     *
     * You can opt-in to preserving the original state of the Host header by
     * setting `preserveHost` to `true`. When `preserveHost` is set to
     * `true`, this method interacts with the Host header in the following ways:
     *
     * - If the Host header is missing or empty, and the new URL contains
     *   a host component, this method MUST update the Host header in the returned
     *   request.
     * - If the Host header is missing or empty, and the new URL does not contain a
     *   host component, this method MUST NOT update the Host header in the returned
     *   request.
     * - If a Host header is present and non-empty, this method MUST NOT update
     *   the Host header in the returned request.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * new UrlInterface instance.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-4.3
     * @param url New request URL to use.
     * @param preserveHost Preserve the original state of the Host header.
     * @return Request instance with given url.
     */
    withUrl(url: Url, preserveHost?: boolean): Request;

    /**
     * Retrieves the message's request target.
     *
     * Retrieves the message's request-target either as it will appear (for
     * clients), as it appeared at request (for servers), or as it was
     * specified for the instance (see withRequestTarget()).
     *
     * In most cases, this will be the origin-form of the composed URL,
     * unless a value was provided to the concrete implementation (see
     * withRequestTarget() below).
     *
     * If no URL is available, and no request-target has been specifically
     * provided, this method MUST return the string "/".
     *
     * @return Request target.
     */
    getRequestTarget(): string;

    /**
     * Return an instance with the specific request-target.
     *
     * If the request needs a non-origin-form request-target — e.g., for
     * specifying an absolute-form, authority-form, or asterisk-form —
     * this method may be used to create an instance with the specified
     * request-target, verbatim.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * changed request target.
     *
     * @see http://tools.ietf.org/html/rfc7230#section-5.3 (for the various
     *     request-target forms allowed in request messages)
     * @param requestTarget Request target.
     * @return Request instance with given request target.
     */
    withRequestTarget(requestTarget: string): Request;
}

/**
 * Representation of an outgoing, client-side request.
 *
 * Per the HTTP specification, this interface includes properties for
 * each of the following:
 *
 * - Protocol version
 * - HTTP method
 * - URL
 * - Headers
 * - Message body
 *
 * During construction, implementations MUST attempt to set the Host header from
 * a provided URL if no Host header is provided.
 *
 * Requests are considered immutable; all methods that might change state MUST
 * be implemented such that they retain the internal state of the current
 * message and return an instance that contains the changed state.
 */
declare class Request extends Message implements RequestInterface {
    /**
     * Create a new request instance.
     *
     * @param method Request method.
     * @param url URL of the request.
     * @param protocolVersion HTTP protocol version.
     * @param headers Message headers.
     * @param body Message body.
     * @param target Request target.
     * @param shouldAddHostHeader Whether to determine host header from the URL.
     */
    public constructor(
        method: RequestMethod,
        url: UrlInterface,
        protocolVersion: string,
        headers: HeaderCollection,
        body: Readable,
        target?: string,
        shouldAddHostHeader?: boolean
    );

    /**
     * Retrieves the message's request target.
     *
     * Retrieves the message's request-target either as it will appear (for
     * clients), as it appeared at request (for servers), or as it was
     * specified for the instance (see withRequestTarget()).
     *
     * In most cases, this will be the origin-form of the composed URL,
     * unless a value was provided to the concrete implementation (see
     * withRequestTarget() below).
     *
     * If no URL is available, and no request-target has been specifically
     * provided, this method MUST return the string "/".
     *
     * @return Request method.
     */
    public getMethod(): RequestMethod;

    /**
     * Return an instance with the provided HTTP method.
     *
     * While HTTP method names are typically all uppercase characters, HTTP
     * method names are case-sensitive and thus implementations SHOULD NOT
     * modify the given string.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * changed request method.
     *
     * @param method Case-sensitive method.
     * @return Request instance with given method.
     */
    public withMethod(method: RequestMethod): Request;

    /**
     * Retrieves the URL instance.
     *
     * This method MUST return a Url instance.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-4.3
     * @return A Url instance representing the URL of the request.
     */
    public getUrl(): Url;

    /**
     * Returns an instance with the provided URL.
     *
     * This method MUST update the Host header of the returned request by
     * default if the URL contains a host component. If the URL does not
     * contain a host component, any pre-existing Host header MUST be carried
     * over to the returned request.
     *
     * You can opt-in to preserving the original state of the Host header by
     * setting `preserveHost` to `true`. When `preserveHost` is set to
     * `true`, this method interacts with the Host header in the following ways:
     *
     * - If the Host header is missing or empty, and the new URL contains
     *   a host component, this method MUST update the Host header in the returned
     *   request.
     * - If the Host header is missing or empty, and the new URL does not contain a
     *   host component, this method MUST NOT update the Host header in the returned
     *   request.
     * - If a Host header is present and non-empty, this method MUST NOT update
     *   the Host header in the returned request.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * new UrlInterface instance.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-4.3
     * @param url New request URL to use.
     * @param preserveHost Preserve the original state of the Host header.
     * @return Request instance with given url.
     */
    public withUrl(url: Url, preserveHost?: boolean): Request;

    /**
     * Retrieves the message's request target.
     *
     * Retrieves the message's request-target either as it will appear (for
     * clients), as it appeared at request (for servers), or as it was
     * specified for the instance (see withRequestTarget()).
     *
     * In most cases, this will be the origin-form of the composed URL,
     * unless a value was provided to the concrete implementation (see
     * withRequestTarget() below).
     *
     * If no URL is available, and no request-target has been specifically
     * provided, this method MUST return the string "/".
     *
     * @return Request target.
     */
    public getRequestTarget(): string;

    /**
     * Return an instance with the specific request-target.
     *
     * If the request needs a non-origin-form request-target — e.g., for
     * specifying an absolute-form, authority-form, or asterisk-form —
     * this method may be used to create an instance with the specified
     * request-target, verbatim.
     *
     * This method MUST be implemented in such a way as to retain the
     * immutability of the message, and MUST return an instance that has the
     * changed request target.
     *
     * @see http://tools.ietf.org/html/rfc7230#section-5.3 (for the various
     *     request-target forms allowed in request messages)
     * @param requestTarget Request target.
     * @return Request instance with given request target.
     */
    public withRequestTarget(requestTarget: string): Request;
}

/**
 * Has the ability to create requests.
 */
declare interface RequestFactoryInterface {
    /**
     * Create a new request.
     *
     * @param method The HTTP method associated with the request.
     * @param uri The URL associated with the request.
     * @return New request instance.
     */
    createRequest(method: RequestMethod, url: Url | string): Request;
}

/**
 * Has the ability to create requests.
 */
declare class RequestFactory implements RequestFactoryInterface {
    /**
     * Creates a new factory instance.
     *
     * @param urlFactory A URL factory.
     */
    constructor(urlFactory: UrlFactoryInterface);

    /**
     * Create a new request.
     *
     * @param method The HTTP method associated with the request.
     * @param uri The URL associated with the request.
     * @return New request instance.
     */
    public createRequest(method: RequestMethod, url: Url | string): Request;
}

/**
 * Represents a defined set of response statuses.
 *
 * @readonly
 * @enum {number}
 */
declare enum ResponseStatus {
    // 1xx Informational
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,

    // 2xx Success
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,

    // 3xx Redirection
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,

    // 4xx Client Error
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    REQUEST_URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    IM_A_TEAPOT = 418,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    CONNECTION_CLOSED_WITHOUT_RESPONSE = 444,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,
    CLIENT_CLOSED_REQUEST = 499,

    // 5xx Server Error
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511,
    NETWORK_CONNECT_TIMEOUT_ERROR = 599
}

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
declare interface ResponseInterface {
    /**
     * Gets the response status code.
     *
     * The status code is a 3-digit integer result code of the server's attempt
     * to understand and satisfy the request.
     *
     * @return Response status code.
     */
    getStatusCode(): ResponseStatus;

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
     * @return Reason phrase; must return an empty string if none present.
     */
    getReasonPhrase(): string;

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
     * @param code The 3-digit integer result code to set.
     * @param reasonPhrase The reason phrase to use with the
     *     provided status code; if none is provided, implementations MAY
     *     use the defaults as suggested in the HTTP specification.
     * @return Response instance with given status and reason phrase.
     * @throws {TypeError} For invalid status code arguments.
     */
    withStatus(code: ResponseStatus, reasonPhrase?: string): Response;
}

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
declare class Response extends Message implements ResponseInterface {
    /**
     * Create a new response instance.
     *
     * @param {ResponseStatus} statusCode Response status code.
     * @param {string} protocolVersion HTTP protocol version.
     * @param {HeaderCollection} headers Message headers.
     * @param {stream.Writable} body Message body.
     * @param {?string} reasonPhrase Response reason phrase.
     */
    constructor(
        statusCode: ResponseStatus,
        protocolVersion: string,
        headers: HeaderCollection,
        body: Writable,
        reasonPhrase?: string
    );

    /**
     * Gets the response status code.
     *
     * The status code is a 3-digit integer result code of the server's attempt
     * to understand and satisfy the request.
     *
     * @return Response status code.
     */
    public getStatusCode(): ResponseStatus;


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
     * @return Reason phrase; must return an empty string if none present.
     */
    public getReasonPhrase(): string;

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
     * @param code The 3-digit integer result code to set.
     * @param reasonPhrase The reason phrase to use with the
     *     provided status code; if none is provided, implementations MAY
     *     use the defaults as suggested in the HTTP specification.
     * @return Response instance with given status and reason phrase.
     * @throws {TypeError} For invalid status code arguments.
     */
    public withStatus(code: ResponseStatus, reasonPhrase?: string): Response;
}

/**
 * Has the ability to create responses.
 */
declare interface ResponseFactoryInterface {
    /**
     * Create a new response.
     *
     * @param statusCode Response status code.
     * @param reasonPhrase Response reason phrase.
     * @return New response instance.
     */
    createResponse(statusCode: ResponseStatus, reasonPhrase?: string): Response;
}

/**
 * Has the ability to create responses.
 */
declare class ResponseFactory implements ResponseFactoryInterface {
    /**
     * Creates a new factory instance.
     *
     * @param streamFactory A stream factory instance.
     */
    public constructor(streamFactory: StreamFactoryInterface);

    /**
     * Create a new response.
     *
     * @param statusCode Response status code.
     * @param reasonPhrase Response reason phrase.
     * @return New response instance.
     */
    public createResponse(statusCode: ResponseStatus, reasonPhrase?: string): Response;
}

/**
 * A string implementation of a duplex stream.
 */
declare class StringStream extends Duplex {
    /**
     * Creates a stream instance.
     *
     * @param content The stream content.
     */
    public constructor(content?: string);
}

/**
 * Has the ability to create streams.
 */
declare interface StreamFactoryInterface {
    /**
     * Create a new stream from a string.
     *
     * @param content String content with which to populate the stream.
     * @return A new stream instance.
     */
    createStream(content: string): Duplex;
}

/**
 * Has the ability to create streams.
 */
declare class StreamFactory implements StreamFactoryInterface {
    /**
     * Create a new stream from a string.
     *
     * @param content String content with which to populate the stream.
     * @return A new stream instance.
     */
    public createStream(content: string): Duplex;
}

export {
    HeaderCollection,
    Message,
    MessageInterface,
    Request,
    RequestFactory,
    RequestFactoryInterface,
    RequestInterface,
    RequestMethod,
    Response,
    ResponseFactory,
    ResponseFactoryInterface,
    ResponseInterface,
    ResponseStatus,
    StreamFactory,
    StreamFactoryInterface,
    StringStream,
    Url,
    UrlFactory,
    UrlFactoryInterface,
    UrlInterface
};
