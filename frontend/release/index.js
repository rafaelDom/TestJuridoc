/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
'use strict';
var Loader;
(function(Loader) {
  /**
   * All modules.
   */
  const modules = {"@singleware/class/helper":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Provide decorators and methods to protect classes at runtime.
 */
var Helper;
(function (Helper) {
    /**
     * Safe place to map all class instances data.
     */
    const vault = new WeakMap();
    /**
     * Safe place to map all entries of pending asynchronous functions.
     */
    const waiting = new WeakMap();
    /**
     * First call entry.
     */
    const head = {
        name: 'anonymous',
        context: void 0,
        prototype: void 0
    };
    /**
     * Safe place to put all entries of the function calls.
     */
    var stack = head;
    /**
     * Restores the current stack for the given context.
     * @param context Method context.
     * @returns Returns true when the context was restored, false otherwise.
     */
    function contextRestore(context) {
        if (!waiting.has(context)) {
            return false;
        }
        stack = waiting.get(context);
        waiting.delete(context);
        return true;
    }
    /**
     * Resolves the current stack for the given context.
     * @param context Method context.
     * @param prototype Method prototype.
     * @returns Returns true when the context was resolved, false otherwise.
     */
    function contextResolve(context, prototype) {
        if (stack.context !== prototype) {
            return false;
        }
        stack.context = context;
        return true;
    }
    /**
     * Insert the specified call entry into the call list.
     * @param entry Entry instance.
     * @returns Returns the inserted entry.
     */
    function insertEntry(entry) {
        if ((entry.next = stack.next)) {
            stack.next.previous = entry;
        }
        stack.next = entry;
        return entry;
    }
    /**
     * Removes the specified call entry from the call list.
     * @param entry Entry instance.
     * @returns Returns the inserted entry.
     */
    function removeEntry(entry) {
        const previous = entry.previous;
        const next = entry.next;
        if ((previous.next = next)) {
            next.previous = previous;
        }
        return entry;
    }
    /**
     * Performs the specified callback asynchronously setting the call entry to ensure its access rules.
     * @param entry Call entry.
     * @param callback Method callback.
     * @param parameters Method parameters.
     * @returns Returns the promise of the called method.
     */
    async function asyncWrappedCall(entry, callback, ...parameters) {
        try {
            stack = insertEntry(entry);
            const promise = callback.call(entry.context, ...parameters);
            const previous = entry.previous;
            const result = await promise;
            if (previous.context === entry.context) {
                waiting.set(entry.context, previous);
            }
            return result;
        }
        catch (exception) {
            throw exception;
        }
        finally {
            stack = removeEntry(entry).previous;
        }
    }
    /**
     * Performs the specified callback synchronously setting the call entry to ensure its access rules.
     * @param entry Call entry.
     * @param callback Method callback.
     * @param parameters Method parameters.
     * @returns Returns the same value of the called method.
     */
    function syncWrappedCall(entry, callback, ...parameters) {
        try {
            stack = insertEntry(entry);
            return callback.call(entry.context, ...parameters);
        }
        catch (exception) {
            throw exception;
        }
        finally {
            stack = removeEntry(entry).previous;
        }
    }
    /**
     * Performs the specified callback setting the call entry to ensure its access rules.
     * @param context Method context.
     * @param prototype Method prototype.
     * @param callback Method callback.
     * @param parameters Method parameters.
     * @returns Returns the same value from the called method.
     * @throws Throws the same exception from the called method.
     */
    function wrappedCall(context, prototype, callback, ...parameters) {
        const entry = { name: callback.name, context: context, prototype: prototype, previous: stack, next: void 0 };
        if (callback.constructor.name === 'AsyncFunction') {
            const saved = stack;
            const promise = asyncWrappedCall(entry, callback, ...parameters);
            stack = saved;
            return promise;
        }
        else {
            return syncWrappedCall(entry, callback, ...parameters);
        }
    }
    /**
     * Creates a new member with getter and setter to manage and hide class properties.
     * @param property Property name.
     * @param value Property value.
     * @returns Returns the created property descriptor.
     */
    function createMember(property, value) {
        let data;
        return {
            get: function () {
                return (data = vault.get(this)) ? data[property] : value;
            },
            set: function (value) {
                if (!(data = vault.get(this))) {
                    vault.set(this, (data = {}));
                }
                data[property] = value;
            }
        };
    }
    /**
     * Wraps the specified property with the given callback to ensure its access rules at runtime.
     * @param wrapper Wrapper callback.
     * @param prototype Property prototype.
     * @param property Property name.
     * @param descriptor Property descriptor.
     * @returns Returns the specified property descriptor.
     */
    function wrapMember(wrapper, prototype, property, descriptor) {
        descriptor.enumerable = false;
        descriptor.configurable = false;
        if (descriptor.value instanceof Function) {
            descriptor.writable = false;
            wrapper('value', prototype, property, descriptor);
        }
        else {
            if (descriptor.set instanceof Function) {
                wrapper('set', prototype, property, descriptor);
            }
            if (descriptor.get instanceof Function) {
                descriptor.enumerable = true;
                wrapper('get', prototype, property, descriptor);
            }
        }
        return descriptor;
    }
    /**
     * Wrapper to set the specified property descriptor as public member at runtime.
     * @param type Property type.
     * @param prototype Property prototype.
     * @param property Property name.
     * @param descriptor Property descriptor.
     */
    function wrapAsPublic(type, prototype, property, descriptor) {
        const callback = descriptor[type];
        descriptor[type] = function callAsPublic(...parameters) {
            contextRestore(this) || contextResolve(this, prototype);
            return wrappedCall(this, prototype, callback, ...parameters);
        };
    }
    /**
     * Wrapper to set the specified property descriptor as protected member at runtime.
     * @param type Property type.
     * @param prototype Property prototype.
     * @param property Property name.
     * @param descriptor Property descriptor.
     * @throws Throws a type error when the access to the wrapped method is denied.
     */
    function wrapAsProtected(type, prototype, property, descriptor) {
        const callback = descriptor[type];
        descriptor[type] = function callAsProtected(...parameters) {
            contextRestore(this) || contextResolve(this, prototype);
            const constructor = prototype.constructor;
            if (!stack.context || (!(stack.context instanceof constructor) && !(stack.context.constructor instanceof constructor))) {
                throw new TypeError(`Access to protected member '${property}' has been denied.`);
            }
            return wrappedCall(this, prototype, callback, ...parameters);
        };
    }
    /**
     * Wrapper to set the specified property descriptor as private member at runtime.
     * @param type Property type.
     * @param prototype Property prototype.
     * @param property Property name.
     * @param descriptor Property descriptor.
     * @throws Throws a type error when the access to the wrapped method is denied.
     */
    function wrapAsPrivate(type, prototype, property, descriptor) {
        const callback = descriptor[type];
        descriptor[type] = function callAsPrivate(...parameters) {
            contextRestore(this) || contextResolve(this, prototype);
            if (!stack.prototype || (stack.prototype !== prototype && stack.prototype.constructor !== prototype)) {
                throw new TypeError(`Access to private member '${property}' has been denied.`);
            }
            return wrappedCall(this, prototype, callback, ...parameters);
        };
    }
    /**
     * Decorates the specified class to ensure its access rules at runtime.
     * @returns Returns the decorator method.
     */
    function Describe() {
        return (type) => {
            return new Proxy(type, {
                construct: (type, parameters, target) => {
                    return wrappedCall(type.prototype, type.prototype, Reflect.construct, type, parameters, target);
                }
            });
        };
    }
    Helper.Describe = Describe;
    /**
     * Decorates the specified property to be public at runtime.
     * @returns Returns the decorator method.
     */
    function Public() {
        return (prototype, property, descriptor) => {
            return wrapMember(wrapAsPublic, prototype, property, descriptor || createMember(property, prototype[property]));
        };
    }
    Helper.Public = Public;
    /**
     * Decorates the specified property to be protected at runtime.
     * @returns Returns the decorator method.
     */
    function Protected() {
        return (prototype, property, descriptor) => {
            return wrapMember(wrapAsProtected, prototype, property, descriptor || createMember(property, prototype[property]));
        };
    }
    Helper.Protected = Protected;
    /**
     * Decorates the specified property to be private at runtime.
     * @returns Returns the decorator method.
     */
    function Private() {
        return (prototype, property, descriptor) => {
            return wrapMember(wrapAsPrivate, prototype, property, descriptor || createMember(property, prototype[property]));
        };
    }
    Helper.Private = Private;
    /**
     * Gets the current information about the call stack.
     * @returns Returns an array containing the stack information.
     */
    function trace() {
        const stack = [];
        let current = head;
        while (current) {
            stack.push({
                context: current.prototype ? current.prototype.name || current.prototype.constructor.name : 'global',
                method: current.name
            });
            current = current.next;
        }
        return stack;
    }
    Helper.trace = trace;
    /**
     * Updates the specified instance into the current context.
     * @param instance Context instance.
     */
    function update(instance) {
        if (stack.context === stack.prototype) {
            if (Object.getPrototypeOf(instance) !== stack.prototype) {
                throw new Error(`The specified instance must be of type "${stack.prototype.constructor.name}"`);
            }
            stack.context = instance;
        }
    }
    Helper.update = update;
    /**
     * Calls the specified callback with the given parameters exposing only public members.
     * @param callback Method callback.
     * @param parameters Method parameters.
     * @returns Returns the same value from the called method.
     * @throws Throws the same exception from the called method.
     */
    function call(callback, ...parameters) {
        return wrappedCall(void 0, void 0, callback, ...parameters);
    }
    Helper.call = call;
    /**
     * Binds the specified callback to be called with the current access rules.
     * @param callback Method callback.
     * @returns Returns the same value of the called method.
     * @throws Throws an error when the current context is not defined.
     */
    function bindCallback(callback) {
        const context = stack.context;
        const prototype = stack.prototype;
        if (!context || !prototype) {
            throw new Error(`There is no current context.`);
        }
        if (stack.context === stack.prototype) {
            throw new Error('There is no resolved context, please call update() method.');
        }
        return function (...parameters) {
            return wrappedCall(context, prototype, callback, ...parameters);
        };
    }
    Helper.bindCallback = bindCallback;
    /**
     * Binds the specified property descriptor to be called with the current access rules.
     * @param descriptor Property descriptor.
     * @returns Returns a new property descriptor.
     * @throws Throws an error when the specified property was not found.
     */
    function bindDescriptor(descriptor) {
        const modified = { ...descriptor };
        if (modified.value) {
            modified.value = bindCallback(modified.value);
        }
        else {
            if (modified.get) {
                modified.get = bindCallback(modified.get);
            }
            if (modified.set) {
                modified.set = bindCallback(modified.set);
            }
        }
        return modified;
    }
    Helper.bindDescriptor = bindDescriptor;
    /**
     * Binds the specified callback or property descriptor to be called with the current access rules.
     * @param input Method callback or property descriptor.
     * @returns Returns the same value of the called method or property.
     * @throws Throws an error when the current context is not defined.
     */
    function bind(input) {
        return input instanceof Function ? bindCallback(input) : bindDescriptor(input);
    }
    Helper.bind = bind;
})(Helper = exports.Helper || (exports.Helper = {}));
}},"@singleware/class/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const helper_1 = require("./helper");
// Aliases
exports.Describe = helper_1.Helper.Describe;
exports.Public = helper_1.Helper.Public;
exports.Protected = helper_1.Helper.Protected;
exports.Private = helper_1.Helper.Private;
exports.trace = helper_1.Helper.trace;
exports.update = helper_1.Helper.update;
exports.call = helper_1.Helper.call;
exports.bind = helper_1.Helper.bind;
exports.bindCallback = helper_1.Helper.bindCallback;
exports.bindDescriptor = helper_1.Helper.bindDescriptor;
}},"@singleware/class":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/injection/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const manager_1 = require("./manager");
var manager_2 = require("./manager");
exports.Manager = manager_2.Manager;
// Global manager
const global = new manager_1.Manager();
/**
 * Decorates the specified class to be a dependency class.
 * @param settings Dependency settings.
 * @returns Returns the decorator method.
 */
