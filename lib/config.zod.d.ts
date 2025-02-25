import { z } from "zod";
export declare const simplifiedJSDocTagSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value?: string | undefined;
}, {
    name: string;
    value?: string | undefined;
}>;
export declare const getSchemaNameSchema: z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodString>;
export declare const nameFilterSchema: z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodBoolean>;
export declare const jSDocTagFilterSchema: z.ZodFunction<z.ZodTuple<[z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value?: string | undefined;
}, {
    name: string;
    value?: string | undefined;
}>, "many">], z.ZodUnknown>, z.ZodBoolean>;
export declare const customJSDocFormatTypeAttributesSchema: z.ZodObject<{
    regex: z.ZodString;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    regex: string;
    errorMessage?: string | undefined;
}, {
    regex: string;
    errorMessage?: string | undefined;
}>;
export declare const customJSDocFormatTypeSchema: z.ZodString;
export declare const customJSDocFormatTypesSchema: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
    regex: z.ZodString;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    regex: string;
    errorMessage?: string | undefined;
}, {
    regex: string;
    errorMessage?: string | undefined;
}>]>>;
export declare const configSchema: z.ZodObject<{
    input: z.ZodString;
    output: z.ZodString;
    skipValidation: z.ZodOptional<z.ZodBoolean>;
    nameFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodBoolean>>;
    jsDocTagFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value?: string | undefined;
    }, {
        name: string;
        value?: string | undefined;
    }>, "many">], z.ZodUnknown>, z.ZodBoolean>>;
    getSchemaName: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodString>>;
    keepComments: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    skipParseJSDoc: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    inferredTypes: z.ZodOptional<z.ZodString>;
    customJSDocFormatTypes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
        regex: z.ZodString;
        errorMessage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        regex: string;
        errorMessage?: string | undefined;
    }, {
        regex: string;
        errorMessage?: string | undefined;
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    input: string;
    output: string;
    keepComments: boolean;
    skipParseJSDoc: boolean;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}, {
    input: string;
    output: string;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    keepComments?: boolean | undefined;
    skipParseJSDoc?: boolean | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}>;
export declare const configsSchema: z.ZodArray<z.ZodIntersection<z.ZodObject<{
    input: z.ZodString;
    output: z.ZodString;
    skipValidation: z.ZodOptional<z.ZodBoolean>;
    nameFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodBoolean>>;
    jsDocTagFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value?: string | undefined;
    }, {
        name: string;
        value?: string | undefined;
    }>, "many">], z.ZodUnknown>, z.ZodBoolean>>;
    getSchemaName: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodString>>;
    keepComments: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    skipParseJSDoc: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    inferredTypes: z.ZodOptional<z.ZodString>;
    customJSDocFormatTypes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
        regex: z.ZodString;
        errorMessage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        regex: string;
        errorMessage?: string | undefined;
    }, {
        regex: string;
        errorMessage?: string | undefined;
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    input: string;
    output: string;
    keepComments: boolean;
    skipParseJSDoc: boolean;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}, {
    input: string;
    output: string;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    keepComments?: boolean | undefined;
    skipParseJSDoc?: boolean | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>>, "many">;
export declare const tsToZodConfigSchema: z.ZodUnion<[z.ZodObject<{
    input: z.ZodString;
    output: z.ZodString;
    skipValidation: z.ZodOptional<z.ZodBoolean>;
    nameFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodBoolean>>;
    jsDocTagFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value?: string | undefined;
    }, {
        name: string;
        value?: string | undefined;
    }>, "many">], z.ZodUnknown>, z.ZodBoolean>>;
    getSchemaName: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodString>>;
    keepComments: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    skipParseJSDoc: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    inferredTypes: z.ZodOptional<z.ZodString>;
    customJSDocFormatTypes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
        regex: z.ZodString;
        errorMessage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        regex: string;
        errorMessage?: string | undefined;
    }, {
        regex: string;
        errorMessage?: string | undefined;
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    input: string;
    output: string;
    keepComments: boolean;
    skipParseJSDoc: boolean;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}, {
    input: string;
    output: string;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    keepComments?: boolean | undefined;
    skipParseJSDoc?: boolean | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}>, z.ZodArray<z.ZodIntersection<z.ZodObject<{
    input: z.ZodString;
    output: z.ZodString;
    skipValidation: z.ZodOptional<z.ZodBoolean>;
    nameFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodBoolean>>;
    jsDocTagFilter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value?: string | undefined;
    }, {
        name: string;
        value?: string | undefined;
    }>, "many">], z.ZodUnknown>, z.ZodBoolean>>;
    getSchemaName: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodString>>;
    keepComments: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    skipParseJSDoc: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    inferredTypes: z.ZodOptional<z.ZodString>;
    customJSDocFormatTypes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
        regex: z.ZodString;
        errorMessage: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        regex: string;
        errorMessage?: string | undefined;
    }, {
        regex: string;
        errorMessage?: string | undefined;
    }>]>>>;
}, "strip", z.ZodTypeAny, {
    input: string;
    output: string;
    keepComments: boolean;
    skipParseJSDoc: boolean;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}, {
    input: string;
    output: string;
    skipValidation?: boolean | undefined;
    nameFilter?: ((args_0: string, ...args_1: unknown[]) => boolean) | undefined;
    jsDocTagFilter?: ((args_0: {
        name: string;
        value?: string | undefined;
    }[], ...args_1: unknown[]) => boolean) | undefined;
    getSchemaName?: ((args_0: string, ...args_1: unknown[]) => string) | undefined;
    keepComments?: boolean | undefined;
    skipParseJSDoc?: boolean | undefined;
    inferredTypes?: string | undefined;
    customJSDocFormatTypes?: Record<string, string | {
        regex: string;
        errorMessage?: string | undefined;
    }> | undefined;
}>, z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>>, "many">]>;
