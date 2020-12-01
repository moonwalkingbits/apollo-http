/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import StringStream from "./StringStream.js";

/**
 * Has the ability to create streams.
 */
class StreamFactory {
    /**
     * Create a new stream from a string.
     *
     * @public
     * @param {string} content String content with which to populate the stream.
     * @return {stream.Duplex} A new stream instance.
     */
    createStream(content) {
        return new StringStream(content);
    }
}

export default StreamFactory;
