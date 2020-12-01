/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expectAssignable, expectType } from "tsd";
import { Duplex, Writable, Readable } from "stream";

import {
    HeaderCollection,
    Message,
    MessageInterface,
    Request,
    RequestFactory,
    RequestFactoryInterface,
    RequestInterface,
    RequestMethod,
    Response,
    ResponseFactory,
    ResponseFactoryInterface,
    ResponseInterface,
    ResponseStatus,
    StreamFactory,
    StreamFactoryInterface,
    StringStream,
    Url,
    UrlFactory,
    UrlFactoryInterface,
    UrlInterface
} from ".";

/*
|--------------------------------------------------------------------------
| HeaderCollection
|--------------------------------------------------------------------------
|
| These tests ensures the API of the header collection.
|
*/

const headerCollection = new HeaderCollection();
new HeaderCollection({"Content-Type": ["text/plain"]});
expectType<{[name: string]: Array<string>}>(headerCollection.all());
expectType<boolean>(headerCollection.has("Content-Type"));
expectType<Array<string>>(headerCollection.get("Content-Type"));
headerCollection.set("Accept", "text/plain");
headerCollection.set("Accept", ["text/plain", "text/xml"]);
headerCollection.add("Accept", "text/plain");
headerCollection.add("Accept", ["text/plain", "text/xml"]);
headerCollection.remove("Content-Type");

/*
|--------------------------------------------------------------------------
| Message
|--------------------------------------------------------------------------
|
| These tests ensures the API of the message.
|
*/

const message = new Message("1.1", new HeaderCollection(), new Duplex());
new Message("1.1", new HeaderCollection(), new Writable());
new Message("1.1", new HeaderCollection(), new Readable());
expectAssignable<MessageInterface>(message);
expectType<string>(message.getProtocolVersion());
expectType<Message>(message.withProtocolVersion("1.1"));
expectType<{[name: string]: Array<string>}>(message.getHeaders());
expectType<boolean>(message.hasHeader("Content-Type"));
expectType<Array<string>>(message.getHeader("Content-Type"));
expectType<string>(message.getHeaderLine("Content-Type"));
expectType<Message>(message.withHeader("Accept", "text/plain"));
expectType<Message>(message.withHeader("Accept", ["text/plain", "text/xml"]));
expectType<Message>(message.withAddedHeader("Accept", "text/plain"));
expectType<Message>(message.withAddedHeader("Accept", ["text/plain", "text/xml"]));
expectType<Message>(message.withoutHeader("Content-Type"));
expectType<Readable | Writable>(message.getBody());
expectType<Message>(message.withBody(new Duplex()));

/*
|--------------------------------------------------------------------------
| Url
|--------------------------------------------------------------------------
|
| These tests ensures the API of the url.
|
*/

const url = new Url();
new Url("http");
new Url("http", "user");
new Url("http", "user", "password");
new Url("http", "user", "password", "host");
new Url("http", "user", "password", "host", 80);
new Url("http", "user", "password", "host", 80, "/");
new Url("http", "user", "password", "host", 80, "/", "key=value");
new Url("http", "user", "password", "host", 80, "/", "key=value", "fragment");
expectAssignable<UrlInterface>(url);
expectType<string>(url.getScheme());
expectType<string>(url.getAuthority());
expectType<string>(url.getUserInfo());
expectType<string>(url.getHost());
expectType<number | null>(url.getPort());
expectType<string>(url.getPath());
expectType<string>(url.getQuery());
expectType<string>(url.getFragment());
expectType<Url>(url.withScheme("https"));
expectType<Url>(url.withUserInfo("user"));
expectType<Url>(url.withUserInfo("user", "password"));
expectType<Url>(url.withHost("host"));
expectType<Url>(url.withPort(8080));
expectType<Url>(url.withPort(null));
expectType<Url>(url.withPath("/"));
expectType<Url>(url.withQuery("key=value"));
expectType<Url>(url.withFragment("fragment"));
expectType<string>(url.toString());
console.log(`${url}`);
console.log("url: " + url);

/*
|--------------------------------------------------------------------------
| UrlFactory
|--------------------------------------------------------------------------
|
| These tests ensures the API of the url factory.
|
*/

const urlFactory = new UrlFactory();
expectAssignable<UrlFactoryInterface>(urlFactory);
expectType<Url>(urlFactory.createUrl(""));

/*
|--------------------------------------------------------------------------
| Request
|--------------------------------------------------------------------------
|
| These tests ensures the API of the request.
|
*/

const request = new Request(RequestMethod.GET, new Url(), "1.1", new HeaderCollection(), new Duplex(), "/", true);
new Request(RequestMethod.GET, new Url(), "1.1", new HeaderCollection(), new Duplex(), "/");
new Request(RequestMethod.GET, new Url(), "1.1", new HeaderCollection(), new Duplex());
expectAssignable<RequestInterface>(request);
expectAssignable<MessageInterface>(request);
expectAssignable<Message>(request);
expectType<RequestMethod>(request.getMethod());
expectType<Request>(request.withMethod(RequestMethod.POST));
expectType<Url>(request.getUrl());
expectType<Request>(request.withUrl(new Url()));
expectType<string>(request.getRequestTarget());
expectType<Request>(request.withRequestTarget("*"));

/*
|--------------------------------------------------------------------------
| RequestFactory
|--------------------------------------------------------------------------
|
| These tests ensures the API of the request factory.
|
*/

const requestFactory = new RequestFactory(new UrlFactory());
expectAssignable<RequestFactoryInterface>(requestFactory);
expectType<Request>(requestFactory.createRequest(RequestMethod.GET, new Url()));
expectType<Request>(requestFactory.createRequest(RequestMethod.GET, ""));

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
|
| These tests ensures the API of the response.
|
*/

const response = new Response(ResponseStatus.OK, "1.1", new HeaderCollection(), new Writable(), "OK");
new Response(ResponseStatus.OK, "1.1", new HeaderCollection(), new Writable());
expectAssignable<ResponseInterface>(response);
expectAssignable<MessageInterface>(response);
expectType<ResponseStatus>(response.getStatusCode());
expectType<string>(response.getReasonPhrase());
expectType<Response>(response.withStatus(ResponseStatus.OK, "OK"));
expectType<Response>(response.withStatus(ResponseStatus.NOT_FOUND));

/*
|--------------------------------------------------------------------------
| ResponseFactory
|--------------------------------------------------------------------------
|
| These tests ensures the API of the response factory.
|
*/

const responseFactory = new ResponseFactory(new StreamFactory());
expectAssignable<ResponseFactoryInterface>(responseFactory);
expectType<Response>(responseFactory.createResponse(ResponseStatus.OK, ""));
expectType<Response>(responseFactory.createResponse(ResponseStatus.OK));

/*
|--------------------------------------------------------------------------
| StreamFactory
|--------------------------------------------------------------------------
|
| These tests ensures the API of the stream factory.
|
*/

const streamFactory = new StreamFactory();
expectAssignable<StreamFactoryInterface>(streamFactory);
expectType<Duplex>(streamFactory.createStream(""));

/*
|--------------------------------------------------------------------------
| Stream
|--------------------------------------------------------------------------
|
| These tests ensures the API of the stream.
|
*/

const stream = new StringStream("");
new StringStream();
expectAssignable<Duplex>(stream);
