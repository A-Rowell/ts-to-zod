"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsDocTagToZodProperties = exports.getJSDocTags = void 0;
const tsutils_1 = require("tsutils");
const typescript_1 = require("typescript");
/**
 * List of formats that can be translated in zod functions.
 */
const builtInJSDocFormatsTypes = [
    "date-time",
    "email",
    "ip",
    "ipv4",
    "ipv6",
    "url",
    "uuid",
    "uri",
    // "date",
];
/**
 * Type guard to filter supported JSDoc format tag values (built-in).
 *
 * @param formatType
 */
function isBuiltInFormatType(formatType = "") {
    return builtInJSDocFormatsTypes.map(String).includes(formatType);
}
/**
 * Type guard to filter supported JSDoc format tag values (custom).
 *
 * @param formatType
 * @param customFormatTypes
 */
function isCustomFormatType(formatType = "", customFormatTypes) {
    return customFormatTypes.includes(formatType);
}
const jsDocTagKeys = [
    "minimum",
    "maximum",
    "default",
    "minLength",
    "maxLength",
    "format",
    "pattern",
];
/**
 * Type guard to filter supported JSDoc tag key.
 *
 * @param tagName
 */
function isJSDocTagKey(tagName) {
    return jsDocTagKeys.map(String).includes(tagName);
}
/**
 * Parse js doc comment.
 *
 * @example
 * parseJsDocComment("email should be an email");
 * // {value: "email", errorMessage: "should be an email"}
 *
 * @param comment
 */
