/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Request, RequestFactory, RequestMethod, Url, UrlFactory } from "@moonwalkingbits/apollo-http";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { createStubInstance } = require("sinon");
const { expect } = require("chai");

describe("RequestFactory", () => {
    const createRequestFactory = () => new RequestFactory(urlFactory);

    let url;
    let urlFromFactory;
    let urlFactory;
    let requestFactory;

    beforeEach(() => {
        url = createStubInstance(Url);
        urlFromFactory = createStubInstance(Url);
        urlFactory = createStubInstance(UrlFactory);
        urlFactory.createUrl.returns(urlFromFactory);
        requestFactory = createRequestFactory();
    });

    describe("#createRequest()", () => {
        it("Should create a request with method and url", () => {
            const request = requestFactory.createRequest(RequestMethod.GET, url);

            expect(request.method).to.equal(RequestMethod.GET);
            expect(Object.is(url, request.url)).to.be.true;
        });

        it("Should accept string url", () => {
            const request = requestFactory.createRequest(RequestMethod.GET, "http://example.com");

            expect(Object.is(urlFromFactory, request.url)).to.be.true;
        });
    });
});
