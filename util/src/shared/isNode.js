"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNode = void 0;
var isNode = function () {
    return typeof process === 'object';
};
exports.isNode = isNode;
