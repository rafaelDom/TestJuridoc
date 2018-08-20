"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Frontend = require("@singleware/frontend");
const Default = require("./handler");
exports.application = new Frontend.Main({});
exports.application.addService(Frontend.Services.Client, {});
exports.application.addHandler(Default.Handler);
exports.application.start();
