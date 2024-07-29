"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Status;
(function (Status) {
    Status["Passed"] = "passed";
    Status["Pending"] = "pending";
    Status["Skipped"] = "skipped";
    Status["Failed"] = "failed";
    Status["Broken"] = "broken";
})(Status = exports.Status || (exports.Status = {}));
var Severity;
(function (Severity) {
    Severity["Blocker"] = "blocker";
    Severity["Critical"] = "critical";
    Severity["Normal"] = "normal";
    Severity["Minor"] = "minor";
    Severity["Trivial"] = "trivial";
})(Severity = exports.Severity || (exports.Severity = {}));
class Reporter {
    constructor(allure) {
        this.allure = allure;
    }
    description(description) {
        this.allure.setDescription(description);
        return this;
    }
    severity(severity) {
        this.addLabel('severity', severity);
        return this;
    }
    epic(epic) {
        this.addLabel('epic', epic);
        return this;
    }
    feature(feature) {
        this.addLabel('feature', feature);
        return this;
    }
    story(story) {
        this.addLabel('story', story);
        return this;
    }
    testId(testId) {
        this.addLabel('testId', testId);
        return this;
    }
    startStep(name) {
        this.allure.startStep(name);
        return this;
    }
    endStep(status = Status.Passed) {
        this.allure.endStep(status);
        return this;
    }
    addArgument(name) {
        this.allure.startStep(name);
        return this;
    }
    addEnvironment(name, value) {
        this.allure.getCurrentTest().addParameter('environment-variable', name, value);
        return this;
    }
    addAttachment(name, buffer, type) {
        this.allure.addAttachment(name, buffer, type);
        return this;
    }
    addLabel(name, value) {
        this.allure.getCurrentTest().addLabel(name, value);
        return this;
    }
    ;
    addParameter(paramName, name, value) {
        this.allure.getCurrentTest().addParameter(paramName, name, value);
        return this;
    }
    ;
}
exports.Reporter = Reporter;
