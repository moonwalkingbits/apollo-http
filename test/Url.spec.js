/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Url } from "@moonwalkingbits/apollo-http";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { expect } = require("chai");

describe("Url", () => {
    let scheme;
    let user;
    let password;
    let host;
    let port;
    let path;
    let query;
    let fragment;

    const createUrl = () => new Url(
        scheme,
        user,
        password,
        host,
        port,
        path,
        query,
        fragment
    );

    beforeEach(() => {
        scheme = "http";
        user = "user";
        password = "password";
        host = "host.domain";
        port = 8080;
        path = "path/name";
        query = "key=value";
        fragment = "fragment";
    });

    describe("#scheme", () => {
        it("should return the scheme", () => {
            expect(createUrl().scheme).to.equal(scheme);
        });

        it("should normalize the scheme", () => {
            scheme = "HtTp";

            expect(createUrl().scheme).to.equal("http");
        });

        it("should return empty string if no scheme", () => {
            scheme = null;

            expect(createUrl().scheme).to.equal("");
        });
    });

    describe("#host", () => {

        it("Should return the host", () => {
            expect(createUrl().host).to.equal(host);
        });

        it("Should normalize the host", () => {
            host = "HoSt.DoMaIn";

            expect(createUrl().host).to.equal("host.domain");
        });

        it("Should return empty string if no host", () => {
            host = null;

            expect(createUrl().host).to.equal("");
        });
    });

    describe("#path", () => {
        it("Should return the path", () => {
            expect(createUrl().path).to.equal(path);
        });

        it("Should return empty string if no path", () => {
            path = null;

            expect(createUrl().path).to.equal("");
        });

        it("Should not normalize path", () => {
            path = "/";

            expect(createUrl().path).to.equal(path);

            path = "";

            expect(createUrl().path).to.equal(path);
        });

        it("Should encode path", () => {
            path = "/path with spaces";

            expect(createUrl().path).to.equal("/path%20with%20spaces");
        });

        it("Should not double encode path", () => {
            path = "/path%2F";

            expect(createUrl().path).to.equal(path);
        });
    });

    describe("#port", () => {
        it("Should return null if no port", () => {
            expect(new Url().port).to.be.null;
        });

        it("Should return null if standard port", () => {
            port = 80;

            expect(createUrl().port).to.be.null;

            port = 443;
            scheme = "https";

            expect(createUrl().port).to.be.null;
        });

        it("Should return port if non-standard port", () => {
            port = 8080;

            expect(createUrl().port).to.equal(8080);

            port = 80;
            scheme = "git";

            expect(createUrl().port).to.equal(80);
        });
    });

    describe("#query", () => {
        it("Should return the query", () => {
            expect(createUrl().query).to.equal(query);
        });

        it("Should return empty string if no query", () => {
            query = null;

            expect(createUrl().query).to.equal("");
        });

        it("Should encode query", () => {
            query = "key=value&another-key=value with spaces";

            expect(createUrl().query).to.equal("key=value&another-key=value%20with%20spaces");
        });

        it("Should not double encode query", () => {
            query = "key=value%2F";

            expect(createUrl().query).to.equal(query);
        });
    });

    describe("#fragment", () => {
        it("Should return the fragment", () => {
            expect(createUrl().fragment).to.equal(fragment);
        });

        it("Should return empty string if no fragment", () => {
            fragment = null;

            expect(createUrl().fragment).to.equal("");
        });

        it("Should encode fragment", () => {
            fragment = "fragment with spaces";

            expect(createUrl().fragment).to.equal("fragment%20with%20spaces");
        });

        it("Should not double encode fragment", () => {
            fragment = "fragment%2F";

            expect(createUrl().fragment).to.equal(fragment);
        });
    });

    describe("#userInfo", () => {
        it("Should return user info", () => {
            expect(createUrl().userInfo).to.equal(`${user}:${password}`);
        });

        it("Should return username only if present", () => {
            password = null;

            expect(createUrl().userInfo).to.equal(user);
        });

        it("Should return empty string if no user info", () => {
            user = null;
            password = null;

            expect(createUrl().userInfo).to.equal("");
        });

        it("Should return empty string if only password", () => {
            user = null;

            expect(createUrl().userInfo).to.equal("");
        });
    });

    describe("#authority", () => {
        it("Should return authority", () => {
            port = 8080;

            expect(createUrl().authority).to.equal(`${user}:${password}@${host}:${port}`);
        });

        it("Should return empty string if no host", () => {
            host = null;

            expect(createUrl().authority).to.equal("");
        });

        it("Should omit user info if not present", () => {
            user = null;
            port = 80;

            expect(createUrl().authority).to.equal(host);
        });

        it("Should omit port if standard for protocol", () => {
            port = 80;

            expect(createUrl().authority).to.equal(`${user}:${password}@${host}`);
        });
    });

    describe("#toString()", () => {
        expect(new Url().toString()).to.equal("");
        expect(new Url(null, null, null, "example.com").toString()).to.equal("//example.com");
        expect(new Url(null, "user", null, "example.com").toString()).to.equal("//user@example.com");
        expect(new Url("http", null, null, null, null, "path/name").toString()).to.equal("http:path/name");
        expect(new Url("http", null, null, null, null, "//path/name").toString()).to.equal("http:/path/name");
        expect(new Url(null, null, null, "example.com", null, "path").toString()).to.equal("//example.com/path");
        expect(new Url("http", "user", "password", "example.com", 8080, "path/name", "key=value", "fragment").toString())
            .to.equal("http://user:password@example.com:8080/path/name?key=value#fragment");
    });

    describe("#withScheme()", () => {
        it("Should produce instance with scheme", () => {
            const newScheme = "https";

            expect(createUrl().withScheme(newScheme).scheme).to.equal(newScheme);
        });

        it("Should normalize scheme", () => {
            expect(createUrl().withScheme("HtTpS").scheme).to.equal("https");
        });

        it("Should not mutate instance", () => {
            const url = createUrl();
            url.withScheme("https");

            expect(url.scheme).to.equal(scheme);
        });

        it("Should return same instance for same scheme", () => {
            let url = createUrl();
            let newUrl = url.withScheme(scheme);

            expect(Object.is(url, newUrl)).to.be.true;

            url = new Url();
            newUrl = url.withScheme("");

            expect(Object.is(url, newUrl)).to.be.true;
        });

        it("Should remove scheme if an empty scheme is provided", () => {
            expect(createUrl().withScheme("").scheme).to.equal("");
        });
    });

    describe("#withUserInfo()", () => {
        it("Should produce instance with user info", () => {
            expect(createUrl().withUserInfo("newUser", "newPassword").userInfo).to.equal("newUser:newPassword");
        });

        it("Should remove password if not given", () => {
            expect(createUrl().withUserInfo("newUser").userInfo).to.equal("newUser");
        });

        it("Should not mutate instance", () => {
            const url = createUrl();
            url.withUserInfo("newUser");

            expect(url.userInfo).to.equal(`${user}:${password}`);
        });

        it("Should return same instance for same user info", () => {
            let url = createUrl();
            let newUrl = url.withUserInfo(user, password);

            expect(Object.is(url, newUrl)).to.be.true;

            url = new Url();
            newUrl = url.withUserInfo("");

            expect(Object.is(url, newUrl)).to.be.true;
        });

        it("Should remove user info if empty", () => {
            expect(createUrl().withUserInfo("").userInfo).to.equal("");
        });
    });

    describe("#withHost()", () => {
        it("Should produce instance with host", () => {
            const newHost = "example.com";

            expect(createUrl().withHost(newHost).host).to.equal(newHost);
        });

        it("Should normalize host", () => {
            expect(createUrl().withHost("ExamplE.CoM").host).to.equal("example.com");
        });

        it("Should not mutate instance", () => {
            const url = createUrl();
            url.withHost("example.com");

            expect(url.host).to.equal(host);
        });

        it("Should return same instance for same host", () => {
            let url = createUrl();
            let newUrl = url.withHost(host);

            expect(Object.is(url, newUrl)).to.be.true;

            url = new Url();
            newUrl = url.withHost("");

            expect(Object.is(url, newUrl)).to.be.true;
        });

        it("Should remove host if empty", () => {
            expect(createUrl().withHost("").host).to.equal("");
        });
    });

    describe("#withPort()", () => {
        it("Should produce instance with port", () => {
            const newPort = 3000;

            expect(createUrl().withPort(newPort).port).to.equal(newPort);
        });

        it("Should produce instance without port", () => {
            expect(createUrl().withPort(null).port).to.be.null;
        });

        it("Should not mutate instance", () => {
            const url = createUrl();
            url.withPort(3000);

            expect(url.port).to.equal(port);
        });

        it("Should return same instance for same port", () => {
            const url = createUrl();
            const newUrl = url.withPort(port);

            expect(Object.is(url, newUrl)).to.be.true;
        });
    });

    describe("#withPath()", () => {
        it("Should produce instance with path", () => {
            const newPath = "new/path";

            expect(createUrl().withPath(newPath).path).to.equal(newPath);
        });

        it("Should encode path", () => {
            expect(createUrl().withPath("path with spaces").path).to.equal("path%20with%20spaces");
        });

        it("Should not mutate instance", () => {
            const url = createUrl();
            url.withPath("new/path");

            expect(url.path).to.equal(path);
        });

        it("Should return same instance for same path", () => {
            let url = createUrl();
            let newUrl = url.withPath(path);

            expect(Object.is(url, newUrl)).to.be.true;

            url = new Url();
            newUrl = url.withPath("");

            expect(Object.is(url, newUrl)).to.be.true;
        });

        it("Should remove path if empty", () => {
            expect(createUrl().withPath("").path).to.equal("");
        });
    });

    describe("#withQuery()", () => {
        it("Should produce instance with query", () => {
            const newQuery = "key=newValue";

            expect(createUrl().withQuery(newQuery).query).to.equal(newQuery);
        });

        it("Should encode query", () => {
            expect(createUrl().withQuery("key=value with spaces").query).to.equal("key=value%20with%20spaces");
        });

        it("Should not mutate instance", () => {
            const url = createUrl();
            url.withQuery("key=newValue");

            expect(url.query).to.equal(query);
        });

        it("Should return same instance for same query", () => {
            let url = createUrl();
            let newUrl = url.withQuery(query);

            expect(Object.is(url, newUrl)).to.be.true;

            url = new Url();
            newUrl = url.withQuery("");

            expect(Object.is(url, newUrl)).to.be.true;
        });

        it("Should remove query if empty", () => {
            expect(createUrl().withQuery("").query).to.equal("");
        });
    });

    describe("#withFragment()", () => {
        it("Should produce instance with fragment", () => {
            const newfragment = "newFragment";

            expect(createUrl().withFragment(newfragment).fragment).to.equal(newfragment);
        });

        it("Should encode fragment", () => {
            expect(createUrl().withFragment("fragment with spaces").fragment).to.equal("fragment%20with%20spaces");
        });

        it("Should not mutate instance", () => {
            const url = createUrl();
            url.withFragment("newFragment");

            expect(url.fragment).to.equal(fragment);
        });

        it("Should return same instance for same fragment", () => {
            let url = createUrl();
            let newUrl = url.withFragment(fragment);

            expect(Object.is(url, newUrl)).to.be.true;

            url = new Url();
            newUrl = url.withFragment("");

            expect(Object.is(url, newUrl)).to.be.true;
        });

        it("Should remove fragment if empty", () => {
            expect(createUrl().withFragment("").fragment).to.equal("");
        });
    });
});
