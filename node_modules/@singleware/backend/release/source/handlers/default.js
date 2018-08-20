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
const Fs = require("fs");
const Path = require("path");
const Util = require("util");
const Class = require("@singleware/class");
const Application = require("@singleware/application");
const response_1 = require("../response");
/**
 * Back-end default handler class.
 */
let Default = class Default {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        this.settings = settings;
    }
    /**
     * Set the content of the specified file into the given output.
     * @param output Output response.
     * @param path File path.
     */
    async setFile(output, path) {
        const type = Path.extname(path).substring(1);
        const file = Path.join(this.settings.directory, path);
        const mime = this.settings.strict ? this.settings.types[type] : this.settings.types[type] || 'application/octet-stream';
        if (!mime || !Fs.existsSync(file) || !Fs.lstatSync(file).isFile()) {
            response_1.Response.setStatus(output, 404);
        }
        else {
            response_1.Response.setStatus(output, 200);
            response_1.Response.setContent(output, await Util.promisify(Fs.readFile)(file), mime);
        }
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
    /**
     * Default processor.
     * @param match Route match.
     */
    async defaultProcessor(match) {
        const path = match.detail.path === '/' ? Path.basename(this.settings.index) : Path.normalize(match.detail.path);
        await this.setFile(match.detail.output, path);
    }
};
__decorate([
    Class.Private()
], Default.prototype, "settings", void 0);
__decorate([
    Class.Protected()
], Default.prototype, "setFile", null);
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
    Class.Public(),
    Application.Processor({ path: '/', exact: false, environment: { methods: 'GET', access: {} } })
], Default.prototype, "defaultProcessor", null);
Default = __decorate([
    Class.Describe()
], Default);
exports.Default = Default;
