"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZodSchemaVariableStatement = void 0;
const tslib_1 = require("tslib");
const case_1 = require("case");
const uniq_1 = tslib_1.__importDefault(require("lodash/uniq"));
const typescript_1 = tslib_1.__importStar(require("typescript"));
const findNode_1 = require("../utils/findNode");
const isNotNull_1 = require("../utils/isNotNull");
const jsDocTags_1 = require("./jsDocTags");
/**
 * Generate zod schema declaration
 *
 * ```ts
 * export const ${varName} = ${zodImportValue}.object(…)
 * ```
 */
function generateZodSchemaVariableStatement({ node, sourceFile, varName, zodImportValue = "z", getDependencyName = (identifierName) => (0, case_1.camel)(`${identifierName}Schema`), skipParseJSDoc = false, customJSDocFormatTypes, }) {
    let schema;
    let dependencies = [];
    let requiresImport = false;
    if (typescript_1.default.isInterfaceDeclaration(node)) {
        let schemaExtensionClauses;
        if (node.typeParameters) {
            throw new Error("Interface with generics are not supported!");
        }
        if (node.heritageClauses) {
            // Looping on heritageClauses browses the "extends" keywords
            schemaExtensionClauses = node.heritageClauses.reduce((deps, h) => {
                if (h.token !== typescript_1.default.SyntaxKind.ExtendsKeyword || !h.types) {
                    return deps;
                }
                // Looping on types browses the comma-separated interfaces
                const heritages = h.types.map((expression) => {
                    return getDependencyName(expression.getText(sourceFile));
                });
                return deps.concat(heritages);
            }, []);
            dependencies = dependencies.concat(schemaExtensionClauses);
        }
        schema = buildZodObject({
            typeNode: node,
            sourceFile,
            z: zodImportValue,
            dependencies,
            getDependencyName,
            schemaExtensionClauses,
            skipParseJSDoc,
            customJSDocFormatTypes,
        });
        if (!skipParseJSDoc) {
            const jsDocTags = (0, jsDocTags_1.getJSDocTags)(node, sourceFile);
            if (jsDocTags.strict) {
                schema = typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(schema, typescript_1.factory.createIdentifier("strict")), undefined, undefined);
            }
        }
    }
    if (typescript_1.default.isTypeAliasDeclaration(node)) {
        if (node.typeParameters) {
            throw new Error("Type with generics are not supported!");
        }
        const jsDocTags = skipParseJSDoc ? {} : (0, jsDocTags_1.getJSDocTags)(node, sourceFile);
        schema = buildZodPrimitive({
            z: zodImportValue,
            typeNode: node.type,
            isOptional: false,
            jsDocTags,
            customJSDocFormatTypes,
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
        });
    }
    if (typescript_1.default.isEnumDeclaration(node)) {
        schema = buildZodSchema(zodImportValue, "nativeEnum", [node.name]);
        requiresImport = true;
    }
    return {
        dependencies: (0, uniq_1.default)(dependencies),
        statement: typescript_1.factory.createVariableStatement(node.modifiers, typescript_1.factory.createVariableDeclarationList([
            typescript_1.factory.createVariableDeclaration(typescript_1.factory.createIdentifier(varName), undefined, undefined, schema),
        ], typescript_1.default.NodeFlags.Const)),
        requiresImport,
    };
}
exports.generateZodSchemaVariableStatement = generateZodSchemaVariableStatement;
function buildZodProperties({ members, zodImportValue: z, sourceFile, dependencies, getDependencyName, skipParseJSDoc, customJSDocFormatTypes, }) {
    const properties = new Map();
    members.forEach((member) => {
        if (!typescript_1.default.isPropertySignature(member) ||
            !member.type ||
            !(typescript_1.default.isIdentifier(member.name) ||
                typescript_1.default.isStringLiteral(member.name) ||
                typescript_1.default.isNumericLiteral(member.name))) {
            return;
        }
        const isOptional = Boolean(member.questionToken);
        const jsDocTags = skipParseJSDoc ? {} : (0, jsDocTags_1.getJSDocTags)(member, sourceFile);
        properties.set(member.name, buildZodPrimitive({
            z,
            typeNode: member.type,
            isOptional,
            jsDocTags,
            customJSDocFormatTypes,
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
        }));
    });
    return properties;
}
function buildZodPrimitive({ z, typeNode, isOptional, isNullable, isPartial, isRequired, jsDocTags, customJSDocFormatTypes, sourceFile, dependencies, getDependencyName, skipParseJSDoc, }) {
    const zodProperties = (0, jsDocTags_1.jsDocTagToZodProperties)(jsDocTags, customJSDocFormatTypes, isOptional, Boolean(isPartial), Boolean(isRequired), Boolean(isNullable));
    if (typescript_1.default.isParenthesizedTypeNode(typeNode)) {
        return buildZodPrimitive({
            z,
            typeNode: typeNode.type,
            isOptional,
            jsDocTags,
            customJSDocFormatTypes,
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
        });
    }
    if (typescript_1.default.isTypeReferenceNode(typeNode) && typescript_1.default.isIdentifier(typeNode.typeName)) {
        const identifierName = typeNode.typeName.text;
        // Deal with `Array<>` syntax
        if (identifierName === "Array" && typeNode.typeArguments) {
            return buildZodPrimitive({
                z,
                typeNode: typescript_1.factory.createArrayTypeNode(typeNode.typeArguments[0]),
                isOptional,
                isNullable,
                jsDocTags: {},
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
                customJSDocFormatTypes,
            });
        }
        // Deal with `Partial<>` syntax
        if (identifierName === "Partial" && typeNode.typeArguments) {
            return buildZodPrimitive({
                z,
                typeNode: typeNode.typeArguments[0],
                isOptional,
                isNullable,
                jsDocTags,
                customJSDocFormatTypes,
                sourceFile,
                isPartial: true,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
            });
        }
        // Deal with `Required<>` syntax
        if (identifierName === "Required" && typeNode.typeArguments) {
            return buildZodPrimitive({
                z,
                typeNode: typeNode.typeArguments[0],
                isOptional,
                isNullable,
                jsDocTags,
                customJSDocFormatTypes,
                sourceFile,
                isRequired: true,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
            });
        }
        // Deal with `Readonly<>` syntax
        if (identifierName === "Readonly" && typeNode.typeArguments) {
            return buildZodPrimitive({
                z,
                typeNode: typeNode.typeArguments[0],
                isOptional,
                isNullable,
                jsDocTags,
                customJSDocFormatTypes,
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
            });
        }
        // Deal with `ReadonlyArray<>` syntax
        if (identifierName === "ReadonlyArray" && typeNode.typeArguments) {
            return buildZodSchema(z, "array", [
                buildZodPrimitive({
                    z,
                    typeNode: typeNode.typeArguments[0],
                    isOptional: false,
                    jsDocTags: {},
                    sourceFile,
                    dependencies,
                    getDependencyName,
                    skipParseJSDoc,
                    customJSDocFormatTypes,
                }),
            ], zodProperties);
        }
        // Deal with `Record<>` syntax
        if (identifierName === "Record" && typeNode.typeArguments) {
            if (typeNode.typeArguments[0].kind === typescript_1.default.SyntaxKind.StringKeyword) {
                // Short version (`z.record(zodType)`)
                return buildZodSchema(z, "record", [
                    buildZodPrimitive({
                        z,
                        typeNode: typeNode.typeArguments[1],
                        isOptional: false,
                        jsDocTags,
                        customJSDocFormatTypes,
                        sourceFile,
                        isPartial: false,
                        dependencies,
                        getDependencyName,
                        skipParseJSDoc,
                    }),
                ], zodProperties);
            }
            // Expanded version (`z.record(zodType, zodType)`)
            return buildZodSchema(z, "record", [
                buildZodPrimitive({
                    z,
                    typeNode: typeNode.typeArguments[0],
                    isOptional: false,
                    jsDocTags,
                    customJSDocFormatTypes,
                    sourceFile,
                    isPartial: false,
                    dependencies,
                    getDependencyName,
                    skipParseJSDoc,
                }),
                buildZodPrimitive({
                    z,
                    typeNode: typeNode.typeArguments[1],
                    isOptional: false,
                    jsDocTags,
                    customJSDocFormatTypes,
                    sourceFile,
                    isPartial: false,
                    dependencies,
                    getDependencyName,
                    skipParseJSDoc,
                }),
            ], zodProperties);
        }
        // Deal with `Date`
        if (identifierName === "Date") {
            return buildZodSchema(z, "date", [], zodProperties);
        }
        // Deal with `Set<>` syntax
        if (identifierName === "Set" && typeNode.typeArguments) {
            return buildZodSchema(z, "set", typeNode.typeArguments.map((i) => buildZodPrimitive({
                z,
                typeNode: i,
                isOptional: false,
                jsDocTags,
                customJSDocFormatTypes,
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
            })), zodProperties);
        }
        // Deal with `Promise<>` syntax
        if (identifierName === "Promise" && typeNode.typeArguments) {
            return buildZodSchema(z, "promise", typeNode.typeArguments.map((i) => buildZodPrimitive({
                z,
                typeNode: i,
                isOptional: false,
                jsDocTags,
                customJSDocFormatTypes,
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
            })), zodProperties);
        }
        // Deal with `Omit<>` & `Pick<>` syntax
        if (["Omit", "Pick"].includes(identifierName) && typeNode.typeArguments) {
            const [originalType, keys] = typeNode.typeArguments;
            let parameters;
            if (typescript_1.default.isLiteralTypeNode(keys)) {
                parameters = typescript_1.factory.createObjectLiteralExpression([
                    typescript_1.factory.createPropertyAssignment(keys.literal.getText(sourceFile), typescript_1.factory.createTrue()),
                ]);
            }
            if (typescript_1.default.isUnionTypeNode(keys)) {
                parameters = typescript_1.factory.createObjectLiteralExpression(keys.types.map((type) => {
                    if (!typescript_1.default.isLiteralTypeNode(type)) {
                        throw new Error(`${identifierName}<T, K> unknown syntax: (${typescript_1.default.SyntaxKind[type.kind]} as K union part not supported)`);
                    }
                    return typescript_1.factory.createPropertyAssignment(type.literal.getText(sourceFile), typescript_1.factory.createTrue());
                }));
            }
            if (!parameters) {
                throw new Error(`${identifierName}<T, K> unknown syntax: (${typescript_1.default.SyntaxKind[keys.kind]} as K not supported)`);
            }
            return typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(buildZodPrimitive({
                z,
                typeNode: originalType,
                isOptional: false,
                jsDocTags: {},
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
                customJSDocFormatTypes,
            }), typescript_1.factory.createIdentifier((0, case_1.lower)(identifierName))), undefined, [parameters]);
        }
        const dependencyName = getDependencyName(identifierName);
        dependencies.push(dependencyName);
        const zodSchema = typescript_1.factory.createIdentifier(dependencyName);
        return withZodProperties(zodSchema, zodProperties);
    }
    if (typescript_1.default.isUnionTypeNode(typeNode)) {
        const hasNull = Boolean(typeNode.types.find((i) => typescript_1.default.isLiteralTypeNode(i) &&
            i.literal.kind === typescript_1.default.SyntaxKind.NullKeyword));
        const nodes = typeNode.types.filter(isNotNull_1.isNotNull);
        // type A = | 'b' is a valid typescript definition
        // Zod does not allow `z.union(['b']), so we have to return just the value
        if (nodes.length === 1) {
            return buildZodPrimitive({
                z,
                typeNode: nodes[0],
                isOptional,
                isNullable: hasNull,
                jsDocTags,
                customJSDocFormatTypes,
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
            });
        }
        const values = nodes.map((i) => buildZodPrimitive({
            z,
            typeNode: i,
            isOptional: false,
            isNullable: false,
            jsDocTags: {},
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
            customJSDocFormatTypes,
        }));
        // Handling null value outside of the union type
        if (hasNull) {
            zodProperties.push({
                identifier: "nullable",
            });
        }
        return buildZodSchema(z, "union", [typescript_1.factory.createArrayLiteralExpression(values)], zodProperties);
    }
    if (typescript_1.default.isTupleTypeNode(typeNode)) {
        const values = typeNode.elements.map((i) => buildZodPrimitive({
            z,
            typeNode: typescript_1.default.isNamedTupleMember(i) ? i.type : i,
            isOptional: false,
            jsDocTags: {},
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
            customJSDocFormatTypes,
        }));
        return buildZodSchema(z, "tuple", [typescript_1.factory.createArrayLiteralExpression(values)], zodProperties);
    }
    if (typescript_1.default.isLiteralTypeNode(typeNode)) {
        if (typescript_1.default.isStringLiteral(typeNode.literal)) {
            return buildZodSchema(z, "literal", [typescript_1.factory.createStringLiteral(typeNode.literal.text)], zodProperties);
        }
        if (typescript_1.default.isNumericLiteral(typeNode.literal)) {
            return buildZodSchema(z, "literal", [typescript_1.factory.createNumericLiteral(typeNode.literal.text)], zodProperties);
        }
        if (typescript_1.default.isPrefixUnaryExpression(typeNode.literal)) {
            if (typeNode.literal.operator === typescript_1.default.SyntaxKind.MinusToken &&
                typescript_1.default.isNumericLiteral(typeNode.literal.operand)) {
                return buildZodSchema(z, "literal", [
                    typescript_1.factory.createPrefixUnaryExpression(typescript_1.default.SyntaxKind.MinusToken, typescript_1.factory.createNumericLiteral(typeNode.literal.operand.text)),
                ], zodProperties);
            }
        }
        if (typeNode.literal.kind === typescript_1.default.SyntaxKind.TrueKeyword) {
            return buildZodSchema(z, "literal", [typescript_1.factory.createTrue()], zodProperties);
        }
        if (typeNode.literal.kind === typescript_1.default.SyntaxKind.FalseKeyword) {
            return buildZodSchema(z, "literal", [typescript_1.factory.createFalse()], zodProperties);
        }
    }
    // Deal with enums used as literals
    if (typescript_1.default.isTypeReferenceNode(typeNode) &&
        typescript_1.default.isQualifiedName(typeNode.typeName) &&
        typescript_1.default.isIdentifier(typeNode.typeName.left)) {
        return buildZodSchema(z, "literal", [
            typescript_1.factory.createPropertyAccessExpression(typeNode.typeName.left, typeNode.typeName.right),
        ], zodProperties);
    }
    if (typescript_1.default.isArrayTypeNode(typeNode)) {
        return buildZodSchema(z, "array", [
            buildZodPrimitive({
                z,
                typeNode: typeNode.elementType,
                isOptional: false,
                jsDocTags: {},
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
                customJSDocFormatTypes,
            }),
        ], zodProperties);
    }
    if (typescript_1.default.isTypeLiteralNode(typeNode)) {
        return withZodProperties(buildZodObject({
            typeNode,
            z,
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
            customJSDocFormatTypes,
        }), zodProperties);
    }
    if (typescript_1.default.isIntersectionTypeNode(typeNode)) {
        const [base, ...rest] = typeNode.types;
        const basePrimitive = buildZodPrimitive({
            z,
            typeNode: base,
            isOptional: false,
            jsDocTags: {},
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
            customJSDocFormatTypes,
        });
        return rest.reduce((intersectionSchema, node) => typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(intersectionSchema, typescript_1.factory.createIdentifier("and")), undefined, [
            buildZodPrimitive({
                z,
                typeNode: node,
                isOptional: false,
                jsDocTags: {},
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
                customJSDocFormatTypes,
            }),
        ]), basePrimitive);
    }
    if (typescript_1.default.isLiteralTypeNode(typeNode)) {
        return buildZodSchema(z, typeNode.literal.getText(sourceFile), [], zodProperties);
    }
    if (typescript_1.default.isFunctionTypeNode(typeNode)) {
        return buildZodSchema(z, "function", [], [
            {
                identifier: "args",
                expressions: typeNode.parameters.map((p) => buildZodPrimitive({
                    z,
                    typeNode: p.type || typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.AnyKeyword),
                    jsDocTags,
                    customJSDocFormatTypes,
                    sourceFile,
                    dependencies,
                    getDependencyName,
                    isOptional: Boolean(p.questionToken),
                    skipParseJSDoc,
                })),
            },
            {
                identifier: "returns",
                expressions: [
                    buildZodPrimitive({
                        z,
                        typeNode: typeNode.type,
                        jsDocTags,
                        customJSDocFormatTypes,
                        sourceFile,
                        dependencies,
                        getDependencyName,
                        isOptional: false,
                        skipParseJSDoc,
                    }),
                ],
            },
            ...zodProperties,
        ]);
    }
    if (typescript_1.default.isIndexedAccessTypeNode(typeNode)) {
        return buildSchemaReference({
            node: typeNode,
            getDependencyName,
            sourceFile,
            dependencies,
        });
    }
    switch (typeNode.kind) {
        case typescript_1.default.SyntaxKind.StringKeyword:
            return buildZodSchema(z, "string", [], zodProperties);
        case typescript_1.default.SyntaxKind.BooleanKeyword:
            return buildZodSchema(z, "boolean", [], zodProperties);
        case typescript_1.default.SyntaxKind.UndefinedKeyword:
            return buildZodSchema(z, "undefined", [], zodProperties);
        case typescript_1.default.SyntaxKind.NumberKeyword:
            return buildZodSchema(z, "number", [], zodProperties);
        case typescript_1.default.SyntaxKind.AnyKeyword:
            return buildZodSchema(z, "any", [], zodProperties);
        case typescript_1.default.SyntaxKind.BigIntKeyword:
            return buildZodSchema(z, "bigint", [], zodProperties);
        case typescript_1.default.SyntaxKind.VoidKeyword:
            return buildZodSchema(z, "void", [], zodProperties);
        case typescript_1.default.SyntaxKind.NeverKeyword:
            return buildZodSchema(z, "never", [], zodProperties);
        case typescript_1.default.SyntaxKind.UnknownKeyword:
            return buildZodSchema(z, "unknown", [], zodProperties);
    }
    console.warn(` »   Warning: '${typescript_1.default.SyntaxKind[typeNode.kind]}' is not supported, fallback into 'z.any()'`);
    return buildZodSchema(z, "any", [], zodProperties);
}
/**
 * Build a zod schema.
 *
 * @param z zod namespace
 * @param callName zod function
 * @param args Args to add to the main zod call, if any
 * @param properties An array of flags that should be added as extra property calls such as optional to add .optional()
 */
