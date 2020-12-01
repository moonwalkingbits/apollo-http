/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import HeaderCollection from "./HeaderCollection.js";
import Request from "./Request.js";
import StringStream from "./StringStream.js";

/**
 * Has the ability to create requests.
 */
class RequestFactory {
    /**
     * Creates a new factory instance.
     *
     * @public
     * @param {UrlFactory} urlFactory A URL factory instance.
     */
    constructor(urlFactory) {
        /**
         * A URL factory.
         *
         * @private
         * @type {UrlFactory}
         */
        this.urlFactory = urlFactory;
    }

    /**
     * Create a new request.
     *
     * @public
     * @param {RequestMethod} method The HTTP method associated with the request.
     * @param {(Url|string)} uri The URL associated with the request.
     * @return {Request} New request instance.
     */
    createRequest(method, url) {
        return new Request(
            method,
            typeof url === "string" ? this.urlFactory.createUrl(url) : url,
            "1.1",
            new HeaderCollection(),
            new StringStream()
        );
    }
}

export default RequestFactory;
