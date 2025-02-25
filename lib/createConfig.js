"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = void 0;
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const prettier_1 = tslib_1.__importDefault(require("prettier"));
/**
 * Create `ts-to-zod.config.js` file.
 *
 * @param path
 * @returns `true` if the file was created
 */
async function createConfig(configPath, tsToZodConfigFileName) {
    if ((0, fs_extra_1.existsSync)(configPath)) {
        const { answer } = await inquirer_1.default.prompt({
            type: "confirm",
            name: "answer",
            message: `${tsToZodConfigFileName} already exists, do you want to override it?`,
        });
        if (!answer) {
            return false;
        }
    }
    const project = (0, path_1.join)(__dirname, "../tsconfig.json");
    const dev = (0, fs_extra_1.existsSync)(project);
    let answers;
    let prefix;
    const getOutputDefault = () => {
        if ((answers === null || answers === void 0 ? void 0 : answers.mode) === "single") {
            return answers.config.input.replace(/\.ts(x)?$/, ".zod.ts$1");
        }
        else if ((answers === null || answers === void 0 ? void 0 : answers.mode) === "multi") {
            return answers.config[answers.config.length - 1].input.replace(/\.ts(x)?$/, ".zod.ts$1");
        }
    };
    const prompts = new rxjs_1.Subject();
    let i = 0; // Trick to ask the same question (`askAnswered` is not in the types…)
    const askForInput = () => {
        prompts.next({
            type: "input",
            name: `input-${i}`,
            message: "Where is your file with types?",
            default: prefix ? `${prefix}.ts` : undefined,
            prefix: prefix ? `[${prefix}]` : undefined,
        });
    };
    const askForOutput = (prefix) => {
        prompts.next({
            type: "input",
            name: `output-${i}`,
            message: "Where do you want to save the generated zod schemas?",
            default: getOutputDefault(),
            prefix: prefix ? `[${prefix}]` : undefined,
        });
    };
    const askForConfigName = () => {
        prompts.next({
            type: "input",
            name: `configName-${i}`,
            message: "How should we call your configuration?",
        });
    };
    const askForOneMore = () => {
        prompts.next({
            type: "confirm",
            name: `oneMore-${i++}`,
            message: "Do you want to add another config?",
        });
    };
    inquirer_1.default.prompt(prompts).ui.process.subscribe((q) => {
        // inquirer type are a bit broken…
        const question = q;
        if (question.name === "mode") {
            if (question.answer.toLowerCase().includes("single")) {
                answers = { mode: "single", config: { input: "", output: "" } };
                askForInput();
            }
            else {
                answers = { mode: "multi", config: [] };
                askForConfigName();
            }
        }
        if (question.name.startsWith("input")) {
            if ((answers === null || answers === void 0 ? void 0 : answers.mode) === "single") {
                answers.config.input = question.answer;
            }
            else if ((answers === null || answers === void 0 ? void 0 : answers.mode) === "multi") {
                answers.config[answers.config.length - 1].input = question.answer;
            }
            askForOutput();
        }
        if (question.name.startsWith("output")) {
            if ((answers === null || answers === void 0 ? void 0 : answers.mode) === "single") {
                answers.config.output = question.answer;
                prompts.complete();
            }
            else if ((answers === null || answers === void 0 ? void 0 : answers.mode) === "multi") {
                answers.config[answers.config.length - 1].output = question.answer;
                askForOneMore();
            }
        }
        if (question.name.startsWith("configName")) {
            if ((answers === null || answers === void 0 ? void 0 : answers.mode) === "multi") {
                answers.config.push({
                    name: question.answer,
                    input: "",
                    output: "",
                });
            }
            prefix = question.answer;
            askForInput();
        }
        if (question.name.startsWith("oneMore")) {
            if (question.answer) {
                askForConfigName();
            }
            else {
                prompts.complete();
            }
        }
    }, (err) => console.error(err));
    // First question to start the flow
    prompts.next({
        type: "list",
        name: "mode",
        message: "What kind of configuration do you need?",
        choices: [
            { value: "single", name: "Single configuration" },
            { value: "multi", name: "Multiple configurations" },
        ],
    });
    await prompts.toPromise();
    const header = `/**
 * ts-to-zod configuration.
 *
 * @type {${dev ? 'import("./src/config")' : 'import("ts-to-zod")'}.TsToZodConfig}
 */
module.exports = `;
    if (answers) {
        const prettierConfig = await prettier_1.default.resolveConfig(process.cwd());
        await (0, fs_extra_1.outputFile)(configPath, await prettier_1.default.format(header + JSON.stringify(answers.config), Object.assign({ parser: "babel" }, prettierConfig)), "utf-8");
        return true;
    }
    return false;
}
exports.createConfig = createConfig;
//# sourceMappingURL=createConfig.js.map