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
const response_1 = require("../../response");
/**
 * Default JSON handler class.
 */
let Default = class Default {
    /**
     * Default constructor.
     * @param settings Handler settings.
     */
    constructor(settings) {
        this.settings = settings;
    }
    /**
     * Exception response processor.
     * @param match Matched route.
     */
    exceptionResponse(match) {
        response_1.Response.setStatusJson(match.detail.output, 500, match.detail.environment.exception);
    }
    /**
     * Default response processor.
     * @param match Matched route.
     */
    async defaultResponse(match) {
        response_1.Response.setStatusJson(match.detail.output, 501);
    }
};
__decorate([
    Class.Private()
], Default.prototype, "settings", void 0);
__decorate([
    Class.Public(),
    Application.Processor({ path: '!', environment: { methods: '*' } })
], Default.prototype, "exceptionResponse", null);
__decorate([
    Class.Public(),
    Application.Processor({ path: '/', exact: false, environment: { methods: '*', access: {} } })
], Default.prototype, "defaultResponse", null);
Default = __decorate([
    Class.Describe()
], Default);
exports.Default = Default;
