"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Default_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Fs = require("fs");
const Path = require("path");
const Util = require("util");
const Class = require("@singleware/class");
const Application = require("@singleware/application");
const response_1 = require("../../response");
/**
 * Default file handler class.
 */
let Default = Default_1 = class Default {
    /**
     * Default constructor.
     * @param settings Handler settings.
     */
    constructor(settings) {
        this.settings = settings;
    }
    /**
     * Gets the MIME type that corresponds to the extension of the specified file.
     * @param path File path.
     * @returns Returns the corresponding MIME type or undefined when the type was not found.
     */
    getMimeType(path) {
        const type = Path.extname(path)
            .substring(1)
            .toLowerCase();
        if (!this.settings.strict) {
            return this.settings.types[type] || 'application/octet-stream';
        }
        return this.settings.types[type];
    }
    /**
     * Read all content of the specified file.
     * @param path File path.
     * @returns Returns the file content.
     */
    async readFile(path) {
        return await Util.promisify(Fs.readFile)(path);
    }
    /**
     * Test whether the specified file exists or not.
     * @param path File path.
     * @returns Returns the promise to get true when the file exists or false otherwise.
     */
    async fileExists(path) {
        if (!(await Util.promisify(Fs.exists)(path))) {
            return false;
        }
        return (await Util.promisify(Fs.lstat)(path)).isFile();
    }
    /**
     * Set the content of a default error file into the give output response.
     * @param output Output response.
     * @param status Output status.
     * @param information Error information.
     */
    async setResponseError(output, status, information) {
        const path = Path.join(Default_1.assetsPath, `${status}.html`);
        response_1.Response.setStatus(output, status);
        if (await this.fileExists(path)) {
            const variables = {
                '!STATUS!': status.toString(),
                '!MESSAGE!': output.message,
                '!INFORMATION!': information
            };
            const replacement = new RegExp(Object.keys(variables).join('|'), 'g');
            const template = (await this.readFile(path)).toString('utf-8');
            const content = template.replace(replacement, (match) => variables[match]);
            const type = this.settings.types.html || 'text/html';
            response_1.Response.setContent(output, content, type);
        }
    }
    /**
     * Set the content of the specified file into the given output response.
     * @param output Output response.
     * @param path File path.
     */
    async setResponseFile(output, path) {
        const type = this.getMimeType(path);
        const file = Path.join(this.settings.directory, Path.normalize(path));
        if (!type || !(await this.fileExists(file))) {
            await this.setResponseError(output, 404, `File '${path}' could not be found`);
        }
        else {
            response_1.Response.setStatus(output, 200);
            response_1.Response.setContent(output, await this.readFile(file), type);
        }
    }
    /**
     * Exception response processor.
     * @param match Matched rote.
     */
    async exceptionResponse(match) {
        await this.setResponseError(match.detail.output, 500, match.detail.environment.exception);
    }
    /**
     * Default response processor.
     * @param match Matched rote.
     */
    async defaultResponse(match) {
        const path = match.detail.path === '/' ? Path.basename(this.settings.index) : Path.normalize(match.detail.path);
        await this.setResponseFile(match.detail.output, path);
    }
    /**
     * Get base directory.
     */
    get directory() {
        return this.settings.directory;
    }
    /**
     * Get index file.
     */
    get index() {
        return this.settings.index;
    }
    /**
     * Get strict status.
     */
    get strict() {
        return this.settings.strict || false;
    }
    /**
     * Get handler types.
     */
    get types() {
        return this.settings.types;
    }
};
/**
 * Assets path.
 */
Default.assetsPath = Path.join(__dirname, '../../../../assets/');
__decorate([
    Class.Private()
], Default.prototype, "settings", void 0);
__decorate([
    Class.Protected()
], Default.prototype, "getMimeType", null);
__decorate([
    Class.Protected()
], Default.prototype, "readFile", null);
__decorate([
    Class.Protected()
], Default.prototype, "fileExists", null);
__decorate([
    Class.Protected()
], Default.prototype, "setResponseError", null);
__decorate([
    Class.Protected()
], Default.prototype, "setResponseFile", null);
__decorate([
    Class.Public(),
    Application.Processor({ path: '!', environment: { methods: '*' } })
], Default.prototype, "exceptionResponse", null);
__decorate([
    Class.Public(),
    Application.Processor({ path: '/', exact: false, environment: { methods: 'GET', access: {} } })
], Default.prototype, "defaultResponse", null);
__decorate([
    Class.Public()
], Default.prototype, "directory", null);
__decorate([
    Class.Public()
], Default.prototype, "index", null);
__decorate([
    Class.Public()
], Default.prototype, "strict", null);
__decorate([
    Class.Public()
], Default.prototype, "types", null);
__decorate([
    Class.Private()
], Default, "assetsPath", void 0);
Default = Default_1 = __decorate([
    Class.Describe()
], Default);
exports.Default = Default;
