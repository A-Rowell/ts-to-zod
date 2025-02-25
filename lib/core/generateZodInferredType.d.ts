import ts from "typescript";
export interface GenerateZodInferredTypeProps {
    aliasName: string;
    zodImportValue: string;
    zodConstName: string;
}
/**
 * Generate zod inferred type.
 *
 * ```ts
 *  export type ${aliasName} = ${zodImportValue}.infer<typeof ${zodConstName}>
 * ```
 */
export declare function generateZodInferredType({ aliasName, zodImportValue, zodConstName, }: GenerateZodInferredTypeProps): ts.TypeAliasDeclaration;
