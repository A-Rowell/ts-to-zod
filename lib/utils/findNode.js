"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNode = void 0;
const tslib_1 = require("tslib");
const ts = tslib_1.__importStar(require("typescript"));
/**
 * Find and return a typescript node in a sourcefile.
 */
function findNode(sourceFile, predicate) {
    let declarationNode;
    const visitor = (node) => {
        if (!declarationNode && predicate(node)) {
            declarationNode = node;
        }
    };
    ts.forEachChild(sourceFile, visitor);
    return declarationNode;
}
exports.findNode = findNode;
//# sourceMappingURL=findNode.js.map