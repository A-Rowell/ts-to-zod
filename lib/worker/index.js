"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGeneratedTypesInWorker = void 0;
const threads_1 = require("threads");
/**
 * Validate generated types in a worker.
 *
 * @param props
 * @returns List of errors
 */
async function validateGeneratedTypesInWorker(props) {
    const validatorWorker = await (0, threads_1.spawn)(new threads_1.Worker("./validator.worker"));
    const errors = await validatorWorker(props);
    threads_1.Thread.terminate(validatorWorker);
    return errors;
}
exports.validateGeneratedTypesInWorker = validateGeneratedTypesInWorker;
//# sourceMappingURL=index.js.map