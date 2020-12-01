/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HeaderCollection, Request, RequestMethod, Url } from "@moonwalkingbits/apollo-http";
import { Readable } from "stream";
import { createRequire } from "module";
import { messageTests } from "./Message.spec.js";

const require = createRequire(import.meta.url);
const { expect } = require("chai");
const { createStubInstance } = require("sinon");

describe("Message", () => {
    beforeEach(function() {
        this.method = RequestMethod.GET;
        this.url = createStubInstance(Url);
        this.url.getHost.returns("");
        this.protocolVersion = "1.1";
        this.headers = new HeaderCollection();
        this.body = createStubInstance(Readable);
        this.createMessage = (p, h, b) => new Request(
            this.method,
            this.url,
            p || this.protocolVersion,
            h || this.headers,
            b || this.body
        );
    });

    messageTests(Request);
});

describe("Request", () => {
    const createRequest = () => new Request(method, url, protocolVersion, headers, body, target);

    let method;
    let url;
    let protocolVersion;
    let headers;
    let body;
    let target;
    let request;

    beforeEach(() => {
        method = RequestMethod.GET;
        url = createStubInstance(Url);
        url.getHost.returns("");
        protocolVersion = "1.1";
        headers = new HeaderCollection();
        body = createStubInstance(Readable);
        request = createRequest();
    });

    describe("#constructor()", () => {
        it("Should add host header", () => {
            expect(request.getHeaderLine("Host")).to.be.empty;

            // Should set Host header if host is provided in the URL.
            url.getHost.returns("example.com");

            expect(createRequest().getHeaderLine("Host")).to.equal("example.com");

            // Should not override existing Host header.
            headers = new HeaderCollection();
            headers.add("Host", "existing-host.com");

            expect(createRequest().getHeaderLine("Host")).to.equal("existing-host.com");
        });
    });

    describe("#getMethod()", () => {
        it("Should return the method", () => {
            expect(request.getMethod()).to.equal(method);
        });
    });

    describe("#withMethod()", () => {
        it("Should produce instance with method", () => {
            expect(request.withMethod(RequestMethod.POST).getMethod()).to.equal(RequestMethod.POST);
        });

        it("Should not mutate instance", () => {
            request.withMethod(RequestMethod.POST);

            expect(request.getMethod()).to.equal(method);
        });

        it("Should return same instance for same method", () => {
            const newRequest = request.withMethod(method);

            expect(Object.is(newRequest, request)).to.be.true;
        });
    });

    describe("#getUrl()", () => {
        it("Should return url instance", () => {
            expect(Object.is(url, request.getUrl())).to.be.true;
        });
    });

    describe("#withUrl()", () => {
        it("Should produce instance with url", () => {
            const newUrl = createStubInstance(Url);

            expect(Object.is(newUrl, request.withUrl(newUrl).getUrl())).to.be.true;
        });

        it("Should not mutate instance", () => {
            request.withUrl(createStubInstance(Url));

            expect(Object.is(url, request.getUrl())).to.be.true;
        });

        it("Should return same instance for same url", () => {
            expect(Object.is(request, request.withUrl(url))).to.be.true;
        });

        it("Should update host header", () => {
            url.getHost.returns("new-host.com");

            expect(request.withUrl(url).getHeaderLine("Host")).to.equal("new-host.com");
        });

        it("Should preserve host header", () => {
            url.getHost.returns("new-host.com");

            expect(request.withUrl(url, true).getHeaderLine("Host")).to.equal("");
        });
    });

    describe("#getRequestTarget()", () => {
        beforeEach(() => {
            target = "";
            url.getPath.returns("/");
            url.getQuery.returns("");
        });

        it("Should return request target", () => {
            target = "*";

            expect(createRequest().getRequestTarget()).to.equal("*");
        });

        it("Should return origin form of url if no request target", () => {
            url.getPath.returns("/path");
            expect(createRequest().getRequestTarget()).to.equal("/path");

            url.getQuery.returns("key=value");
            expect(createRequest().getRequestTarget()).to.equal("/path?key=value");
        });

        it("Should return '/' if no request target or url", () => {
            expect(request.getRequestTarget()).to.equal("/");
        });
    });

    describe("#withRequestTarget()", () => {
        beforeEach(() => {
            url.getPath.returns("/");
            url.getQuery.returns("");
        });

        it("Should produce instance with request target", () => {
            expect(request.withRequestTarget("*").getRequestTarget()).to.equal("*");
        });

        it("Should not mutate instance", () => {
            request.withRequestTarget("*");

            expect(request.getRequestTarget()).to.equal("/");
        });

        it("Should return same instance for same request target", () => {
            expect(Object.is(request, request.withRequestTarget(""))).to.be.true;

            target = "*";
            const requestWithTarget = createRequest();
            expect(Object.is(requestWithTarget, requestWithTarget.withRequestTarget("*"))).to.be.true;
        });
    });
});
