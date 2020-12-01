/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { UrlFactory } from "@moonwalkingbits/apollo-http";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { expect } = require("chai");

describe("UrlFactory", () => {
    let urlFactory;

    beforeEach(() => {
        urlFactory = new UrlFactory();
    });

    describe("#createUrl()", () => {
        it("Should create URLs from strings", () => {
            const tests = [
                [
                    "http://username:password@www.example.com/path?key=value#fragment",
                    "http://username:password@www.example.com/path?key=value#fragment"
                ],
                [
                    "http://www.example.com/path with spaces?key=value with spaces#fragment with spaces",
                    "http://www.example.com/path%20with%20spaces?key=value%20with%20spaces#fragment%20with%20spaces"
                ],
                [
                    "http://example.com",
                    "http://example.com"
                ],
                [
                    "http://example.com?key=value",
                    "http://example.com?key=value"
                ],
                [
                    "http://example.com#fragment",
                    "http://example.com#fragment"
                ]
            ];

            for (let [input, output] of tests) {
                expect(urlFactory.createUrl(input).toString()).to.equal(output);
            }
        });
    });
});
