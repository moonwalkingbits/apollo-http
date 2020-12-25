/*
 * Copyright (c) 2020 Martin Pettersson
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Duplex } from "stream";

declare type Readable = import("stream").Readable;
declare type Writable = import("stream").Writable;

declare class HeaderCollection {
    public constructor(headers?: {[name: string]: Array<string>});
    public all(): {[name: string]: Array<string>};
    public has(name: string): boolean;
    public get(name: string): Array<string>;
    public set(name: string, value: string | Array<string>): void;
    public add(name: string, value: string | Array<string>): void;
    public remove(name: string): void;
}

declare interface MessageInterface {
    readonly protocolVersion: string;
    readonly headers: {[name: string]: Array<string>};
    readonly body: Readable | Writable;
    withProtocolVersion(protocolVersion: string): this;
    hasHeader(name: string): boolean;
    header(name: string): Array<string>;
    headerLine(name: string): string;
    withHeader(name: string, value: string | Array<string>): this;
    withAddedHeader(name: string, value: string | Array<string>): this;
    withoutHeader(name: string): this;
    withBody(body: Readable | Writable): this;
}

declare class Message implements MessageInterface {
    public constructor(protocolVersion: string, headers: HeaderCollection, body: Readable | Writable);
    public get protocolVersion(): string;
    public withProtocolVersion(protocolVersion: string): this;
    public get headers(): {[name: string]: Array<string>};
    public hasHeader(name: string): boolean;
    public header(name: string): Array<string>;
    public headerLine(name: string): string;
    public withHeader(name: string, value: string | Array<string>): this;
    public withAddedHeader(name: string, value: string | Array<string>): this;
    public withoutHeader(name: string): this;
    public get body(): Readable | Writable;
    public withBody(body: Readable | Writable): this;
}

declare interface UrlInterface {
    readonly scheme: string;
    readonly authority: string;
    readonly userInfo: string;
    readonly host: string;
    readonly port: number | null;
    readonly path: string;
    readonly query: string;
    readonly fragment: string;
    withScheme(scheme: string): Url;
    withUserInfo(user: string, password?: string): Url;
    withHost(host: string): Url;
    withPort(port: number | null): Url;
    withPath(path: string): Url;
    withQuery(query: string): Url;
    withFragment(fragment: string): Url;
    toString(): string;
}

declare class Url implements UrlInterface {
    public constructor(
        scheme?: string,
        user?: string,
        password?: string,
        host?: string,
        port?: number,
        path?: string,
        query?: string,
        fragment?: string
    );
    public get scheme(): string;
    public get authority(): string;
    public get userInfo(): string;
    public get host(): string;
    public get port(): number | null;
    public get path(): string;
    public get query(): string;
    public get fragment(): string;
    public withScheme(scheme: string): Url;
    public withUserInfo(user: string, password?: string): Url;
    public withHost(host: string): Url;
    public withPort(port: number | null): Url;
    public withPath(path: string): Url;
    public withQuery(query: string): Url;
    public withFragment(fragment: string): Url;
    public toString(): string;
}

declare interface UrlFactoryInterface {
    createUrl(urlString: string): Url;
}

declare class UrlFactory implements UrlFactoryInterface {
    public constructor();
    public createUrl(urlString: string): Url;
}

declare enum RequestMethod {
    OPTIONS = "OPTIONS",
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    TRACE = "TRACE",
    CONNECT = "CONNECT"
}

declare interface RequestInterface extends MessageInterface {
    readonly method: RequestMethod;
    readonly url: Url;
    readonly target: string;
    withMethod(method: RequestMethod): Request;
    withUrl(url: Url, preserveHost?: boolean): Request;
    withTarget(target: string): Request;
}

declare class Request extends Message implements RequestInterface {
    public constructor(
        method: RequestMethod,
        url: UrlInterface,
        protocolVersion: string,
        headers: HeaderCollection,
        body: Readable,
        target?: string,
        shouldAddHostHeader?: boolean
    );
    public get method(): RequestMethod;
    public withMethod(method: RequestMethod): Request;
    public get url(): Url;
    public withUrl(url: Url, preserveHost?: boolean): Request;
    public get target(): string;
    public withTarget(target: string): Request;
}

declare interface RequestFactoryInterface {
    createRequest(method: RequestMethod, url: Url | string): Request;
}

declare class RequestFactory implements RequestFactoryInterface {
    constructor(urlFactory: UrlFactoryInterface);
    public createRequest(method: RequestMethod, url: Url | string): Request;
}

declare enum ResponseStatus {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    USE_PROXY = 305,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    REQUEST_URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    IM_A_TEAPOT = 418,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    CONNECTION_CLOSED_WITHOUT_RESPONSE = 444,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,
    CLIENT_CLOSED_REQUEST = 499,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511,
    NETWORK_CONNECT_TIMEOUT_ERROR = 599
}

declare interface ResponseInterface {
    readonly statusCode: ResponseStatus;
    readonly reasonPhrase: string;
    withStatus(code: ResponseStatus, reasonPhrase?: string): Response;
}

declare class Response extends Message implements ResponseInterface {
    constructor(
        statusCode: ResponseStatus,
        protocolVersion: string,
        headers: HeaderCollection,
        body: Writable,
        reasonPhrase?: string
    );
    public get statusCode(): ResponseStatus;
    public get reasonPhrase(): string;
    public withStatus(code: ResponseStatus, reasonPhrase?: string): Response;
}

declare interface ResponseFactoryInterface {
    createResponse(statusCode: ResponseStatus, reasonPhrase?: string): Response;
}

declare class ResponseFactory implements ResponseFactoryInterface {
    public constructor(streamFactory: StreamFactoryInterface);
    public createResponse(statusCode: ResponseStatus, reasonPhrase?: string): Response;
}

declare class StringStream extends Duplex {
    public constructor(content?: string);
}

declare interface StreamFactoryInterface {
    createStream(content: string): Duplex;
}

declare class StreamFactory implements StreamFactoryInterface {
    public createStream(content: string): Duplex;
}

export {
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
};
