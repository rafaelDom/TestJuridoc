"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Subject_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Generic subject class.
 */
let Subject = Subject_1 = class Subject {
    /**
     * Generic subject class.
     */
    constructor() {
        /**
         * List of observers.
         */
        this.observers = [];
    }
    /**
     * Number of registered observers.
     */
    get length() {
        return this.observers.length;
    }
    /**
     * Subscribes the specified source into the subject.
     * @param source Source instance.
     * @returns Returns the own instance.
     */
    subscribe(source) {
        if (source instanceof Subject_1) {
            for (const observer of source.observers) {
                this.observers.push(observer);
            }
        }
        else {
            this.observers.push(source);
        }
        return this;
    }
    /**
     * Determines whether the subject contains the specified observer or not.
     * @param observer Observer instance.
     * @returns Returns true when the observer was found, false otherwise.
     */
    contains(observer) {
        return this.observers.indexOf(observer) !== -1;
    }
    /**
     * Unsubscribes the specified observer from the subject.
     * @param observer Observer instance.
     * @returns Returns true when the observer was removed, false when the observer does not exists in the subject.
     */
    unsubscribe(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Notify all registered observers.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyAllSync(value) {
        for (const observer of this.observers) {
            Class.call(observer, value);
        }
        return this;
    }
    /**
     * Notify all registered observers asynchronously.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    async notifyAll(value) {
        for (const observer of this.observers) {
            await Class.call(observer, value);
        }
        return this;
    }
    /**
     * Notify all registered observers step by step with an iterator.
     * @param value Notification value.
     * @returns Returns a new notification iterator.
     */
    *notifyStep(value) {
        for (const observer of this.observers) {
            yield Class.call(observer, value);
        }
        return this;
    }
};
__decorate([
    Class.Protected()
], Subject.prototype, "observers", void 0);
__decorate([
    Class.Public()
], Subject.prototype, "length", null);
__decorate([
    Class.Public()
], Subject.prototype, "subscribe", null);
__decorate([
    Class.Public()
], Subject.prototype, "contains", null);
__decorate([
    Class.Public()
], Subject.prototype, "unsubscribe", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyAllSync", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyAll", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyStep", null);
Subject = Subject_1 = __decorate([
    Class.Describe()
], Subject);
exports.Subject = Subject;
