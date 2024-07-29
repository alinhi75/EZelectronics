"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const allure_js_commons_1 = __importDefault(require("allure-js-commons"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const Reporter_1 = require("./Reporter");
const path_1 = require("path");
class JasmineAllureReporter {
    constructor(allure) {
        this.allure = allure;
    }
    suiteStarted(suite) {
        if (suite) {
            this.allure.startSuite(suite.fullName);
        }
        else {
            // case for tests without suite
            this.allure.startSuite(path_1.relative(process.cwd(), expect.getState().testPath));
        }
    }
    jasmineDone() {
        if (this.allure.getCurrentSuite()) {
            this.allure.endSuite();
        }
    }
    ;
    suiteDone() {
        this.allure.endSuite();
    }
    ;
    specStarted(spec) {
        if (!this.allure.getCurrentSuite()) {
            this.suiteStarted();
        }
        this.allure.startCase(spec.description);
    }
    ;
    specDone(spec) {
        let error;
        if (spec.status === "pending") {
            error = { message: spec.pendingReason };
        }
        if (spec.status === "disabled") {
            error = { message: "This test was disabled" };
        }
        const failure = spec.failedExpectations && spec.failedExpectations.length ? spec.failedExpectations[0] : undefined;
        if (failure) {
            error = {
                message: strip_ansi_1.default(failure.message),
                stack: strip_ansi_1.default(failure.stack)
            };
        }
        this.allure.endCase(spec.status, error);
    }
    ;
}
function registerAllureReporter() {
    const allure = new allure_js_commons_1.default();
    const reporter = global.reporter = new Reporter_1.Reporter(allure);
    jasmine.getEnv().addReporter(new JasmineAllureReporter(allure));
}
exports.registerAllureReporter = registerAllureReporter;
registerAllureReporter();
