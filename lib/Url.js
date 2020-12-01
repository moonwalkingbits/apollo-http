/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Class representing a URL.
 */
class Url {
    /**
     * Create a new URL instance.
     *
     * @public
     * @param {?string} scheme Url scheme.
     * @param {?string} user User of the authority component.
     * @param {?string} password Password of the authority component.
     * @param {?string} host Url host.
     * @param {?number} port Url port.
     * @param {?string} path Url path.
     * @param {?string} query Url query.
     * @param {?string} fragment Url fragment.
     */
    constructor(scheme, user, password, host, port, path, query, fragment) {
        /**
         * Url scheme.
         *
         * @private
         * @type {?string}
         */
        this.scheme = scheme && scheme.length > 0 ? scheme.toLowerCase() : null;

        /**
         * User of the authority component.
         *
         * @private
         * @type {?string}
         */
        this.user = user && user.length > 0 ? user : null;

        /**
         * Password of the authority component.
         *
         * @private
         * @type {?string}
         */
        this.password = this.user ? password || null : null;

        /**
         * Url host.
         *
         * @private
         * @type {?string}
         */
        this.host = host && host.length > 0 ? host.toLowerCase() : null;

        /**
         * Url port.
         *
         * @private
         * @type {?number}
         */
        this.port = parseInt(port) || null;

        /**
         * Url path.
         *
         * @private
         * @type {?string}
         */
        this.path = path && path.length > 0 ? this.encodePath(path) : null;

        /**
         * Url query.
         *
         * @private
         * @type {?string}
         */
        this.query = query && query.length > 0 ? this.encodeQuery(query) : null;

        /**
         * Url fragment.
         *
         * @private
         * @type {?string}
         */
        this.fragment = fragment && fragment.length > 0 ? this.encodeFragment(fragment) : null;
    }

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
     * @public
     * @return {string} The URL scheme.
     */
    getScheme() {
        return this.scheme || "";
    }

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
     * @public
     * @return {string} The URL authority, in "[user-info@]host[:port]" format.
     */
    getAuthority() {
        let authority = this.getHost();

        if (authority.length === 0) {
            return "";
        }

        const userInfo = this.getUserInfo();

        if (userInfo.length > 0) {
            authority = `${userInfo}@${authority}`;
        }

        const port = this.getPort();

        if (port) {
            authority += `:${port}`;
        }

        return authority;
    }

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
     * @public
     * @return {string} The URL user information, in "username[:password]" format.
     */
    getUserInfo() {
        if (!this.user) {
            return "";
        }

        let userInfo = this.user;

        if (this.password) {
            userInfo += `:${this.password}`;
        }

        return userInfo;
    }

    /**
     * Retrieve the host component of the URL.
     *
     * If no host is present, this method MUST return an empty string.
     *
     * The value returned MUST be normalized to lowercase, per RFC 3986
     * Section 3.2.2.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-3.2.2
     * @public
     * @return {string} The URL host.
     */
    getHost() {
        return this.host || "";
    }

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
     * @public
     * @return {?number} The URL port.
     */
    getPort() {
        return this.port && !this.isStandardPort(this.port) ?
            this.port :
            null;
    }

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
     * @public
     * @return {string} The URL path.
     */
    getPath() {
        return this.path || "";
    }

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
     * @public
     * @return {string} The URL query string.
     */
    getQuery() {
        return this.query || "";
    }

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
     * @public
     * @return {string} The URL fragment.
     */
    getFragment() {
        return this.fragment || "";
    }

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
     * @public
     * @param {string} scheme The scheme to use with the new instance.
     * @return {this} A URL instance with the specified scheme.
     * @throws For invalid or unsupported schemes.
     */
    withScheme(scheme) {
        if (
            (scheme.length === 0 && !this.scheme) ||
            (scheme.toLowerCase() === this.scheme)
        ) {
            return this;
        }

        return new Url(
            scheme.length > 0 ? scheme.toLowerCase() : null,
            this.user,
            this.password,
            this.host,
            this.port,
            this.path,
            this.query,
            this.fragment
        );
    }

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
     * @public
     * @param {string} user The user name to use for authority.
     * @param {?string} password The password associated with $user.
     * @return {this} A URL instance with the specified user information.
     */
    withUserInfo(user, password) {
        if (
            (user.length === 0 && !this.user) ||
            (user === this.user && password === this.password)
        ) {
            return this;
        }

        return new Url(
            this.scheme,
            user.length > 0 ? user : null,
            user.length > 0 ? password || null : null,
            this.host,
            this.port,
            this.path,
            this.query,
            this.fragment
        );
    }