exports.Describe = (settings) => global.Describe(settings);
/**
 * Decorates the specified class to be injected by the specified dependencies.
 * @param list List of dependencies.
 * @returns Returns the decorator method.
 */
exports.Inject = (...list) => global.Inject(...list);
/**
 * Resolves the current instance of the specified class type.
 * @param type Class type.
 * @throws Throws a type error when the class type does not exists in the dependencies.
 * @returns Returns the resolved instance.
 */
exports.resolve = (type) => global.resolve(type);
/**
 * Constructs a new instance of the specified class type.
 * @param type Class type.
 * @param parameters Initial parameters.
 * @returns Returns a new instance of the specified class type.
 */
exports.construct = (type, ...parameters) => global.construct(type, ...parameters);
}},"@singleware/injection":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/injection/manager":{pack:false, invoke:function(exports, require){"use strict";
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
/**
 * Dependency manager class.
 */
let Manager = class Manager {
    /**
     * Dependency manager class.
     */
    constructor() {
        /**
         * Map of singleton instances.
         */
        this.instances = new WeakMap();
        /**
         * Map of dependencies.
         */
        this.dependencies = new WeakMap();
    }
    /**
     * Decorates the specified class to be a dependency class.
     * @param settings Dependency settings.
     * @returns Returns the decorator method.
     */
    Describe(settings) {
        return Class.bindCallback((type) => {
            if (this.dependencies.has(type.prototype)) {
                throw new TypeError(`Dependency type ${type.name} is already described.`);
            }
            this.dependencies.set(type.prototype, settings || {});
        });
    }
    /**
     * Decorates the specified class to be injected by the specified dependencies.
     * @param list List of dependencies.
     * @returns Returns the decorator method.
     */
    Inject(...list) {
        return Class.bindCallback((type) => {
            const repository = this.dependencies;
            return new Proxy(type, {
                construct: (type, parameters, target) => {
                    const dependencies = {};
                    list.map(type => {
                        const instance = this.resolve(type);
                        const settings = repository.get(type.prototype);
                        dependencies[settings.name || type.name] = instance;
                    });
                    return Reflect.construct(type, [dependencies, parameters], target);
                }
            });
        });
    }
    /**
     * Resolves the current instance of the specified class type.
     * @param type Class type.
     * @throws Throws a type error when the class type does not exists in the dependencies.
     * @returns Returns the resolved instance.
     */
    resolve(type) {
        const settings = this.dependencies.get(type.prototype);
        if (!settings) {
            throw new TypeError(`Dependency type ${type ? type.name : void 0} does not exists.`);
        }
        if (!settings.singleton) {
            return new type();
        }
        let instance = this.instances.get(type);
        if (!instance) {
            this.instances.set(type, (instance = new type()));
        }
        return instance;
    }
    /**
     * Constructs a new instance of the specified class type.
     * @param type Class type.
     * @param parameters Initial parameters.
     * @returns Returns a new instance of the specified class type.
     */
    construct(type, ...parameters) {
        return new type(...parameters);
    }
};
__decorate([
    Class.Private()
], Manager.prototype, "instances", void 0);
__decorate([
    Class.Private()
], Manager.prototype, "dependencies", void 0);
__decorate([
    Class.Public()
], Manager.prototype, "Describe", null);
__decorate([
    Class.Public()
], Manager.prototype, "Inject", null);
__decorate([
    Class.Public()
], Manager.prototype, "resolve", null);
__decorate([
    Class.Public()
], Manager.prototype, "construct", null);
Manager = __decorate([
    Class.Describe()
], Manager);
exports.Manager = Manager;
}},"@singleware/observable/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var subject_1 = require("./subject");
exports.Subject = subject_1.Subject;
}},"@singleware/observable":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/observable/subject":{pack:false, invoke:function(exports, require){"use strict";
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
}},"@singleware/pipeline/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var subject_1 = require("./subject");
exports.Subject = subject_1.Subject;
}},"@singleware/pipeline":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/pipeline/subject":{pack:false, invoke:function(exports, require){"use strict";
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
const Observable = require("@singleware/observable");
/**
 * Generic subject class.
 */
