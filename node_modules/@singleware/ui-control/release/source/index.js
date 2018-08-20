"use strict";
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
