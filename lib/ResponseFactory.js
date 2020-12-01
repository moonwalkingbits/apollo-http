/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import HeaderCollection from "./HeaderCollection.js";
import Response from "./Response.js";
import StreamFactory from "./StreamFactory.js";

/**
 * Has the ability to create responses.
 */
class ResponseFactory {
    /**
     * Creates a new factory instance.
     *
     * @public
     * @param {StreamFactory} streamFactory Stream factory instance.
     */
    constructor(streamFactory) {
        /**
         * Stream factory instance.
         *
         * @private
         * @type {StreamFactory}
         */
        this.streamFactory = streamFactory;
    }

    /**
     * Create a new response.
     *
     * @public
     * @param {ResponseStatus} statusCode Response status code.
     * @param {?string} reasonPhrase Response reason phrase.
     * @return {Response} New response instance.
     */
    createResponse(statusCode, reasonPhrase) {
        return new Response(
            statusCode,
            "1.1",
            new HeaderCollection(),
            this.streamFactory.createStream(""),
            reasonPhrase
        );
    }
}

export default ResponseFactory;
