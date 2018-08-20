"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Http = require("http");
const Url = require("url");
const Class = require("@singleware/class");
const Observable = require("@singleware/observable");
/**
 * Back-end HTTP service class.
 */
let Server = class Server {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        /**
         * Service events.
         */
        this.events = {
            receive: new Observable.Subject(),
            send: new Observable.Subject()
        };
        Class.update(this);
        this.settings = settings;
        this.server = Http.createServer(Class.bindCallback(this.requestHandler));
    }
    /**
     * Create an unprocessed request with the specified parameters.
     * @param path Request path
     * @param method Request method.
     * @param address Request address.
     * @param headers Request headers.
     * @returns Returns the created request object.
     */
    createRequest(path, method, address, headers) {
        return {
            path: path,
            input: { method: method, address: address, headers: headers, data: '' },
            output: { status: 0, message: '', headers: {}, data: '' },
            environment: {}
        };
    }
    /**
     * Request event handler
     * @param request Request message.
     * @param response Response message.
     */
    requestHandler(incoming, response) {
        const path = Url.parse(incoming.url || '/').pathname || '/';
        const method = (incoming.method || 'GET').toUpperCase();
        const address = incoming.connection.address().address;
        const request = this.createRequest(path, method, address, incoming.headers);
        incoming.on('data', (chunk) => (request.input.data += chunk));
        incoming.on('end', Class.bindCallback(() => this.responseHandler(request, response)));
    }
    /**
     * Response event handler.
     * @param request Request information.
     * @param response Response manager.
     */
    async responseHandler(request, response) {
        try {
            await this.events.receive.notifyAll(request);
        }
        catch (exception) {
            const input = request.input;
            request = this.createRequest('!', input.method, input.address, input.headers);
            request.environment.exception = this.settings.debug ? exception.stack : exception.message;
            await this.events.receive.notifyAll(request);
        }
        finally {
            const output = request.output;
            response.writeHead(output.status || 501, output.message || 'Not Implemented', output.headers);
            response.end(output.data, Class.bindCallback(() => this.events.send.notifyAll(request)));
        }
    }
    /**
     * Receive request event.
     */
    get onReceive() {
        return this.events.receive;
    }
    /**
     * Send response event.
     */
    get onSend() {
        return this.events.send;
    }
    /**
     * Starts the service listening.
     */
    start() {
        this.server.listen(this.settings.port, this.settings.host, this.settings.limit);
    }
    /**
     * Stops the service listening.
     */
    stop() {
        this.server.close();
    }
};
__decorate([
    Class.Private()
], Server.prototype, "server", void 0);
__decorate([
    Class.Private()
], Server.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Server.prototype, "events", void 0);
__decorate([
    Class.Private()
], Server.prototype, "createRequest", null);
__decorate([
    Class.Private()
], Server.prototype, "requestHandler", null);
__decorate([
    Class.Private()
], Server.prototype, "responseHandler", null);
__decorate([
    Class.Public()
], Server.prototype, "onReceive", null);
__decorate([
    Class.Public()
], Server.prototype, "onSend", null);
__decorate([
    Class.Public()
], Server.prototype, "start", null);
__decorate([
    Class.Public()
], Server.prototype, "stop", null);
Server = __decorate([
    Class.Describe()
], Server);
exports.Server = Server;