let Subject = class Subject extends Observable.Subject {
    /**
     * Notify the first registered observer and remove it.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyFirstSync(value) {
        const observer = this.observers.shift();
        if (observer) {
            Class.call(observer, value);
        }
        return this;
    }
    /**
     * Notify the first registered observer asynchronously and remove it.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    async notifyFirst(value) {
        const observer = this.observers.shift();
        if (observer) {
            await Class.call(observer, value);
        }
        return this;
    }
    /**
     * Notify the last registered observer and remove it.
     * @param value Notification value.
     * @returns Returns the own instance.
     */
    notifyLastSync(value) {
        const observer = this.observers.pop();
        if (observer) {
            Class.call(observer, value);
        }
        return this;
    }
    /**
     * Notify the last registered observer asynchronously and remove it.
     * @param value Notification value.
     * @returns Returns a promise to get the own instance.
     */
    async notifyLast(value) {
        const observer = this.observers.pop();
        if (observer) {
            await Class.call(observer, value);
        }
        return this;
    }
};
__decorate([
    Class.Public()
], Subject.prototype, "notifyFirstSync", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyFirst", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyLastSync", null);
__decorate([
    Class.Public()
], Subject.prototype, "notifyLast", null);
Subject = __decorate([
    Class.Describe()
], Subject);
exports.Subject = Subject;
}},"@singleware/routing/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var match_1 = require("./match");
exports.Match = match_1.Match;
var router_1 = require("./router");
exports.Router = router_1.Router;
}},"@singleware/routing":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/routing/match":{pack:false, invoke:function(exports, require){"use strict";
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
/**
 * Generic match manager class.
 */
