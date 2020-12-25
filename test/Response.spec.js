/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HeaderCollection, Response, ResponseStatus } from "@moonwalkingbits/apollo-http";
import { Readable } from "stream";
import { createRequire } from "module";
import { messageTests } from "./Message.spec.js";

const require = createRequire(import.meta.url);
const { createStubInstance } = require("sinon");
const { expect } = require("chai");

describe("Message", () => {
    beforeEach(function() {
        this.statusCode = ResponseStatus.OK;
        this.protocolVersion = "1.1";
        this.headers = new HeaderCollection();
        this.body = createStubInstance(Readable);
        this.createMessage = (p, h, b) => new Response(
            this.statusCode,
            p || this.protocolVersion,
            h || this.headers,
            b || this.body
        );
    });

    messageTests(Response);
});

describe("Response", () => {
    const createResponse = () => new Response(statusCode, protocolVersion, headers, body);

    let statusCode;
    let protocolVersion;
    let headers;
    let body;
    let response;

    beforeEach(() => {
        statusCode = ResponseStatus.OK;
        protocolVersion = "1.1";
        headers = new HeaderCollection();
        body = createStubInstance(Readable);
        response = createResponse();
    });

    describe("#statusCode", () => {
        it("Should return the status code", () => {
            expect(response.statusCode).to.equal(statusCode);
        });
    });

    describe("#reasonPhrase", () => {
        it("Should return reason phrase", () => {
            expect(new Response(statusCode, protocolVersion, headers, body, "Reason Phrase").reasonPhrase)
                .to.equal("Reason Phrase");
        });

        it("Should return standard reason phrase if none exists", () => {
            expect(response.reasonPhrase).to.equal("OK");
        });
    });

    describe("#withStatus()", () => {
        it("Should produce instance with status", () => {
            expect(response.withStatus(ResponseStatus.NOT_FOUND).statusCode).to.equal(ResponseStatus.NOT_FOUND);
        });

        it("Should not mutate instance", () => {
            response.withStatus(ResponseStatus.NOT_FOUND);

            expect(response.statusCode).to.equal(statusCode);
        });

        it("Should return same instance for same status", () => {
            expect(Object.is(response, response.withStatus(statusCode))).to.be.true;
        });

        it("Should accept a reason phrase", () => {
            expect(response.withStatus(statusCode, "Reason Phrase").reasonPhrase).to.equal("Reason Phrase");
        });
    });

    describe("#protocolVersion", () => {
        it("Should return protocol version", () => {
            expect(response.protocolVersion).to.equal(protocolVersion);
        });
    });

    describe("#withProtocolVersion()", () => {
        it("Should produce instance with protocol version", () => {
            expect(response.withProtocolVersion("2.0").protocolVersion).to.equal("2.0");
        });

        it("Should not mutate instance", () => {
            response.withProtocolVersion("2.0");

            expect(response.protocolVersion).to.equal(protocolVersion);
        });

        it("Should return same instance for same protocol version", () => {
            expect(Object.is(response, response.withProtocolVersion(protocolVersion))).to.be.true;
        });
    });
});
