"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtractedTypeNames = exports.isTypeNode = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importDefault(require("typescript"));
const typeScriptHelper = [
    "Array",
    "Promise",
    "Omit",
    "Pick",
    "Record",
    "Partial",
    "Required",
];
function isTypeNode(node) {
    return (typescript_1.default.isInterfaceDeclaration(node) ||
        typescript_1.default.isTypeAliasDeclaration(node) ||
        typescript_1.default.isEnumDeclaration(node));
}
exports.isTypeNode = isTypeNode;
function getExtractedTypeNames(node, sourceFile) {
    const referenceTypeNames = new Set();
    // Adding the node name
    referenceTypeNames.add(node.name.text);
    const visitorExtract = (child) => {
        if (!typescript_1.default.isPropertySignature(child)) {
            return;
        }
        const childNode = child;
        if (childNode.type) {
            handleTypeNode(childNode.type);
        }
    };
    const handleTypeNode = (typeNode) => {
        if (typescript_1.default.isParenthesizedTypeNode(typeNode)) {
            typeNode = typeNode.type;
        }
        if (typescript_1.default.isTypeReferenceNode(typeNode)) {
            handleTypeReferenceNode(typeNode);
        }
        else if (typescript_1.default.isArrayTypeNode(typeNode)) {
            handleTypeNode(typeNode.elementType);
        }
        else if (typescript_1.default.isTypeLiteralNode(typeNode)) {
            typeNode.forEachChild(visitorExtract);
        }
        else if (typescript_1.default.isIntersectionTypeNode(typeNode) ||
            typescript_1.default.isUnionTypeNode(typeNode)) {
            typeNode.types.forEach((childNode) => {
                if (typescript_1.default.isTypeReferenceNode(childNode)) {
                    handleTypeReferenceNode(childNode);
                }
                else
                    childNode.forEachChild(visitorExtract);
            });
        }
    };
    const handleTypeReferenceNode = (typeRefNode) => {
        const typeName = typeRefNode.typeName.getText(sourceFile);
        if (typeScriptHelper.indexOf(typeName) > -1 && typeRefNode.typeArguments) {
            typeRefNode.typeArguments.forEach((t) => handleTypeNode(t));
        }
        else {
            referenceTypeNames.add(typeName);
        }
    };
    if (typescript_1.default.isInterfaceDeclaration(node)) {
        const heritageClauses = node.heritageClauses;
        if (heritageClauses) {
            heritageClauses.forEach((clause) => {
                const extensionTypes = clause.types;
                extensionTypes.forEach((extensionTypeNode) => {
                    const typeName = extensionTypeNode.expression.getText(sourceFile);
                    referenceTypeNames.add(typeName);
                });
            });
        }
        node.forEachChild(visitorExtract);
    }
    else if (typescript_1.default.isTypeAliasDeclaration(node)) {
        handleTypeNode(node.type);
    }
    return Array.from(referenceTypeNames);
}
exports.getExtractedTypeNames = getExtractedTypeNames;
//# sourceMappingURL=traverseTypes.js.map