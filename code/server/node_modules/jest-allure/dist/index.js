"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
class JestAllureReporter {
    constructor(globalConfig, options = {}) {
        this.reporterOptions = { resultsDir: path_1.default.resolve(".", options.resultsDir || "allure-results") };
    }
    onTestStart(test) {
        const setupPath = require.resolve('./setup');
        const setupTestFrameworkScriptFile = test.context.config.setupTestFrameworkScriptFile;
        if (!setupTestFrameworkScriptFile) {
            test.context.config = Object.assign({}, test.context.config, { setupTestFrameworkScriptFile: setupPath });
        }
    }
}
module.exports = JestAllureReporter;