    /**
     * Return an instance with the specified host.
     *
     * This method MUST retain the state of the current instance, and return
     * an instance that contains the specified host.
     *
     * An empty host value is equivalent to removing the host.
     *
     * @public
     * @param {string} host The hostname to use with the new instance.
     * @return {this} A URL instance with the specified host.
     * @throws {TypeError} For invalid hostnames.
     */
    withHost(host) {
        if (
            (host.length === 0 && !this.host) ||
            (host.toLowerCase() === this.host)
        ) {
            return this;
        }

        return new Url(
            this.scheme,
            this.user,
            this.password,
            host.length > 0 ? host.toLowerCase() : null,
            this.port,
            this.path,
            this.query,
            this.fragment
        );
    }

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
     * @public
     * @param {?number} port The port to use with the new instance; a null value
     *     removes the port information.
     * @return {this} A URL instance with the specified port.
     * @throws {TypeError} For invalid ports.
     */
    withPort(port) {
        if (port === this.port) {
            return this;
        }

        return new Url(
            this.scheme,
            this.user,
            this.password,
            this.host,
            port,
            this.path,
            this.query,
            this.fragment
        );
    }

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
     * @public
     * @param {string} path The path to use with the new instance.
     * @return {this} A URL instance with the specified path.
     * @throws {TypeError} For invalid paths.
     */
    withPath(path) {
        const encodedPath = this.encodePath(path);

        if (
            (encodedPath.length === 0 && !this.path) ||
            (encodedPath === this.path)
        ) {
            return this;
        }

        return new Url(
            this.scheme,
            this.user,
            this.password,
            this.host,
            this.port,
            encodedPath || null,
            this.query,
            this.fragment
        );
    }

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
     * @public
     * @param {string} query The query string to use with the new instance.
     * @return {this} A URL instance with the specified query string.
     * @throws {TypeError} For invalid query strings.
     */
    withQuery(query) {
        const encodedQuery = this.encodeQuery(query);

        if (
            (encodedQuery.length === 0 && !this.query) ||
            (encodedQuery === this.query)
        ) {
            return this;
        }

        return new Url(
            this.scheme,
            this.user,
            this.password,
            this.host,
            this.port,
            this.path,
            encodedQuery || null,
            this.fragment
        );
    }

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
     * @public
     * @param {string} fragment The fragment to use with the new instance.
     * @return {this} A URL instance with the specified fragment.
     */
    withFragment(fragment) {
        const encodedFragment = this.encodeFragment(fragment);

        if (
            (encodedFragment.length === 0 && !this.fragment) ||
            (encodedFragment === this.fragment)
        ) {
            return this;
        }

        return new Url(
            this.scheme,
            this.user,
            this.password,
            this.host,
            this.port,
            this.path,
            this.query,
            encodedFragment || null
        );
    }

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
     * @public
     * @return {string} A string representation of the URL.
     */
    toString() {
        let url = "";

        const scheme = this.getScheme();

        if (scheme.length > 0) {
            url = `${scheme}:`;
        }

        const authority = this.getAuthority();

        if (authority.length > 0) {
            url += `//${authority}`;
        }

        let path = this.getPath();

        if (path.length > 0) {
            // If the path is rootless and an authority is present, the path MUST be prefixed with "/".
            if (path.indexOf("/") !== 0 && authority.length > 0) {
                path = `/${path}`;
            }

            // If the path is starting with more than one "/" and no authority is present, the starting
            // slashes MUST be reduced to one."
            if (path.charAt(1) === "/" && authority.length === 0) {
                path = `/${path.replace(/^[\/]+/, "")}`
            }
        }

        url += path;

        const query = this.getQuery();

        if (query.length > 0) {
            url += `?${query}`;
        }

        const fragment = this.getFragment();

        if (fragment.length > 0) {
            url += `#${fragment}`;
        }

        return url;
    }

    /**
     * URL encode path.
     *
     * @private
     * @param {string} path URL path to encode.
     * @return {string} URL encoded path.
     */
    encodePath(path) {
        return path.split("/")
            .map(decodeURIComponent)
            .map(encodeURIComponent)
            .join("/");
    }

    /**
     * URL encode query.
     *
     * @private
     * @param {string} query Query to encode.
     * @return {string} URL encoded query.
     */
    encodeQuery(query) {
        return query.split("&")
            .map(keyValuePair => keyValuePair.split("=")
                .map(decodeURIComponent)
                .map(encodeURIComponent)
                .join("="))
            .join("&");
    }

    /**
     * URL encode fragment.
     *
     * @private
     * @param {string} fragment Fragment to encode.
     * @return {string} URL encoded fragment.
     */
    encodeFragment(fragment) {
        return encodeURIComponent(decodeURIComponent(fragment));
    }

    /**
     * Determine if a port is the standard port for the current protocol.
     *
     * @todo Augment this list.
     *
     * @private
     * @param {number} port The port number of the URL.
     * @return {boolean} True if the given port is the standard port for the current protocol.
     */
    isStandardPort(port) {
        switch (this.scheme) {
            case 'http':
                return port === 80;
            case 'https':
                return port === 443;
            default:
                return false;
        }
    }
}

export default Url;
