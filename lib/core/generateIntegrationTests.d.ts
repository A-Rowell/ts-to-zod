interface TestCase {
    zodType: string;
    tsType: string;
}
/**
 * Generate integration tests to validate if the generated zod schemas
 * are equals to the originals types.
 *
 * ```ts
 * expectType<${tsType}>({} as ${zodType})
 * expectType<${zodType}>({} as ${tsType})
 * ```
 */
export declare function generateIntegrationTests(testCases: TestCase[]): import("typescript").CallExpression[];
export {};
