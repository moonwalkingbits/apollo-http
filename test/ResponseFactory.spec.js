/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ResponseFactory, StreamFactory } from "@moonwalkingbits/apollo-http";
import { Writable } from "stream";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { createStubInstance } = require("sinon");
const { expect } = require("chai");

describe("ResponseFactory", () => {
    const createResponseFactory = () => new ResponseFactory(streamFactory);

    let streamFromFactory;
    let streamFactory;
    let responseFactory;

    beforeEach(() => {
        streamFromFactory = createStubInstance(Writable);
        streamFactory = createStubInstance(StreamFactory);
        streamFactory.createStream.returns(streamFromFactory);
        responseFactory = createResponseFactory();
    });

    describe("#createResponse()", () => {
        it("Should create a response with status and reason phrase", () => {
            const response = responseFactory.createResponse(200, "OK");

            expect(response.statusCode).to.equal(200);
            expect(response.reasonPhrase).to.equal("OK");
            expect(Object.is(streamFromFactory, response.body)).to.be.true;
        });
    });
});
