/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Url from "./Url.js";
import { URL } from "url";

/**
 * Has the ability to create URLs.
 */
class UrlFactory
{
    /**
     * Create a new URL.
     *
     * @public
     * @param {string} url The URL to parse.
     * @returns {Url} A URL instance representing the given URL.
     * @throws {TypeError} If the given URL cannot be parsed.
     */
    createUrl(urlString) {
        const url = new URL(urlString);

        return new Url(
            url.protocol.replace(/:$/, ""),
            url.username,
            url.password,
            url.host,
            parseInt(url.port) || null,
            url.pathname.replace(/^\//, ""),
            url.search.replace(/^\?/, ""),
            url.hash.replace(/^#/, "")
        );
    }
}

export default UrlFactory;
