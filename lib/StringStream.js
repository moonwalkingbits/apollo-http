/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Duplex } from "stream";

/**
 * A string implementation of a duplex stream.
 *
 * @extends stream.Duplex
 */
class StringStream extends Duplex {
    /**
     * Creates a stream instance.
     *
     * @public
     * @param {?string} content The stream content.
     */
    constructor(content = "") {
        super();

        /**
         * Stream content.
         *
         * @private
         * @type {string}
         */
        this.content = content;
    }

    _read(size) {
        if (this.content.length === 0) {
            this.push(null);

            return;
        }

        this.push(this.content.slice(0, size));
        this.content = this.content.slice(size);
    }

    _write(chunk, encoding, callback) {
        this.content += chunk.toString();

        callback();
    }
}

export default StringStream;
