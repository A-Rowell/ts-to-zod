"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixOptionalAny = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
/**
 * Add optional property to `any` to workaround comparison issue.
 *
 * ref: https://github.com/fabien0102/ts-to-zod/issues/140
 */
function fixOptionalAny(sourceText) {
    const sourceFile = typescript_1.default.createSourceFile("index.ts", sourceText, typescript_1.default.ScriptTarget.Latest);
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    const markAnyAsOptional = (context) => {
        const visit = (node) => {
            var _a;
            node = typescript_1.default.visitEachChild(node, visit, context);
            if (typescript_1.default.isPropertySignature(node) &&
                ((_a = node.type) === null || _a === void 0 ? void 0 : _a.kind) === typescript_1.default.SyntaxKind.AnyKeyword) {
                return typescript_1.default.factory.createPropertySignature(node.modifiers, node.name, typescript_1.factory.createToken(typescript_1.default.SyntaxKind.QuestionToken), // Add `questionToken`
                node.type);
            }
            return node;
        };
        return (sourceFile) => typescript_1.default.visitNode(sourceFile, visit);
    };
    const outputFile = typescript_1.default.transform(sourceFile, [markAnyAsOptional]);
    return printer.printFile(outputFile.transformed[0]);
}
exports.fixOptionalAny = fixOptionalAny;
//# sourceMappingURL=fixOptionalAny.js.map