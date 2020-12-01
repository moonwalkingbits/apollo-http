/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HeaderCollection, Message } from "@moonwalkingbits/apollo-http";
import { Readable } from "stream";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { createStubInstance } = require("sinon");
const { expect } = require("chai");

describe("Message", () => {
    beforeEach(function() {
        this.protocolVersion = "1.1";
        this.headers = new HeaderCollection();
        this.body = createStubInstance(Readable);
        this.createMessage = (p, h, b) => new Message(p || this.protocolVersion, h || this.headers, b || this.body);
    });

    messageTests(Message);
});

function messageTests(InstanceType) {
    describe("#getProtocolVersion()", () => {
        it("Should return protocol version", function() {
            expect(this.createMessage().getProtocolVersion()).to.equal(this.protocolVersion);
        });
    });

    describe("#withProtocolVersion()", () => {
        it("Should produce instance with protocol version", function() {
            const message = this.createMessage().withProtocolVersion("2.0");

            expect(message).to.be.instanceof(InstanceType);
            expect(message.getProtocolVersion()).to.equal("2.0");
        });

        it("Should not mutate instance", function() {
            const message = this.createMessage();

            message.withProtocolVersion("2.0");

            expect(message.getProtocolVersion()).to.equal(this.protocolVersion);
        });

        it("Should return same instance for same protocol version", function() {
            const message = this.createMessage();

            expect(Object.is(message, message.withProtocolVersion(this.protocolVersion))).to.be.true;
        });
    });

    describe("#hasHeader()", () => {
        it("Should determine if header exists", function() {
            expect(this.createMessage().hasHeader("Host")).to.be.false;

            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).hasHeader("Host")).to.be.true;
        });

        it("Should be case insensitive", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).hasHeader("host")).to.be.true;
        });
    });

    describe("#getHeaders()", () => {
        it("Should return an empty object if no headers", function() {
            expect(this.createMessage().getHeaders()).to.be.an("object").that.is.empty;
        });

        it("Should return an object with header names/values", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).getHeaders()).to.have.deep.property("Host", ["example.com"]);
        });
    });

    describe("#getHeader()", () => {
        it("Should return an empty array if no header values", function() {
            expect(this.createMessage().getHeader("Host")).to.be.an("array").that.is.empty;
        });

        it("Should return an array of header values", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).getHeader("Host")).to.have.members(["example.com"]);
        });

        it("Should be case insensitive", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).getHeader("host")).to.have.members(["example.com"]);
        });
    });

    describe("#getHeaderLine()", () => {
        it("Should return an empty string if no header values", function() {
            expect(this.createMessage().getHeaderLine("Host")).to.be.a("string").that.is.empty;
        });

        it("Should return a comma separated string of values", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));
            const message = this.createMessage(null, headers);

            expect(message.getHeaderLine("Host")).to.equal("example.com");

            expect(message.withAddedHeader("Host", "other-host.com").getHeaderLine("Host"))
                .to.equal("example.com,other-host.com");
        });

        it("Should be case insensitive", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).getHeaderLine("host")).to.equal("example.com");
        });
    });

    describe("#withHeader()", () => {
        it("Should produce instance with header", function() {
            const message = this.createMessage().withHeader("X-Test", "test");

            expect(message).to.be.instanceof(InstanceType);
            expect(message.getHeaderLine("X-Test")).to.equal("test");
        });

        it("Should override existing header", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).withHeader("Host", "other-host.com").getHeaderLine("Host"))
                .to.equal("other-host.com");
        });

        it("Should not mutate instance", function() {
            const message = this.createMessage();

            message.withHeader("X-Test", "test");

            expect(message.hasHeader("X-Test")).to.be.false;
        });

        it("Should return same instance for same header", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));
            const message = this.createMessage(null, headers);

            expect(Object.is(message, message.withHeader("Host", "example.com"))).to.be.true;
        });

        it("Should accept array of values", function() {
            expect(this.createMessage().withHeader("X-Test", ["one", "two"]).getHeaderLine("X-Test")).to.equal("one,two");
        });
    });

    describe("#withAddedHeader()", () => {
        it("Should produce instance with created header", function() {
            const message = this.createMessage().withAddedHeader("X-Test", "test");

            expect(message).to.be.instanceof(InstanceType);
            expect(message.getHeaderLine("X-Test")).to.equal("test");
        });

        it("Should produce instance with added header", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).withAddedHeader("Host", "other-host.com").getHeaderLine("Host"))
                .to.equal("example.com,other-host.com");
        });

        it("Should preserve original case", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).withAddedHeader("host", "other-host.com").getHeaders())
                .to.have.property("Host");
        });

        it("Should not mutate instance", function() {
            const message = this.createMessage();

            message.withAddedHeader("X-Test", "test");

            expect(message.hasHeader("X-Test")).to.be.false;
        });
    });

    describe("#withoutHeader()", () => {
        it("Should produce instance without header", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));
            const message = this.createMessage(null, headers).withoutHeader("Host");

            expect(message).to.be.instanceof(InstanceType);
            expect(message.hasHeader("Host")).to.be.false;
        });

        it("Should not mutate instance", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));
            const message = this.createMessage(null, headers);

            message.withoutHeader("Host");

            expect(message.hasHeader("Host")).to.be.true;
        });

        it("Should return same instance if header not present", function() {
            const message = this.createMessage();

            expect(Object.is(message, message.withoutHeader("X-Test"))).to.be.true;
        });

        it("Should be case insensitive", function() {
            const headers = new HeaderCollection(Object.entries({"Host": ["example.com"]}));

            expect(this.createMessage(null, headers).withoutHeader("host").hasHeader("Host")).to.be.false;
        });
    });

    describe("#getBody()", () => {
        it("Should return body", function() {
            expect(Object.is(this.body, this.createMessage().getBody())).to.be.true;
        });
    });

    describe("#withBody()", () => {
        it("Should produce instance with body", function() {
            const body = createStubInstance(Readable);
            const message = this.createMessage().withBody(body);

            expect(message).to.be.instanceof(InstanceType);
            expect(Object.is(body, message.getBody())).to.be.true;
        });

        it("Should not mutate instance", function() {
            const message = this.createMessage();

            message.withBody(createStubInstance(Readable));

            expect(Object.is(this.body, message.getBody())).to.be.true;
        });

        it("Should return same instance for same body", function() {
            const message = this.createMessage();

            expect(Object.is(message, message.withBody(this.body))).to.be.true;
        });
    });
};

export { messageTests };