let Match = class Match {
    /**
     * Default constructor.
     * @param path Matched path.
     * @param remaining Remaining path.
     * @param variables List of matched variables.
     * @param detail Extra details data for notifications.
     * @param events Pipeline of matched events.
     */
    constructor(path, remaining, variables, detail, events) {
        this.matchPath = path;
        this.matchEvents = events;
        this.matchVariables = variables;
        this.currentVariables = variables.find(() => true);
        this.remainingPath = remaining;
        this.extraDetails = detail;
    }
    /**
     * Current match length.
     */
    get length() {
        return this.matchEvents.length;
    }
    /**
     * Matched path.
     */
    get path() {
        return this.matchPath;
    }
    /**
     * Remaining path.
     */
    get remaining() {
        return this.remainingPath;
    }
    /**
     * Matched variables.
     */
    get variables() {
        return this.currentVariables || {};
    }
    /**
     * Extra details data.
     */
    get detail() {
        return this.extraDetails;
    }
    /**
     * Determines whether it is an exact match or not.
     */
    get exact() {
        return this.remainingPath.length === 0;
    }
    /**
     * Moves to the next matched route and notify it.
     * @returns Returns the own instance.
     */
    nextSync() {
        this.currentVariables = this.matchVariables.shift();
        this.matchEvents.notifyFirstSync(this);
        return this;
    }
    /**
     * Moves to the next matched route and notify it asynchronously.
     * @returns Returns a promise to get the own instance.
     */
    async next() {
        this.currentVariables = this.matchVariables.shift();
        await this.matchEvents.notifyFirst(this);
        return this;
    }
};
__decorate([
    Class.Private()
], Match.prototype, "matchPath", void 0);
__decorate([
    Class.Private()
], Match.prototype, "matchEvents", void 0);
__decorate([
    Class.Private()
], Match.prototype, "matchVariables", void 0);
__decorate([
    Class.Private()
], Match.prototype, "currentVariables", void 0);
__decorate([
    Class.Private()
], Match.prototype, "remainingPath", void 0);
__decorate([
    Class.Private()
], Match.prototype, "extraDetails", void 0);
__decorate([
    Class.Public()
], Match.prototype, "length", null);
__decorate([
    Class.Public()
], Match.prototype, "path", null);
__decorate([
    Class.Public()
], Match.prototype, "remaining", null);
__decorate([
    Class.Public()
], Match.prototype, "variables", null);
__decorate([
    Class.Public()
], Match.prototype, "detail", null);
__decorate([
    Class.Public()
], Match.prototype, "exact", null);
__decorate([
    Class.Public()
], Match.prototype, "nextSync", null);
__decorate([
    Class.Public()
], Match.prototype, "next", null);
Match = __decorate([
    Class.Describe()
], Match);
exports.Match = Match;
}},"@singleware/routing/router":{pack:false, invoke:function(exports, require){"use strict";
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
const Observable = require("@singleware/observable");
const Pipeline = require("@singleware/pipeline");
const match_1 = require("./match");
/**
 * Generic router class.
 */
let Router = class Router {
    /**
     * Default constructor.
     * @param settings Router settings.
     */
    constructor(settings) {
        /**
         * Router entries.
         */
        this.entries = {};
        /**
         * Entries counter.
         */
        this.counter = 0;
        this.settings = settings;
    }
    /**
     * Splits the specified path into an array of directories.
     * @param path Path to be splitted.
     * @returns Returns the array of directories.
     */
    splitPath(path) {
        const pieces = path.split(this.settings.separator);
        const directories = [];
        for (const directory of pieces) {
            if (directory.length) {
                let match;
                if ((match = directory.match(this.settings.variable)) && match[0].length === directory.length) {
                    directories.push(match[1] || match[0]);
                }
                else {
                    directories.push(`${this.settings.separator}${directory}`);
                }
            }
        }
        if (!directories.length) {
            directories.push(this.settings.separator);
        }
        return directories;
    }
    /**
     * Creates a new empty entry.
     * @param pattern Variable pattern.
     * @param variable Variable name.
     * @returns Returns a new entry instance.
     */
    createEntry(pattern, variable) {
        return {
            pattern: pattern,
            variable: variable,
            entries: {},
            environments: { exact: {}, default: {} },
            onExactMatch: new Observable.Subject(),
            onMatch: new Observable.Subject()
        };
    }
    /**
     * Insert all required entries for the specified array of directories.
     * @param directories Array of directories.
     * @param constraint Path constraint.
     * @returns Returns the last inserted entry.
     */
    insertEntries(directories, constraint) {
        let entries = this.entries;
        let entry;
        for (let directory of directories) {
            let variable, pattern;
            if (directory.indexOf(this.settings.separator) === -1) {
                if (!(pattern = constraint[(variable = directory)])) {
                    throw new Error(`Constraint rules for the variable "${variable}" was not found.`);
                }
                directory = pattern.toString();
            }
            if (!(entry = entries[directory])) {
                entries[directory] = entry = this.createEntry(pattern, variable);
                ++this.counter;
            }
            entries = entry.entries;
        }
        return entry;
    }
    /**
     * Search all entries that corresponds to the expected directory.
     * @param expected Expected directory.
     * @param entries Entries to select.
     * @returns Returns the selection results.
     */
    searchEntries(expected, entries) {
        const selection = { directories: [], entries: [], variables: {} };
        const value = expected.substr(this.settings.separator.length);
        for (const directory in entries) {
            const entry = entries[directory];
            if (entry.pattern && entry.variable) {
                let match;
                if ((match = value.match(entry.pattern)) && match[0].length === value.length) {
                    selection.variables[entry.variable] = value;
                    selection.entries.push(entry);
                }
            }
            else if (directory === expected) {
                selection.entries.push(entry);
            }
        }
        return selection;
    }
    /**
     * Collect all entries that corresponds to the specified array of directories.
     * The array of directories will be reduced according to the number of entries found.
     * @param directories Array of directories.
     * @returns Returns the selection results.
     */
    collectEntries(directories) {
        let selection = { directories: [], entries: [], variables: {} };
        let targets = [this.entries];
        while (directories.length && targets.length) {
            const directory = directories[0];
            const tempTargets = [];
            const tempEntries = [];
            let tempVariables = {};
            for (const entries of targets) {
                const tempSelection = this.searchEntries(directory, entries);
                tempVariables = { ...tempSelection.variables, ...tempVariables };
                for (const entry of tempSelection.entries) {
                    tempEntries.push(entry);
                    tempTargets.push(entry.entries);
                }
            }
            targets = tempTargets;
            if (tempEntries.length) {
                selection.entries = tempEntries;
                selection.variables = { ...tempVariables, ...selection.variables };
                selection.directories.push(directories.shift());
            }
        }
        return selection;
    }
    /**
     * Number of routes.
     */
    get length() {
        return this.counter;
    }
    /**
     * Adds the specified routes into the router.
     * @param routes List of routes.
     * @returns Returns the own instance.
     */
    add(...routes) {
        for (const route of routes) {
            const directories = this.splitPath(route.path);
            const entry = this.insertEntries(directories, route.constraint || {});
            if (route.exact) {
                entry.onExactMatch.subscribe(route.onMatch);
                entry.environments.exact = { ...route.environment, ...entry.environments.exact };
            }
            else {
                entry.onMatch.subscribe(route.onMatch);
                entry.environments.default = { ...route.environment, ...entry.environments.default };
            }
        }
        return this;
    }
    /**
     * Match all routes that corresponds to the specified path.
     * @param path Route path.
     * @param detail Extra details data for notifications.
     * @returns Returns the manager for the matched routes.
     */
    match(path, detail) {
        const directories = this.splitPath(path);
        const selection = this.collectEntries(directories);
        if (!selection.entries.length) {
            selection.directories.push(this.settings.separator);
            if (this.entries[this.settings.separator]) {
                selection.entries.push(this.entries[this.settings.separator]);
            }
        }
        const events = new Pipeline.Subject();
        const variables = [];
        const remaining = directories.join('');
        const analysed = selection.directories.join('');
        for (const entry of selection.entries) {
            if (entry.onExactMatch.length && remaining.length === 0) {
                events.subscribe(entry.onExactMatch);
                variables.push({ ...selection.variables, ...entry.environments.exact });
            }
            if (entry.onMatch.length) {
                events.subscribe(entry.onMatch);
                variables.push({ ...selection.variables, ...entry.environments.default });
            }
        }
        return new match_1.Match(analysed, remaining, variables, detail, events);
    }
    /**
     * Clear the router.
     * @returns Returns the own instance.
     */
    clear() {
        this.entries = {};
        this.counter = 0;
        return this;
    }
};
__decorate([
    Class.Private()
], Router.prototype, "entries", void 0);
__decorate([
    Class.Private()
], Router.prototype, "counter", void 0);
__decorate([
    Class.Private()
], Router.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Router.prototype, "splitPath", null);
__decorate([
    Class.Private()
], Router.prototype, "createEntry", null);
__decorate([
    Class.Private()
], Router.prototype, "insertEntries", null);
__decorate([
    Class.Private()
], Router.prototype, "searchEntries", null);
__decorate([
    Class.Private()
], Router.prototype, "collectEntries", null);
__decorate([
    Class.Public()
], Router.prototype, "length", null);
__decorate([
    Class.Public()
], Router.prototype, "add", null);
__decorate([
    Class.Public()
], Router.prototype, "match", null);
__decorate([
    Class.Public()
], Router.prototype, "clear", null);
Router = __decorate([
    Class.Describe()
], Router);
exports.Router = Router;
}},"@singleware/application/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module = require("./main");
exports.Main = Module.Main;
// Aliases
exports.Filter = exports.Main.Filter;
exports.Processor = exports.Main.Processor;
}},"@singleware/application":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/application/main":{pack:false, invoke:function(exports, require){"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Main_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Routing = require("@singleware/routing");
const Injection = require("@singleware/injection");
/**
 * Generic main application class.
 */
