/// <reference types="jest" />
declare namespace JestAllureReporter {
    type ReporterConfig = {
        resultsDir: string;
    };
}
declare class JestAllureReporter implements jest.Reporter {
    private reporterOptions;
    constructor(globalConfig: jest.GlobalConfig, options?: Partial<JestAllureReporter.ReporterConfig>);
    onTestStart(test: jest.Test): void;
}
export = JestAllureReporter;