function buildZodSchema(z, callName, args, properties) {
    const zodCall = typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier(z), typescript_1.factory.createIdentifier(callName)), undefined, args);
    return withZodProperties(zodCall, properties);
}
function buildZodExtendedSchema(schemaList, args, properties) {
    let zodCall = typescript_1.factory.createIdentifier(schemaList[0]);
    for (let i = 1; i < schemaList.length; i++) {
        zodCall = typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(zodCall, typescript_1.factory.createIdentifier("extend")), undefined, [
            typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier(schemaList[i]), typescript_1.factory.createIdentifier("shape")),
        ]);
    }
    if (args === null || args === void 0 ? void 0 : args.length) {
        zodCall = typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(zodCall, typescript_1.factory.createIdentifier("extend")), undefined, args);
    }
    return withZodProperties(zodCall, properties);
}
/**
 * Apply zod properties to an expression (as `.optional()`)
 *
 * @param expression
 * @param properties
 */
function withZodProperties(expression, properties = []) {
    return properties.reduce((expressionWithProperties, property) => typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(expressionWithProperties, typescript_1.factory.createIdentifier(property.identifier)), undefined, property.expressions ? property.expressions : undefined), expression);
}
/**
 * Build z.object (with support of index signature)
 */
function buildZodObject({ typeNode, z, dependencies, sourceFile, getDependencyName, schemaExtensionClauses, skipParseJSDoc, customJSDocFormatTypes, }) {
    const { properties, indexSignature } = typeNode.members.reduce((mem, member) => {
        if (typescript_1.default.isIndexSignatureDeclaration(member)) {
            return Object.assign(Object.assign({}, mem), { indexSignature: member });
        }
        if (typescript_1.default.isPropertySignature(member)) {
            return Object.assign(Object.assign({}, mem), { properties: [...mem.properties, member] });
        }
        return mem;
    }, { properties: [] });
    let objectSchema;
    const parsedProperties = properties.length > 0
        ? buildZodProperties({
            members: properties,
            zodImportValue: z,
            sourceFile,
            dependencies,
            getDependencyName,
            skipParseJSDoc,
            customJSDocFormatTypes,
        })
        : new Map();
    if (schemaExtensionClauses && schemaExtensionClauses.length > 0) {
        objectSchema = buildZodExtendedSchema(schemaExtensionClauses, properties.length > 0
            ? [
                typescript_1.factory.createObjectLiteralExpression(Array.from(parsedProperties.entries()).map(([key, tsCall]) => {
                    return typescript_1.factory.createPropertyAssignment(key, tsCall);
                }), true),
            ]
            : undefined);
    }
    else if (properties.length > 0) {
        objectSchema = buildZodSchema(z, "object", [
            typescript_1.factory.createObjectLiteralExpression(Array.from(parsedProperties.entries()).map(([key, tsCall]) => {
                return typescript_1.factory.createPropertyAssignment(key, tsCall);
            }), true),
        ]);
    }
    if (indexSignature) {
        if (schemaExtensionClauses) {
            throw new Error("interface with `extends` and index signature are not supported!");
        }
        const indexSignatureSchema = buildZodSchema(z, "record", [
            // Index signature type can't be optional or have validators.
            buildZodPrimitive({
                z,
                typeNode: indexSignature.type,
                isOptional: false,
                jsDocTags: {},
                sourceFile,
                dependencies,
                getDependencyName,
                skipParseJSDoc,
                customJSDocFormatTypes,
            }),
        ]);
        if (objectSchema) {
            return typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(indexSignatureSchema, typescript_1.factory.createIdentifier("and")), undefined, [objectSchema]);
        }
        return indexSignatureSchema;
    }
    else if (objectSchema) {
        return objectSchema;
    }
    return buildZodSchema(z, "object", [typescript_1.factory.createObjectLiteralExpression()]);
}
/**
 * Build a schema reference from an IndexedAccessTypeNode
 *
 * example: Superman["power"]["fly"] -> SupermanSchema.shape.power.shape.fly
 */
