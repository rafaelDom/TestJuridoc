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
const Class = require("@singleware/class");
const Application = require("@singleware/application");
const response_1 = require("./response");
/**
 * Back-end application class.
 */
let Main = class Main extends Application.Main {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        super({ separator: '/', variable: /^\{([a-z_0-9]+)\}$/ });
        this.settings = settings;
    }
    /**
     * Process event handler.
     * @param match Matched routes.
     * @param callback Handler callback.
     */
    async process(match, callback) {
        const methods = match.variables.methods;
        const access = match.variables.access;
        const output = match.detail.output;
        const input = match.detail.input;
        if (input.method === 'OPTIONS' && access) {
            access.origin = access.origin || input.headers['origin'];
            response_1.Response.setAccessControl(output, match.variables.access);
            response_1.Response.setStatus(output, 204);
        }
        else if ((methods instanceof Array && methods.indexOf(input.method) !== -1) || methods === input.method || methods === '*') {
            await super.process(match, callback);
        }
        else {
            await match.next();
        }
    }
};
__decorate([
    Class.Protected()
], Main.prototype, "settings", void 0);
__decorate([
    Class.Protected()
], Main.prototype, "process", null);
Main = __decorate([
    Class.Describe()
], Main);
exports.Main = Main;
