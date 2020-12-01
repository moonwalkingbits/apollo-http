/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { StringStream } from "@moonwalkingbits/apollo-http";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { expect } = require("chai");

describe("StringStream", () => {
    let content;
    let stream;

    beforeEach(() => {
        content = "content";
        stream = new StringStream(content);
    });

    it("Should read contents", () => {
        expect(stream.read(3).toString()).to.equal("con");
        expect(stream.read(3).toString()).to.equal("ten");
        expect(stream.read(3).toString()).to.equal("t");
    });

    it("Should write contents", () => {
        const stream = new StringStream();

        stream.write("con");
        stream.end("tent");

        expect(stream.read(7).toString()).to.equal("content");
    });
});