function buildSchemaReference({ node, dependencies, sourceFile, getDependencyName, }, path = "") {
    const indexTypeText = node.indexType.getText(sourceFile);
    const { indexTypeName, type: indexTypeType } = /^"\w+"$/.exec(indexTypeText)
        ? { type: "string", indexTypeName: indexTypeText.slice(1, -1) }
        : { type: "number", indexTypeName: indexTypeText };
    if (indexTypeName === "-1") {
        // Get the original type declaration
        const declaration = (0, findNode_1.findNode)(sourceFile, (n) => {
            return ((typescript_1.default.isInterfaceDeclaration(n) || typescript_1.default.isTypeAliasDeclaration(n)) &&
                typescript_1.default.isIndexedAccessTypeNode(node.objectType) &&
                n.name.getText(sourceFile) ===
                    node.objectType.objectType.getText(sourceFile).split("[")[0]);
        });
        if (declaration && typescript_1.default.isIndexedAccessTypeNode(node.objectType)) {
            const key = node.objectType.indexType.getText(sourceFile).slice(1, -1); // remove quotes
            const members = typescript_1.default.isTypeAliasDeclaration(declaration) &&
                typescript_1.default.isTypeLiteralNode(declaration.type)
                ? declaration.type.members
                : typescript_1.default.isInterfaceDeclaration(declaration)
                    ? declaration.members
                    : [];
            const member = members.find((m) => { var _a; return ((_a = m.name) === null || _a === void 0 ? void 0 : _a.getText(sourceFile)) === key; });
            if (member && typescript_1.default.isPropertySignature(member) && member.type) {
                // Array<type>
                if (typescript_1.default.isTypeReferenceNode(member.type) &&
                    member.type.typeName.getText(sourceFile) === "Array") {
                    return buildSchemaReference({
                        node: node.objectType,
                        dependencies,
                        sourceFile,
                        getDependencyName,
                    }, `element.${path}`);
                }
                // type[]
                if (typescript_1.default.isArrayTypeNode(member.type)) {
                    return buildSchemaReference({
                        node: node.objectType,
                        dependencies,
                        sourceFile,
                        getDependencyName,
                    }, `element.${path}`);
                }
                // Record<string, type>
                if (typescript_1.default.isTypeReferenceNode(member.type) &&
                    member.type.typeName.getText(sourceFile) === "Record") {
                    return buildSchemaReference({
                        node: node.objectType,
                        dependencies,
                        sourceFile,
                        getDependencyName,
                    }, `valueSchema.${path}`);
                }
                console.warn(` »   Warning: indexAccessType can’t be resolved, fallback into 'any'`);
                return typescript_1.factory.createIdentifier("any");
            }
        }
        return typescript_1.factory.createIdentifier("any");
    }
    else if (indexTypeType === "number" &&
        typescript_1.default.isIndexedAccessTypeNode(node.objectType)) {
        return buildSchemaReference({ node: node.objectType, dependencies, sourceFile, getDependencyName }, `items[${indexTypeName}].${path}`);
    }
    if (typescript_1.default.isIndexedAccessTypeNode(node.objectType)) {
        return buildSchemaReference({ node: node.objectType, dependencies, sourceFile, getDependencyName }, `shape.${indexTypeName}.${path}`);
    }
    if (typescript_1.default.isTypeReferenceNode(node.objectType)) {
        const dependencyName = getDependencyName(node.objectType.typeName.getText(sourceFile));
        dependencies.push(dependencyName);
        return typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier(dependencyName), typescript_1.factory.createIdentifier(`shape.${indexTypeName}.${path}`.slice(0, -1)));
    }
    throw new Error("Unknown IndexedAccessTypeNode.objectType type");
}
//# sourceMappingURL=generateZodSchema.js.map