function parseJsDocComment(comment) {
    const [value, ...rest] = comment.split(" ");
    const errorMessage = rest.join(" ").replace(/(^["']|["']$)/g, "") || undefined;
    return {
        value: value.replace(",", "").replace(/(^["']|["']$)/g, ""),
        errorMessage,
    };
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
function getJSDocTags(nodeType, sourceFile) {
    const jsDoc = (0, tsutils_1.getJsDoc)(nodeType, sourceFile);
    const jsDocTags = {};
    if (jsDoc.length) {
        jsDoc.forEach((doc) => {
            (doc.tags || []).forEach((tag) => {
                const tagName = tag.tagName.escapedText.toString();
                // Handling "unary operator" tag first (no tag.comment part needed)
                if (tagName === "strict") {
                    jsDocTags[tagName] = true;
                    return;
                }
                if (!isJSDocTagKey(tagName) || typeof tag.comment !== "string")
                    return;
                const { value, errorMessage } = parseJsDocComment(tag.comment);
                switch (tagName) {
                    case "minimum":
                    case "maximum":
                    case "minLength":
                    case "maxLength":
                        if (value && !Number.isNaN(parseInt(value))) {
                            jsDocTags[tagName] = { value: parseInt(value), errorMessage };
                        }
                        break;
                    case "pattern":
                        if (tag.comment) {
                            jsDocTags[tagName] = tag.comment;
                        }
                        break;
                    case "format":
                        jsDocTags[tagName] = { value, errorMessage };
                        break;
                    case "default":
                        if (tag.comment &&
                            !tag.comment.includes('"') &&
                            !Number.isNaN(parseInt(tag.comment))) {
                            // number
                            jsDocTags[tagName] = parseInt(tag.comment);
                        }
                        else if (tag.comment && ["false", "true"].includes(tag.comment)) {
                            // boolean
                            jsDocTags[tagName] = tag.comment === "true";
                        }
                        else if (tag.comment &&
                            tag.comment.startsWith('"') &&
                            tag.comment.endsWith('"')) {
                            // string with double quotes
                            jsDocTags[tagName] = tag.comment.slice(1, -1);
                        }
                        else if (tag.comment) {
                            // string without quotes
                            jsDocTags[tagName] = tag.comment;
                        }
                        break;
                }
            });
        });
    }
    return jsDocTags;
}
exports.getJSDocTags = getJSDocTags;
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
function jsDocTagToZodProperties(jsDocTags, customJSDocFormats, isOptional, isPartial, isRequired, isNullable) {
    const zodProperties = [];
    if (jsDocTags.minimum !== undefined) {
        zodProperties.push({
            identifier: "min",
            expressions: withErrorMessage(typescript_1.factory.createNumericLiteral(jsDocTags.minimum.value), jsDocTags.minimum.errorMessage),
        });
    }
    if (jsDocTags.maximum !== undefined) {
        zodProperties.push({
            identifier: "max",
            expressions: withErrorMessage(typescript_1.factory.createNumericLiteral(jsDocTags.maximum.value), jsDocTags.maximum.errorMessage),
        });
    }
    if (jsDocTags.minLength !== undefined) {
        zodProperties.push({
            identifier: "min",
            expressions: withErrorMessage(typescript_1.factory.createNumericLiteral(jsDocTags.minLength.value), jsDocTags.minLength.errorMessage),
        });
    }
    if (jsDocTags.maxLength !== undefined) {
        zodProperties.push({
            identifier: "max",
            expressions: withErrorMessage(typescript_1.factory.createNumericLiteral(jsDocTags.maxLength.value), jsDocTags.maxLength.errorMessage),
        });
    }
    if (jsDocTags.format &&
        (isBuiltInFormatType(jsDocTags.format.value) ||
            isCustomFormatType(jsDocTags.format.value, Object.keys(customJSDocFormats)))) {
        zodProperties.push(formatToZodProperty(jsDocTags.format, customJSDocFormats));
    }
    if (jsDocTags.pattern) {
        zodProperties.push(createZodRegexProperty(jsDocTags.pattern));
    }
    // strict() must be before optional() and nullable()
    if (jsDocTags.strict) {
        zodProperties.push({ identifier: "strict" });
    }
    if (isOptional) {
        zodProperties.push({
            identifier: "optional",
        });
    }
    if (isNullable) {
        zodProperties.push({
            identifier: "nullable",
        });
    }
    if (isPartial) {
        zodProperties.push({
            identifier: "partial",
        });
    }
    if (isRequired) {
        zodProperties.push({
            identifier: "required",
        });
    }
    if (jsDocTags.default !== undefined) {
        zodProperties.push({
            identifier: "default",
            expressions: jsDocTags.default === true
                ? [typescript_1.factory.createTrue()]
                : jsDocTags.default === false
                    ? [typescript_1.factory.createFalse()]
                    : typeof jsDocTags.default === "number"
                        ? [typescript_1.factory.createNumericLiteral(jsDocTags.default)]
                        : [typescript_1.factory.createStringLiteral(jsDocTags.default)],
        });
    }
    return zodProperties;
}
exports.jsDocTagToZodProperties = jsDocTagToZodProperties;
/**
 * Converts the given JSDoc format to the corresponding Zod
 * string validation function call represented by a {@link ZodProperty}.
 *
 * @param format The format to be converted.
 * @returns A ZodProperty representing a Zod string validation function call.
 */
function formatToZodProperty(format, customFormatTypes) {
    var _a;
    if (isCustomFormatType(format.value, Object.keys(customFormatTypes))) {
        const rule = customFormatTypes[format.value];
        const regex = typeof rule === "string" ? rule : rule.regex;
        const errorMessage = typeof rule === "string" ? undefined : rule.errorMessage;
        return createZodRegexProperty(regex, (_a = format.errorMessage) !== null && _a !== void 0 ? _a : errorMessage);
    }
    const identifier = builtInFormatTypeToZodPropertyIdentifier(format.value);
    const expressions = builtInFormatTypeToZodPropertyArguments(format.value, format.errorMessage);
    return { identifier, expressions };
}
/**
 * Maps the given JSDoc format type to its corresponding
 * Zod string validation function name.
 *
 * @param formatType The format type to be converted.
 * @returns The name of a Zod string validation function.
 */
function builtInFormatTypeToZodPropertyIdentifier(formatType) {
    switch (formatType) {
        case "date-time":
            return "datetime";
        case "ipv4":
        case "ipv6":
        case "ip":
            return "ip";
        case "uri":
        case "url":
            return "url";
        default:
            return formatType;
    }
}
/**
 * Maps the given JSDoc format type and error message to the
 * expected Zod string validation function arguments.
 *
 * @param formatType The format type to be converted.
 * @param errorMessage The error message to display if validation fails.
 * @returns A list of expressions which represent function arguments.
 */
function builtInFormatTypeToZodPropertyArguments(formatType, errorMessage) {
    switch (formatType) {
        case "ipv4":
            return createZodStringIpArgs("v4", errorMessage);
        case "ipv6":
            return createZodStringIpArgs("v6", errorMessage);
        default:
            return errorMessage ? [typescript_1.factory.createStringLiteral(errorMessage)] : undefined;
    }
}
/**
 * Constructs a list of expressions which represent the arguments
 * for `ip()` string validation function.
 *
 * @param version The IP version to use.
 * @param errorMessage The error message to display if validation fails.
 * @returns A list of expressions which represent the function arguments.
 */
function createZodStringIpArgs(version, errorMessage) {
    const propertyAssignments = [
        typescript_1.factory.createPropertyAssignment("version", typescript_1.factory.createStringLiteral(version)),
    ];
    if (errorMessage) {
        propertyAssignments.push(typescript_1.factory.createPropertyAssignment("message", typescript_1.factory.createStringLiteral(errorMessage)));
    }
    return [typescript_1.factory.createObjectLiteralExpression(propertyAssignments)];
}
/**
 * Constructs a ZodProperty that represents a call to
 * `.regex()` with the given regular expression.
 *
 * @param regex The regular expression to match.
 * @param errorMessage The error message to display if validation fails.
 * @returns A ZodProperty representing a `.regex()` call.
 */
function createZodRegexProperty(regex, errorMessage) {
    return {
        identifier: "regex",
        expressions: withErrorMessage(typescript_1.factory.createRegularExpressionLiteral(`/${regex}/`), errorMessage),
    };
}
function withErrorMessage(expression, errorMessage) {
    if (errorMessage) {
        return [expression, typescript_1.factory.createStringLiteral(errorMessage)];
    }
    return [expression];
}
//# sourceMappingURL=jsDocTags.js.map