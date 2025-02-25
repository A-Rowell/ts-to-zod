"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportPath = void 0;
const tslib_1 = require("tslib");
const slash_1 = tslib_1.__importDefault(require("slash"));
const path_1 = require("path");
/**
 * Resolve the path of an import.
 *
 * @param from path of the current file
 * @param to path of the import file
 * @returns relative path without extension
 */
function getImportPath(from, to) {
    const relativePath = (0, slash_1.default)((0, path_1.relative)(from, to).slice(1));
    const { dir, name } = (0, path_1.parse)(relativePath);
    return `${dir}/${name}`;
}
exports.getImportPath = getImportPath;
//# sourceMappingURL=getImportPath.js.map