let Main = Main_1 = class Main {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        /**
         * DI management.
         */
        this.dependencies = new Injection.Manager();
        /**
         * Array of services.
         */
        this.services = [];
        /**
         * Determines whether the application is started or not.
         */
        this.started = false;
        /**
         * Receiver handler.
         */
        this.receiveHandler = Class.bindCallback(async (request) => {
            this.protectRequest(request);
            const processor = this.processors.match(request.path, request);
            const environment = request.environment;
            do {
                const filter = this.filters.match(request.path, request);
                request.environment = { ...processor.variables, ...environment };
                request.granted = filter.length === 0;
                await filter.next();
                await processor.next();
            } while (processor.length);
        });
        /**
         * Send handler.
         */
        this.sendHandler = Class.bindCallback(async (request) => { });
        const options = {
            separator: settings.separator,
            variable: settings.variable
        };
        this.filters = new Routing.Router(options);
        this.processors = new Routing.Router(options);
    }
    /**
     * Filter event handler.
     * @param match Matched routes.
     * @param callback Handler callback.
     */
    async filter(match, callback) {
        if ((match.detail.granted = await callback(match)) !== false) {
            await match.next();
        }
    }
    /**
     * Process event handler.
     * @param match Matched routes.
     * @param callback Handler callback.
     */
    async process(match, callback) {
        if (match.detail.granted) {
            await callback(match);
        }
    }
    /**
     * Protect all necessary properties of the specified request.
     * @param request Request information.
     */
    protectRequest(request) {
        Object.defineProperties(request, {
            path: { value: request.path, writable: false, configurable: false },
            input: { value: request.input, writable: false, configurable: false },
            output: { value: request.output, writable: false, configurable: false }
        });
    }
    /**
     * Get a new route settings based on the specified action settings.
     * @param action Action settings.
     * @param exact Determines whether the default exact parameter must be true or not.
     * @param handler Callback to handle the route.
     */
    getRoute(action, exact, handler) {
        return {
            path: action.path,
            exact: action.exact === void 0 ? exact : action.exact,
            constraint: action.constraint,
            environment: action.environment,
            onMatch: Class.bindCallback(handler)
        };
    }
    /**
     * Adds a new route filter.
     * @param route Route settings.
     * @param handler Handler class type.
     * @param parameters Handler parameters.
     */
    addFilter(route, handler, ...parameters) {
        this.filters.add(this.getRoute(route.action, false, async (match) => {
            const instance = this.construct(handler, ...parameters);
            await this.filter(match, instance[route.method].bind(instance));
        }));
    }
    /**
     * Adds a new route processor.
     * @param route Route settings.
     * @param handler Handler class type.
     * @param parameters Handler parameters.
     */
    addProcessor(route, handler, ...parameters) {
        this.processors.add(this.getRoute(route.action, true, async (match) => {
            const instance = this.construct(handler, ...parameters);
            await this.process(match, instance[route.method].bind(instance));
        }));
    }
    /**
     * Decorates the specified class to be an application dependency.
     * @param settings Dependency settings.
     * @returns Returns the decorator method.
     */
    Dependency(settings) {
        return this.dependencies.Describe(settings);
    }
    /**
     * Decorates the specified class to be injected by the specified application dependencies.
     * @param list List of dependencies.
     * @returns Returns the decorator method.
     */
    Inject(...list) {
        return this.dependencies.Inject(...list);
    }
    /**
     * Constructs a new instance of the specified class type.
     * @param type Class type.
     * @param parameters Initial parameters.
     * @returns Returns a new instance of the specified class type.
     */
    construct(type, ...parameters) {
        return this.dependencies.construct(type, ...parameters);
    }
    /**
     * Adds an application handler.
     * @param handler Handler class type.
     * @returns Returns the own instance.
     */
    addHandler(handler, ...parameters) {
        if (this.started) {
            throw new Error(`To add a new handler the application must be stopped.`);
        }
        const routes = Main_1.routes.get(handler.prototype.constructor) || [];
        for (const route of routes) {
            switch (route.type) {
                case 'filter':
                    this.addFilter(route, handler, ...parameters);
                    break;
                case 'processor':
                    this.addProcessor(route, handler, ...parameters);
                    break;
            }
        }
        return this;
    }
    /**
     * Adds an application service.
     * @param instance Service class type.
     * @returns Returns the own instance.
     */
    addService(service, ...parameters) {
        if (this.started) {
            throw new Error(`To add a new service the application must be stopped.`);
        }
        this.services.push(this.construct(service, ...parameters));
        return this;
    }
    /**
     * Starts the application with all included services.
     * @returns Returns the own instance.
     */
    start() {
        if (this.started) {
            throw new Error(`Application is already initialized.`);
        }
        for (const service of this.services) {
            service.onReceive.subscribe(this.receiveHandler);
            service.onSend.subscribe(this.sendHandler);
            service.start();
        }
        this.started = true;
        return this;
    }
    /**
     * Stops the application and all included services.
     * @returns Returns the own instance.
     */
    stop() {
        if (!this.started) {
            throw new Error(`Application is not initialized.`);
        }
        for (const service of this.services) {
            service.onReceive.unsubscribe(this.receiveHandler);
            service.onSend.unsubscribe(this.sendHandler);
            service.stop();
        }
        this.started = false;
        return this;
    }
    /**
     * Adds a new route settings.
     * @param handler Handler type.
     * @param route Route settings.
     */
    static addRoute(handler, route) {
        let routes;
        if (!(routes = Main_1.routes.get(handler))) {
            Main_1.routes.set(handler, (routes = []));
        }
        routes.push(route);
    }
    /**
     * Decorates the specified member to filter an application request.
     * @param action Filter action settings.
     * @returns Returns the decorator method.
     */
    static Filter(action) {
        return Class.bindCallback((prototype, property, descriptor) => {
            if (!descriptor || !(descriptor.value instanceof Function)) {
                throw new TypeError(`Only methods are allowed for filters.`);
            }
            Main_1.addRoute(prototype.constructor, { type: 'filter', action: action, method: property });
        });
    }
    /**
     * Decorates the specified member to process an application request.
     * @param action Route action settings.
     * @returns Returns the decorator method.
     */
    static Processor(action) {
        return Class.bindCallback((prototype, property, descriptor) => {
            if (!descriptor || !(descriptor.value instanceof Function)) {
                throw new TypeError(`Only methods are allowed for processors.`);
            }
            Main_1.addRoute(prototype.constructor, { type: 'processor', action: action, method: property });
        });
    }
};
/**
 * Global application routes.
 */
