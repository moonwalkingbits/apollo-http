/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { StreamFactory } from "@moonwalkingbits/apollo-http";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { expect } = require("chai");

describe("StringStream", () => {
    let streamFactory;

    beforeEach(() => {
        streamFactory = new StreamFactory();
    });

    describe("#createStream()", () => {
        it("should create a stream from a string", () => {
            const stream = streamFactory.createStream("content");

            expect(stream.read(7).toString()).to.equal("content");
        });
    });
});
