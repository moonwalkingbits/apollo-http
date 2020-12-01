/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * A specialized collection of HTTP headers.
 */
class HeaderCollection {
    /**
     * Create a new collection instance.
     *
     * @public
     * @param {?Object.<string, Array.<string>>} headers Initial set of headers.
     */
    constructor(headers) {
        /**
         * List of headers and values.
         *
         * @private
         * @type {Map.<string, Array.<string>>}
         */
        this.headers = new Map(headers);
    }

    /**
     * Retrieve all headers.
     *
     * @public
     * @return {Object.<string, Array.<string>>} Header names and values.
     */
    all() {
        return Array.from(this.headers.entries())
            .reduce((headers, [ name, values ]) => ({...headers, [name]: values}), {});
    }

    /**
     * Determine if a header exists in the collection.
     *
     * @public
     * @param {string} name Name of header to check (case insensitive).
     * @return {boolean} True if the header exists in the collection.
     */
    has(name) {
        return this.headers.has(this.headerKey(name));
    }

    /**
     * Retrieve header values.
     *
     * @public
     * @param {string} name Header name (case insensitive).
     * @return {Array.<string>} List of header values.
     */
    get(name) {
        return this.headers.get(this.headerKey(name)) || [];
    }

    /**
     * Set the header value(s).
     *
     * @public
     * @param {string} name Header name (case insensitive).
     * @param {(string|Array.<string>)} value Header value(s) to override any existing value.
     */
    set(name, value) {
        this.headers.set(
            this.headerKey(name),
            Array.isArray(value) ? value : [value]
        );
    }

    /**
     * Add value(s) to the list of header values.
     *
     * If the header doesn't exist it will be created.
     *
     * @public
     * @param {string} name Header name (case insensitive).
     * @param {(string|Array.<string>)} Header value(s) to be added.
     */
    add(name, value) {
        this.headers.set(
            this.headerKey(name),
            (this.headers.get(this.headerKey(name)) || []).concat(value)
        );
    }

    /**
     * Remove the header and its values from the collection.
     *
     * @public
     * @param {string} name Header name (case insensitive).
     */
    remove(name) {
        delete this.headers.delete(this.headerKey(name));
    }

    /**
     * Get the headers original name.
     *
     * @private
     * @param {string} name Header name (case insensitive).
     * @return {string} Original header name.
     */
    headerKey(name) {
        const lowerCaseName = name.toLowerCase();

        return Array.from(this.headers.keys())
            .find(key => key.toLowerCase() === lowerCaseName) || name;
    }
}

export default HeaderCollection;
