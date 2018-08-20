"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Response_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Application response helper class.
 */
let Response = Response_1 = class Response {
    /**
     * Set a response header.
     * @param output Output information.
     * @param name Header name.
     * @param value Header value.
     */
    static setHeader(output, name, value) {
        output.headers[name] = value;
    }
    /**
     * Set multi response headers.
     * @param output Output information.
     * @param headers Headers to be set.
     */
    static setMultiHeaders(output, headers) {
        for (const name in headers) {
            Response_1.setHeader(output, name, headers[name]);
        }
    }
    /**
     * Set the access control headers.
     * @param output Output information.
     * @param access Access information.
     */
    static setAccessControl(output, access) {
        Response_1.setMultiHeaders(output, {
            'Access-Control-Allow-Origin': access.origin || '*',
            'Access-Control-Allow-Credentials': access.credentials ? 'true' : 'false',
            'Access-Control-Allow-Methods': access.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'Access-Control-Allow-Headers': access.headers || ''
        });
    }
    /**
     * Set the response status.
     * @param output Output information.
     * @param status Status code.
     */
    static setStatus(output, status) {
        if (!Response_1.messages[status]) {
            throw new TypeError(`Nonexistent status '${status}' can't be set.`);
        }
        output.message = Response_1.messages[status];
        output.status = status;
    }
    /**
     * Set the response content.
     * @param output Output information.
     * @param data Output data.
     * @param mime Output MIME type.
     */
    static setContent(output, data, mime) {
        Response_1.setHeader(output, 'Content-Type', mime || 'application/octet-stream');
        output.data = data;
    }
    /**
     * Set the response content attachment.
     * @param output Output information.
     * @param name Downloaded file name.
     * @param data Output data to download.
     * @param mime Output MIME type.
     */
    static setContentAttachment(output, name, data, mime) {
        Response_1.setHeader(output, 'Content-Disposition', `attachment filename='${name}'`);
        Response_1.setContent(output, data, mime);
    }
    /**
     * Set the response content JSON.
     * @param output Output information.
     * @param content Output content.
     */
    static setContentJson(output, content) {
        Response_1.setContent(output, JSON.stringify(content), 'application/json');
    }
    /**
     * Set the response status and the response content JSON.
     * @param output Output information.
     * @param status Output status.
     * @param message Output message.
     */
    static setStatusJson(output, status, message) {
        Response_1.setStatus(output, status);
        Response_1.setContentJson(output, { status: status, message: message || Response_1.messages[status] || '' });
    }
};
/**
 * Messages by status.
 */
Response.messages = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    427: 'Unassigned',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    430: 'Unassigned',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required'
};
__decorate([
    Class.Private()
], Response, "messages", void 0);
__decorate([
    Class.Public()
], Response, "setHeader", null);
__decorate([
    Class.Public()
], Response, "setMultiHeaders", null);
__decorate([
    Class.Public()
], Response, "setAccessControl", null);
__decorate([
    Class.Public()
], Response, "setStatus", null);
__decorate([
    Class.Public()
], Response, "setContent", null);
__decorate([
    Class.Public()
], Response, "setContentAttachment", null);
__decorate([
    Class.Public()
], Response, "setContentJson", null);
__decorate([
    Class.Public()
], Response, "setStatusJson", null);
Response = Response_1 = __decorate([
    Class.Describe()
], Response);
exports.Response = Response;
