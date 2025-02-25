import ts from "typescript";
/**
 * Type hint zod to deal with recursive types.
 *
 * https://github.com/colinhacks/zod/tree/v3#recursive-types
 */
export declare function transformRecursiveSchema(zodImportValue: string, zodStatement: ts.VariableStatement, typeName: string): ts.VariableStatement;