Main.routes = new WeakMap();
__decorate([
    Class.Private()
], Main.prototype, "dependencies", void 0);
__decorate([
    Class.Private()
], Main.prototype, "services", void 0);
__decorate([
    Class.Private()
], Main.prototype, "filters", void 0);
__decorate([
    Class.Private()
], Main.prototype, "processors", void 0);
__decorate([
    Class.Private()
], Main.prototype, "started", void 0);
__decorate([
    Class.Private()
], Main.prototype, "receiveHandler", void 0);
__decorate([
    Class.Private()
], Main.prototype, "sendHandler", void 0);
__decorate([
    Class.Protected()
], Main.prototype, "filter", null);
__decorate([
    Class.Protected()
], Main.prototype, "process", null);
__decorate([
    Class.Private()
], Main.prototype, "protectRequest", null);
__decorate([
    Class.Private()
], Main.prototype, "getRoute", null);
__decorate([
    Class.Private()
], Main.prototype, "addFilter", null);
__decorate([
    Class.Private()
], Main.prototype, "addProcessor", null);
__decorate([
    Class.Public()
], Main.prototype, "Dependency", null);
__decorate([
    Class.Public()
], Main.prototype, "Inject", null);
__decorate([
    Class.Public()
], Main.prototype, "construct", null);
__decorate([
    Class.Public()
], Main.prototype, "addHandler", null);
__decorate([
    Class.Public()
], Main.prototype, "addService", null);
__decorate([
    Class.Public()
], Main.prototype, "start", null);
__decorate([
    Class.Public()
], Main.prototype, "stop", null);
__decorate([
    Class.Private()
], Main, "routes", void 0);
__decorate([
    Class.Private()
], Main, "addRoute", null);
__decorate([
    Class.Public()
], Main, "Filter", null);
__decorate([
    Class.Public()
], Main, "Processor", null);
Main = Main_1 = __decorate([
    Class.Describe()
], Main);
exports.Main = Main;
}},"@singleware/jsx/helper":{pack:false, invoke:function(exports, require){"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Helper_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Provides methods that helps with DOM.
 */
let Helper = Helper_1 = class Helper {
    /**
     * Creates an element with the specified type.
     * @param type Component type or native element type.
     * @param properties Element properties.
     * @param children Element children.
     */
    static create(type, properties, ...children) {
        if (type instanceof Function) {
            return Helper_1.createFromComponent(type, properties, ...children);
        }
        else if (typeof type === 'string') {
            return Helper_1.createFromElement(type, properties, ...children);
        }
        else {
            throw new TypeError(`Unsupported element or component type "${type}"`);
        }
    }
    /**
     * Appends the specified children into the specified parent element.
     * @param parent Parent element.
     * @param children Children elements.
     * @returns Returns the parent element.
     */
    static append(element, ...children) {
        for (const child of children) {
            if (child instanceof NodeList || child instanceof Array) {
                Helper_1.append(element, ...child);
            }
            else if (child instanceof Node) {
                element.appendChild(child);
            }
            else if (typeof child === 'string' || typeof child === 'number') {
                Helper_1.renderer.innerHTML = child;
                Helper_1.append(element, ...Helper_1.renderer.childNodes);
            }
            else if (child) {
                if (child.element instanceof Node) {
                    element.appendChild(child.element);
                }
                else {
                    throw new TypeError(`Unsupported child type "${child}"`);
                }
            }
        }
        return element;
    }
    /**
     * Clear all children of the specified element.
     * @param element Element instance.
     * @returns Returns the cleared element instance.
     */
    static clear(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        return element;
    }
    /**
     * Creates a new component with the specified type.
     * @param type Component type.
     * @param properties Component properties.
     * @param children Component children.
     * @returns Returns the component instance.
     */
    static createFromComponent(type, properties, ...children) {
        return new type(properties, children).element;
    }
    /**
     * Creates a native element with the specified type.
     * @param type Element type.
     * @param properties Element properties.
     * @param children Element children.
     * @returns Returns the element instance.
     */
    static createFromElement(type, properties, ...children) {
        const element = document.createElement(type);
        if (properties) {
            for (const name in properties) {
                if (properties[name] !== void 0) {
                    if (name in element) {
                        element[name] = properties[name];
                    }
                    else {
                        element.setAttribute(name, properties[name]);
                    }
                }
            }
        }
        return Helper_1.append(element, ...children);
    }
};
/**
 * Renderer for temporary elements.
 */
Helper.renderer = document.createElement('body');
__decorate([
    Class.Private()
], Helper, "renderer", void 0);
__decorate([
    Class.Public()
], Helper, "create", null);
__decorate([
    Class.Public()
], Helper, "append", null);
__decorate([
    Class.Public()
], Helper, "clear", null);
__decorate([
    Class.Private()
], Helper, "createFromComponent", null);
__decorate([
    Class.Private()
], Helper, "createFromElement", null);
Helper = Helper_1 = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
}},"@singleware/jsx/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
// Aliases
exports.create = helper_1.Helper.create;
exports.append = helper_1.Helper.append;
exports.clear = helper_1.Helper.clear;
}},"@singleware/jsx":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/frontend/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var main_1 = require("./main");
exports.Main = main_1.Main;
const Module = require("./services");
exports.Services = Module;
}},"@singleware/frontend":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/frontend/main":{pack:false, invoke:function(exports, require){"use strict";
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
const DOM = require("@singleware/jsx");
/**
 * Front-end main application class.
 */
