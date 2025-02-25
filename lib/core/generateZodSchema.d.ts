import ts from "typescript";
import { CustomJSDocFormatTypes } from "../config";
export interface GenerateZodSchemaProps {
    /**
     * Name of the exported variable
     */
    varName: string;
    /**
     * Interface or type node
     */
    node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration;
    /**
     * Zod import value.
     *
     * @default "z"
     */
    zodImportValue?: string;
    /**
     * Source file
     */
    sourceFile: ts.SourceFile;
    /**
     * Getter for schema dependencies (Type reference inside type)
     *
     * @default (identifierName) => camel(`${identifierName}Schema`)
     */
    getDependencyName?: (identifierName: string) => string;
    /**
     * Skip the creation of zod validators from JSDoc annotations
     *
     * @default false
     */
    skipParseJSDoc?: boolean;
    /**
     * Custom JSDoc format types.
     */
    customJSDocFormatTypes: CustomJSDocFormatTypes;
}
/**
 * Generate zod schema declaration
 *
 * ```ts
 * export const ${varName} = ${zodImportValue}.object(…)
 * ```
 */
export declare function generateZodSchemaVariableStatement({ node, sourceFile, varName, zodImportValue, getDependencyName, skipParseJSDoc, customJSDocFormatTypes, }: GenerateZodSchemaProps): {
    dependencies: string[];
    statement: ts.VariableStatement;
    requiresImport: boolean;
};
