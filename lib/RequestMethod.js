/*
 * Copyright 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Represents a fixed set of request methods.
 *
 * @readonly
 * @enum {string}
 */
const RequestMethod = {
    OPTIONS: "OPTIONS",
    GET: "GET",
    HEAD: "HEAD",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
    TRACE: "TRACE",
    CONNECT: "CONNECT"
};

export default RequestMethod;