let Main = class Main extends Application.Main {
    /**
     * Default constructor.
     * @param settings Application settings.
     */
    constructor(settings) {
        super({
            separator: '/',
            variable: /^\{([a-z_0-9]+)\}$/
        });
        this.settings = settings;
    }
    /**
     * Filter event handler.
     * @param match Matched routes.
     * @param callback Handler callback.
     */
    async filter(match, callback) {
        await super.filter(match, callback);
        if (match.length === 0 && match.detail.granted) {
            history.pushState(match.variables.state, match.variables.title, match.detail.path);
        }
    }
    /**
     * Process event handler.
     * @param match Matched routes.
     * @param callback Handler callback.
     */
    async process(match, callback) {
        const output = match.detail.output;
        await super.process(match, callback);
        if (match.length === 0 && match.detail.granted) {
            if (output.title) {
                document.title = output.title;
            }
            if (output.content) {
                DOM.append(this.settings.body || document.body, output.content);
            }
        }
    }
};
__decorate([
    Class.Private()
], Main.prototype, "settings", void 0);
__decorate([
    Class.Protected()
], Main.prototype, "filter", null);
__decorate([
    Class.Protected()
], Main.prototype, "process", null);
Main = __decorate([
    Class.Describe()
], Main);
exports.Main = Main;
}},"@singleware/frontend/services/client":{pack:false, invoke:function(exports, require){"use strict";
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
const Observable = require("@singleware/observable");
/**
 * Front-end browser service class.
 */
let Client = class Client {
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
        this.settings = settings;
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
     * Starts the service.
     */
    start() {
        this.events.receive.notifyAll({
            path: this.settings.path || location.pathname,
            input: {},
            output: {},
            environment: {}
        });
    }
    /**
     * Stops the service.
     */
    stop() { }
};
__decorate([
    Class.Private()
], Client.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Client.prototype, "events", void 0);
__decorate([
    Class.Public()
], Client.prototype, "onReceive", null);
__decorate([
    Class.Public()
], Client.prototype, "onSend", null);
__decorate([
    Class.Public()
], Client.prototype, "start", null);
__decorate([
    Class.Public()
], Client.prototype, "stop", null);
Client = __decorate([
    Class.Describe()
], Client);
exports.Client = Client;
}},"@singleware/frontend/services/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var client_1 = require("./client");
exports.Client = client_1.Client;
}},"@singleware/frontend/services":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"@singleware/frontend/services/server":{pack:false, invoke:function(exports, require){"use strict";
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
const Observable = require("@singleware/observable");
/**
 * Front-end browser service class.
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
        this.settings = settings;
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
     * Starts the service.
     */
    start() {
        this.events.receive.notifyAll({
            path: this.settings.path || location.pathname,
            input: {},
            output: {}
        });
    }
    /**
     * Stops the service.
     */
    stop() { }
};
__decorate([
    Class.Private()
], Server.prototype, "settings", void 0);
__decorate([
    Class.Private()
], Server.prototype, "events", void 0);
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
}},"@singleware/ui-control/component":{pack:false, invoke:function(exports, require){"use strict";
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
}},"@singleware/ui-control/helper":{pack:false, invoke:function(exports, require){"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Helper_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
/**
 * Control helper class.
 */
let Helper = Helper_1 = class Helper {
    /**
     * List all children that contains the expected property in the element slot and executes the given callback for each result.
     * @param slot Element slot.
     * @param property Expected property.
     * @param callback Callback to be executed for each element found.
     * @returns Returns the same value returned by the callback or undefined if the callback returns nothing.
     */
    static listChildByProperty(slot, property, callback) {
        const children = slot.assignedNodes();
        for (const child of children) {
            if (child instanceof HTMLElement && property in child) {
                const result = callback(child);
                if (result !== void 0) {
                    return result;
                }
            }
        }
        return void 0;
    }
    /**
     * Gets the first child that contains the expected property from the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @returns Returns the first child or undefined when there is no child found.
     */
    static getChildByProperty(slot, property) {
        return Helper_1.listChildByProperty(slot, property, (child) => {
            return child;
        });
    }
    /**
     * Gets the property value from the first child that contains the expected property in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @returns Returns the property value or undefined when there is no child found.
     */
    static getChildProperty(slot, property) {
        const child = Helper_1.getChildByProperty(slot, property);
        return child ? child[property] : void 0;
    }
    /**
     * Sets the specified property value to all elements in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @param value New property value.
     */
    static setChildrenProperty(slot, property, value) {
        Helper_1.listChildByProperty(slot, property, (child) => {
            child[property] = value;
        });
    }
    /**
     * Sets the property value into the first child that contains the expected property in the specified element slot.
     * @param slot Element slot.
     * @param property Expected property.
     * @param value New property value.
     * @returns Returns true when the child was found and updated, false otherwise.
     */
    static setChildProperty(slot, property, value) {
        const child = Helper_1.getChildByProperty(slot, property);
        if (!child) {
            return false;
        }
        child[property] = value;
        return true;
    }
    /**
     * Assign all values mapped by the specified keys into the target object.
     * @param target Target object.
     * @param values Values to be assigned.
     * @param keys Keys to be assigned.
     */
    static assignProperties(target, values, keys) {
        for (const key of keys) {
            if (key in values) {
                if (!(key in target)) {
                    throw new Error(`Property '${key}' can't be assigned.`);
                }
                target[key] = values[key];
            }
        }
    }
};
__decorate([
    Class.Public()
], Helper, "listChildByProperty", null);
__decorate([
    Class.Public()
], Helper, "getChildByProperty", null);
__decorate([
    Class.Public()
], Helper, "getChildProperty", null);
__decorate([
    Class.Public()
], Helper, "setChildrenProperty", null);
__decorate([
    Class.Public()
], Helper, "setChildProperty", null);
__decorate([
    Class.Public()
], Helper, "assignProperties", null);
Helper = Helper_1 = __decorate([
    Class.Describe()
], Helper);
exports.Helper = Helper;
}},"@singleware/ui-control/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
var component_1 = require("./component");
exports.Component = component_1.Component;
const helper_1 = require("./helper");
// Aliases
exports.listChildByProperty = helper_1.Helper.listChildByProperty;
exports.getChildByProperty = helper_1.Helper.getChildByProperty;
exports.getChildProperty = helper_1.Helper.getChildProperty;
exports.setChildrenProperty = helper_1.Helper.setChildrenProperty;
exports.setChildProperty = helper_1.Helper.setChildProperty;
exports.assignProperties = helper_1.Helper.assignProperties;
}},"@singleware/ui-control":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"./form/index":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("./view");
exports.View = view_1.View;
}},"./form":{pack:true, invoke:function(exports, require){Object.assign(exports, require('index'));}},"./form/view":{pack:false, invoke:function(exports, require){"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Class = require("@singleware/class");
const DOM = require("@singleware/jsx");
const Control = require("@singleware/ui-control");
let View = class View extends Control.Component {
    constructor() {
        super({});
        this.form = (DOM.create("form", { class: "form", name: "formulario" },
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "First name:"),
                DOM.create("br", null),
                DOM.create("input", { type: "text", placeholder: "First name", name: "firstname", id: "firstname", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Last name:"),
                DOM.create("br", null),
                DOM.create("input", { type: "text", placeholder: "Last name", name: "lastname", id: "lastname", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Username:"),
                DOM.create("br", null),
                DOM.create("input", { type: "text", placeholder: "Username", name: "username", id: "username", pattern: "[a-z-0-9]+", minlength: "6", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Email:"),
                DOM.create("br", null),
                DOM.create("input", { type: "email", placeholder: "Email @juridoc.com.br", name: "email", id: "email", pattern: "[a-z0-9._%+-]+@juridoc.com.br$" })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Phone:"),
                DOM.create("br", null),
                DOM.create("input", { type: "tel", placeholder: "Phone xx xxxx-xxxx", name: "fone", id: "fone", pattern: "[0-9]{2}[\\s][0-9]{4}-[0-9]{4}" })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Password:"),
                DOM.create("br", null),
                DOM.create("input", { type: "password", placeholder: "Password", minlength: "6", name: "password", id: "password", required: true })),
            DOM.create("div", { class: "field" },
                DOM.create("label", null, "Confirm Password:"),
                DOM.create("br", null),
                DOM.create("input", { type: "password", required: true, placeholder: "Confirm Password", minlength: "6", id: "confirm_password" })),
            DOM.create("button", { type: "submit" }, "Submit form")));
        this.skeleton = (DOM.create("div", { class: "panel" },
            DOM.create("img", { src: "/images/logo-colorful.png", width: "200", height: "80" }),
            this.form));
        this.form.addEventListener('submit', Class.bindCallback(this.submitHandler));
    }
    submitHandler(event) {
        var firstname = document.getElementById('firstname');
        var lastname = document.getElementById('lastname');
        var username = document.getElementById('username');
        var email = document.getElementById('email');
        var fone = document.getElementById('fone');
        var password = document.getElementById('password');
        var confirm_password = document.getElementById('confirm_password');
        if (password.value != confirm_password.value) {
            event.preventDefault();
            alert('Senhas diferentes!');
        }
        else {
            var htmlvalues = {
                "firstName": firstname.value,
                "lastName": lastname.value,
                "phone": fone.value,
                "email": email.value,
                "username": username.value,
                "password": password.value
            };
            var json = JSON.stringify(htmlvalues);
            console.log(json);
            fetch('https://test.juridoc.com.br/register/', {
                method: 'POST',
                body: json
            }).then(function (data) {
                console.log('Request success: ', data);
            }).catch(function (error) {
                console.log('Request failure: ', error);
            });
            event.preventDefault();
        }
    }
    get element() {
        return this.skeleton;
    }
};
__decorate([
    Class.Private()
], View.prototype, "submitHandler", null);
__decorate([
    Class.Private()
], View.prototype, "form", void 0);
__decorate([
    Class.Private()
], View.prototype, "skeleton", void 0);
__decorate([
    Class.Public()
], View.prototype, "element", null);
View = __decorate([
    Class.Describe()
], View);
exports.View = View;
}},"./main":{pack:false, invoke:function(exports, require){"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Frontend = require("@singleware/frontend");
const Default = require("./handler");
exports.application = new Frontend.Main({});
exports.application.addService(Frontend.Services.Client, {});
exports.application.addHandler(Default.Handler);
exports.application.start();
}},"./handler":{pack:false, invoke:function(exports, require){"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Class = require("@singleware/class");
const Frontend = require("@singleware/frontend");
const Form = require("./form");
let Handler = class Handler {
    async defaultAction(match) {
        match.detail.output.content = new Form.View();
    }
};
__decorate([
    Class.Public(),
    Frontend.Main.Processor({ path: '/' })
], Handler.prototype, "defaultAction", null);
Handler = __decorate([
    Class.Describe()
], Handler);
exports.Handler = Handler;
}}};

  /**
   * All initialized modules.
   */
  const cache = {};

  /**
   * Determines whether the specified path is relative or not.
   * @param path Path.
   * @returns Returns the base path.
   */
  function relative(path) {
    const char = path.substr(0, 1);
    return char !== '/' && char !== '@';
  }

  /**
   * Gets the base path of the specified path.
   * @param path Path.
   * @returns Returns the base path.
   */
  function dirname(path) {
    const output = normalize(path).split('/');
    return output.splice(0, output.length - 1).join('/');
  }

  /**
   * Gets the normalized from the specified path.
   * @param path Path.
   * @return Returns the normalized path.
   */
  function normalize(path) {
    const input = path.split('/');
    const output = [];
    for (let i = 0; i < input.length; ++i) {
      const directory = input[i];
      if (i === 0 || (directory.length && directory !== '.')) {
        if (directory === '..') {
          output.pop();
        } else {
          output.push(directory);
        }
      }
    }
    return output.join('/');
  }

  /**
   * Loads the module that corresponds to the specified path.
   * @param path Module path.
   * @returns Returns all exported members.
   */
  function loadModule(path) {
    const module = modules[path];
    if (!module) {
      throw new Error(`Module "${path}" does not found.`);
    }
    const exports = {};
    const current = Loader.baseDirectory;
    try {
      Loader.baseDirectory = module.pack ? path : dirname(path);
      module.invoke(exports, Loader.require);
    } catch (exception) {
      throw exception;
    } finally {
      Loader.baseDirectory = current;
      return exports;
    }
  }

  /**
   * Global base directory.
   */
  Loader.baseDirectory = '.';

  /**
   * Requires the module that corresponds to the specified path.
   * @param path Module path.
   * @returns Returns all exported members.
   */
  Loader.require = path => {
    const module = normalize(relative(path) ? `${Loader.baseDirectory}/${path}` : path);
    if (!cache[module]) {
      cache[module] = loadModule(module);
    }
    return cache[module];
  };

  // Setups the require method.
  if (!window.require) {
    window.require = Loader.require;
  }
})(Loader || (Loader = {}));
