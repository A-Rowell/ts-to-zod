import ts from "typescript";
import { CustomJSDocFormatType, CustomJSDocFormatTypes } from "../config";
/**
 * List of formats that can be translated in zod functions.
 */
declare const builtInJSDocFormatsTypes: readonly ["date-time", "email", "ip", "ipv4", "ipv6", "url", "uuid", "uri"];
type BuiltInJSDocFormatsType = (typeof builtInJSDocFormatsTypes)[number];
type TagWithError<T> = {
    value: T;
    errorMessage?: string;
};
/**
 * JSDoc special tags that can be converted in zod flags.
 */
export interface JSDocTags {
    minimum?: TagWithError<number>;
    maximum?: TagWithError<number>;
    default?: number | string | boolean;
    minLength?: TagWithError<number>;
    maxLength?: TagWithError<number>;
    format?: TagWithError<BuiltInJSDocFormatsType | CustomJSDocFormatType>;
    /**
     * Due to parsing ambiguities, `@pattern`
     * does not support custom error messages.
     */
    pattern?: string;
    strict?: boolean;
}
/**
 * Return parsed JSTags.
 *
 * This function depends on `customJSDocFormatTypeContext`. Before
 * calling it, make sure the context has been supplied the expected value.
 *
 * @param nodeType
 * @param sourceFile
 * @returns Tags list
 */
export declare function getJSDocTags(nodeType: ts.Node, sourceFile: ts.SourceFile): JSDocTags;
export type ZodProperty = {
    identifier: string;
    expressions?: ts.Expression[];
};
/**
 * Convert a set of JSDoc tags to zod properties.
 *
 * @param jsDocTags
 * @param customJSDocFormats
 * @param isOptional
 * @param isPartial
 * @param isRequired
 * @param isNullable
 */
export declare function jsDocTagToZodProperties(jsDocTags: JSDocTags, customJSDocFormats: CustomJSDocFormatTypes, isOptional: boolean, isPartial: boolean, isRequired: boolean, isNullable: boolean): ZodProperty[];
export {};
