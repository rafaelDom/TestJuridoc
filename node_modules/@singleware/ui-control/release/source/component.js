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
const DOM = require("@singleware/jsx");
/**
 * Control component class.
 */
let Component = class Component {
    /**
     * Default constructor.
     * @param properties Initial properties.
     * @param children Initial children.
     */
    constructor(properties, children) {
        this.properties = Object.freeze(properties || {});
        this.children = Object.freeze(children || []);
    }
    /**
     * Binds the specified descriptor from the given prototype to be called with the current access rules.
     * @param prototype Source prototype.
     * @param property Property name.
     * @returns Returns a new property descriptor.
     * @throws Throws an error when the specified property was not found.
     */
    bindDescriptor(prototype, property) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
        if (!descriptor) {
            throw new Error(`Property '${property}' was not found.`);
        }
        return Class.bindDescriptor(descriptor);
    }
    /**
     * Get control instance.
     */
    get element() {
        return DOM.create("div", null);
    }
};
__decorate([
    Class.Protected()
], Component.prototype, "properties", void 0);
__decorate([
    Class.Protected()
], Component.prototype, "children", void 0);
__decorate([
    Class.Protected()
], Component.prototype, "bindDescriptor", null);
__decorate([
    Class.Public()
], Component.prototype, "element", null);
Component = __decorate([
    Class.Describe()
], Component);
exports.Component = Component;
