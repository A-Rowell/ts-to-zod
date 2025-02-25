import { ValidateGeneratedTypesProps } from "../core/validateGeneratedTypes";
/**
 * Validate generated types in a worker.
 *
 * @param props
 * @returns List of errors
 */
export declare function validateGeneratedTypesInWorker(props: ValidateGeneratedTypesProps): Promise<string[]>;
