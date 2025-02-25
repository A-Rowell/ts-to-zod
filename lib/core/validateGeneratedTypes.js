"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGeneratedTypes = void 0;
const tslib_1 = require("tslib");
const vfs_1 = require("@typescript/vfs");
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const path_1 = require("path");
const resolveDefaultProperties_1 = require("../utils/resolveDefaultProperties");
const fixOptionalAny_1 = require("../utils/fixOptionalAny");
/**
 * Use typescript compiler to validate the generated zod schemas.
 */
function validateGeneratedTypes({ sourceTypes, zodSchemas, integrationTests, skipParseJSDoc, }) {
    // Shared configuration
    const compilerOptions = {
        target: typescript_1.default.ScriptTarget.ES2016,
        esModuleInterop: true,
    };
    // Create virtual files system with our 3 files
    const fsMap = (0, vfs_1.createDefaultMapFromNodeModules)({
        target: compilerOptions.target,
    });
    const projectRoot = process.cwd();
    const src = (0, fixOptionalAny_1.fixOptionalAny)(skipParseJSDoc
        ? sourceTypes.sourceText
        : (0, resolveDefaultProperties_1.resolveDefaultProperties)(sourceTypes.sourceText));
    fsMap.set(getPath(sourceTypes), src);
    fsMap.set(getPath(zodSchemas), zodSchemas.sourceText);
    fsMap.set(getPath(integrationTests), integrationTests.sourceText);
    // Create a virtual typescript environment
    const system = (0, vfs_1.createFSBackedSystem)(fsMap, projectRoot, typescript_1.default);
    const env = (0, vfs_1.createVirtualTypeScriptEnvironment)(system, [sourceTypes, zodSchemas, integrationTests].map(getPath), typescript_1.default, compilerOptions);
    // Get the diagnostic
    const errors = [];
    errors.push(...env.languageService.getSemanticDiagnostics(getPath(integrationTests)));
    errors.push(...env.languageService.getSyntacticDiagnostics(getPath(integrationTests)));
    return errors.map((diagnostic) => {
        const message = typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
        if (diagnostic.file && diagnostic.start) {
            const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            const details = getDetails(diagnostic.file, position.line);
            if (details.zodType && details.specType && details.from) {
                return details.from === "spec"
                    ? `'${details.specType}' is not compatible with '${details.zodType}':\n${message}`
                    : `'${details.zodType}' is not compatible with '${details.specType}':\n${message}`;
            }
        }
        return message;
    });
}
exports.validateGeneratedTypes = validateGeneratedTypes;
function getDetails(file, line) {
    const source = file.getFullText().split("\n")[line];
    const pattern = /expectType<(\w.+)>\({} as (\w.+)\)/;
    const expression = {
        source,
    };
    Array.from(pattern.exec(source) || []).map((chunk, i) => {
        if (chunk.startsWith("spec.")) {
            expression.specType = chunk.slice("spec.".length);
            if (i === 1) {
                expression.from = "type";
            }
        }
        if (chunk.endsWith("InferredType")) {
            expression.zodType = chunk.slice(0, -"InferredType".length);
            if (i === 1) {
                expression.from = "spec";
            }
        }
    });
    return expression;
}
function getPath(file) {
    return (0, path_1.join)(process.cwd(), file.relativePath);
}
//# sourceMappingURL=validateGeneratedTypes.js.map