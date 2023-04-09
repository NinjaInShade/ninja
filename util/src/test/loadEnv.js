"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_test_1 = require("node:test");
var node_assert_1 = require("node:assert");
var node_path_1 = require("node:path");
var promises_1 = require("node:fs/promises");
var index_1 = require("~/index");
var createEnv = function (_path, contents) { return __awaiter(void 0, void 0, void 0, function () {
    var variables;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                variables = contents !== null && contents !== void 0 ? contents : "FOO=var1\nBAR=var2";
                return [4 /*yield*/, promises_1.default.writeFile(_path, variables)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var deleteEnv = function (_path) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, promises_1.default.unlink(_path)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var _path = node_path_1.default.join(node_path_1.default.resolve(), '.env');
var cleanupHook = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                process.env = {};
                return [4 /*yield*/, deleteEnv(_path)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
(0, node_test_1.describe)('[loadEnv] file reading', function () {
    (0, node_test_1.beforeEach)(cleanupHook);
    (0, node_test_1.after)(cleanupHook);
    (0, node_test_1.it)('should throw if no .env file exists', function () { return __awaiter(void 0, void 0, void 0, function () {
        var cwdPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cwdPath = node_path_1.default.join(process.cwd(), '.env');
                    return [4 /*yield*/, node_assert_1.default.rejects(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, index_1.default.loadEnv()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }, { message: "Error reading .env file, make sure it exists at: '".concat(cwdPath, "'") })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should throw if no .env file exists with custom path', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_assert_1.default.rejects(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, index_1.default.loadEnv(_path)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }, { message: "Error reading .env file, make sure it exists at: '".concat(_path, "'") })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, node_test_1.describe)('[loadEnv] variable parsing', function () {
    (0, node_test_1.beforeEach)(cleanupHook);
    (0, node_test_1.after)(cleanupHook);
    (0, node_test_1.it)('should parse every variable', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createEnv(_path)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, index_1.default.loadEnv(_path)];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.FOO, 'var1');
                    node_assert_1.default.equal(process.env.BAR, 'var2');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should overwrite env var if force param is true', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.FOO = 'existing';
                    node_assert_1.default.equal(process.env.FOO, 'existing');
                    return [4 /*yield*/, createEnv(_path)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, index_1.default.loadEnv(_path, true)];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.FOO, 'var1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should throw if trying to forcefully overwrite existing env var', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    process.env.FOO = 'existing';
                    node_assert_1.default.equal(process.env.FOO, 'existing');
                    return [4 /*yield*/, createEnv(_path)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, node_assert_1.default.rejects(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, index_1.default.loadEnv(_path)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }, { message: "Env variable 'FOO' already exists. Call with 'force' parameter true if you want to forcefully overwrite it" })];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.FOO, 'existing');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should strip leading and trailing whitespace', function () { return __awaiter(void 0, void 0, void 0, function () {
        var variables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    variables = "     FOO=var1\nBAR=var2             ";
                    return [4 /*yield*/, createEnv(_path, variables)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, index_1.default.loadEnv(_path, true)];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.FOO, 'var1');
                    node_assert_1.default.equal(process.env.BAR, 'var2');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should strip leading and trailing quotes off values', function () { return __awaiter(void 0, void 0, void 0, function () {
        var variables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    variables = "SINGLE_QUOTE='test'\nDOUBLE_QUOTE=\"test\"\nSINGLE_QUOTE_INBETWEEN='te'st'\nDOUBLE_QUOTE_INBETWEEN=\"te'st\"";
                    return [4 /*yield*/, createEnv(_path, variables)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, index_1.default.loadEnv(_path)];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.SINGLE_QUOTE, 'test');
                    node_assert_1.default.equal(process.env.DOUBLE_QUOTE, 'test');
                    node_assert_1.default.equal(process.env.SINGLE_QUOTE_INBETWEEN, "te'st");
                    node_assert_1.default.equal(process.env.DOUBLE_QUOTE_INBETWEEN, "te'st");
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should throw if value is using single quotes but leading quote missing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var variables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    variables = "MISSING_LEADING=test'";
                    return [4 /*yield*/, createEnv(_path, variables)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, node_assert_1.default.rejects(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, index_1.default.loadEnv(_path)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }, { message: "String is not fully enclosed in single quotes" })];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.MISSING_LEADING, undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should throw if value is using single quotes but trailing quote missing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var variables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    variables = "MISSING_LEADING='test";
                    return [4 /*yield*/, createEnv(_path, variables)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, node_assert_1.default.rejects(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, index_1.default.loadEnv(_path)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }, { message: "String is not fully enclosed in single quotes" })];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.MISSING_LEADING, undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should throw if value is using double quotes but leading quote missing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var variables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    variables = "MISSING_LEADING=test\"";
                    return [4 /*yield*/, createEnv(_path, variables)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, node_assert_1.default.rejects(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, index_1.default.loadEnv(_path)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }, { message: "String is not fully enclosed in double quotes" })];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.MISSING_LEADING, undefined);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, node_test_1.it)('should throw if value is using double quotes but trailing quote missing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var variables;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    variables = "MISSING_LEADING=\"test";
                    return [4 /*yield*/, createEnv(_path, variables)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, node_assert_1.default.rejects(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, index_1.default.loadEnv(_path)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }, { message: "String is not fully enclosed in double quotes" })];
                case 2:
                    _a.sent();
                    node_assert_1.default.equal(process.env.MISSING_LEADING, undefined);
                    return [2 /*return*/];
            }
        });
    }); });
});
