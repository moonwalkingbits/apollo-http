/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import HeaderCollection from "./HeaderCollection.js";
import Message from "./Message.js";

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
class Request extends Message {
    /**
     * Create a new request instance.
     *
     * @public
     * @param {RequestMethod} method Request method.
     * @param {Url} url URL of the request.
     * @param {string} protocolVersion HTTP protocol version.
     * @param {HeaderCollection} headers Message headers.
     * @param {stream.Readable} body Message body.
     * @param {?string} target Request target.
     * @param {boolean} [shouldAddHostHeader=true] Whether to determine host header from the URL.
     */
    constructor(method, url, protocolVersion, headers, body, target, shouldAddHostHeader = true) {
        if (shouldAddHostHeader && !headers.has("Host") && url.getHost().length > 0) {
            headers.set("Host", url.getHost());
        }

        super(protocolVersion, headers, body);

        /**
         * Request method.
         *
         * @private
         * @type {RequestMethod}
         */
        this.method = method;

        /**
         * URL of the request.
         *
         * @private
         * @type {Url}
         */
        this.url = url;

        /**
         * Request target.
         *
         * @private
         * @type {?string}
         */
        this.target = target;
    }

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
     * @return {RequestMethod} Request method.
     */
    getMethod() {
        return this.method;
    }

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
     * @param {RequestMethod} method Case-sensitive method.
     * @return {Request} Request instance with given method.
     */
    withMethod(method) {
        if (method === this.method) {
            return this;
        }

        return new Request(
            method,
            this.url,
            this.protocolVersion,
            this.headers,
            this.body,
            this.target
        );
    }

    /**
     * Retrieves the URL instance.
     *
     * This method MUST return a Url instance.
     *
     * @see http://tools.ietf.org/html/rfc3986#section-4.3
     * @public
     * @return {Url} A Url instance representing the URL of the request.
     */
    getUrl() {
        return this.url;
    }

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
     * @public
     * @param {Url} url New request URL to use.
     * @param {boolean} [preserveHost=false] Preserve the original state of the Host header.
     * @return {Request} Request instance with given url.
     */
    withUrl(url, preserveHost = false) {
        const shouldUpdateHostHeader = url.getHost() !== this.getHeaderLine("Host") &&
                                       !preserveHost;

        if (url === this.url && !shouldUpdateHostHeader) {
            return this;
        }

        let headers = new HeaderCollection(Object.entries(this.getHeaders()));

        if (shouldUpdateHostHeader) {
            headers.set("Host", url.getHost());
        }

        return new Request(
            this.method,
            url,
            this.protocolVersion,
            headers,
            this.body,
            this.target
        );
    }

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
     * @public
     * @return {string} Request target.
     */
    getRequestTarget() {
        if (this.target) {
            return this.target;
        }

        let target = this.url.getPath();
        const query = this.url.getQuery();

        if (query.length > 0) {
            target += `?${query}`;
        }

        return target;
    }

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
     * @public
     * @param {string} requestTarget
     * @return {Request} Request instance with given request target.
     */
    withRequestTarget(requestTarget) {
        if (
            (requestTarget.length === 0 && !this.target) ||
            (requestTarget === this.target)
        ) {
            return this;
        }

        return new Request(
            this.method,
            this.url,
            this.protocolVersion,
            this.headers,
            this.body,
            requestTarget
        );
    }

    /**
     * @inheritdoc
     */
    createMessage(protocolVersion, headers, body) {
        return new Request(this.method, this.url, protocolVersion, headers, body, this.reasonPhrase, this.target);
    }
}

export default Request;
