import { generate } from "./generate";

describe("generate", () => {
  describe("simple case", () => {
    const sourceText = `
      export type Name = "superman" | "clark kent" | "kal-l";

      // Note that the Superman is declared after
      export type BadassSuperman = Omit<Superman, "underKryptonite">;

      export interface Superman {
        name: Name;
        age: number;
        underKryptonite?: boolean;
        /**
         * @format email
         **/
        email: string;
      }
      
      const fly = () => console.log("I can fly!");
      `;

    const { getZodSchemasFile, getIntegrationTestFile, errors } = generate({
      sourceText,
    });

    it("should generate the zod schemas", () => {
      expect(getZodSchemasFile("./hero")).toMatchInlineSnapshot(`
        "// Generated by ts-to-zod
        import { z } from \\"zod\\";

        export const nameSchema = z.union([z.literal(\\"superman\\"), z.literal(\\"clark kent\\"), z.literal(\\"kal-l\\")]);

        export const supermanSchema = z.object({
            name: nameSchema,
            age: z.number(),
            underKryptonite: z.boolean().optional(),
            /**
             * @format email
             **/
            email: z.string().email()
        });

        export const badassSupermanSchema = supermanSchema.omit({ \\"underKryptonite\\": true });
        "
      `);
    });

    it("should generate the integration tests", () => {
      expect(getIntegrationTestFile("./hero", "hero.zod"))
        .toMatchInlineSnapshot(`
        "// Generated by ts-to-zod
        import { z } from \\"zod\\";

        import * as spec from \\"./hero\\";
        import * as generated from \\"hero.zod\\";

        function expectType<T>(_v: T) {}

        export type nameSchemaInferredType = z.infer<typeof generated.nameSchema>;

        export type supermanSchemaInferredType = z.infer<typeof generated.supermanSchema>;

        export type badassSupermanSchemaInferredType = z.infer<typeof generated.badassSupermanSchema>;
        expectType<spec.Name>({} as nameSchemaInferredType)
        expectType<spec.Superman>({} as supermanSchemaInferredType)
        expectType<spec.BadassSuperman>({} as badassSupermanSchemaInferredType)
        "
      `);
    });

    it("should not have any errors", () => {
      expect(errors.length).toBe(0);
    });
  });

  describe("with circular references", () => {
    const sourceText = `
      export interface Vilain {
        name: string;
        powers: string[];
        friends: Vilain[];
      }
      
      export interface EvilPlan {
        owner: Vilain;
        description: string;
        details: EvilPlanDetails;
      }

      export interface EvilPlanDetails {
        parent: EvilPlan; // <- Unsolvable circular reference
        steps: string[];
      }
      `;

    const { getZodSchemasFile, getIntegrationTestFile, errors } = generate({
      sourceText,
      maxRun: 3,
    });

    it("should generate the zod schemas", () => {
      expect(getZodSchemasFile("./vilain")).toMatchInlineSnapshot(`
        "// Generated by ts-to-zod
        import { z } from \\"zod\\";
        import { Vilain } from \\"./vilain\\";

        export const vilainSchema: z.ZodSchema<Vilain> = z.lazy(() => z.object({
            name: z.string(),
            powers: z.array(z.string()),
            friends: z.array(vilainSchema)
        }));
        "
      `);
    });

    it("should generate the integration tests", () => {
      expect(getIntegrationTestFile("./vilain", "vilain.zod"))
        .toMatchInlineSnapshot(`
        "// Generated by ts-to-zod
        import { z } from \\"zod\\";

        import * as spec from \\"./vilain\\";
        import * as generated from \\"vilain.zod\\";

        function expectType<T>(_v: T) {}

        export type vilainSchemaInferredType = z.infer<typeof generated.vilainSchema>;
        expectType<spec.Vilain>({} as vilainSchemaInferredType)
        "
      `);
    });

    it("should have some errors", () => {
      expect(errors).toMatchInlineSnapshot(`
        Array [
          "Some schemas can't be generated due to circular dependencies:
        evilPlanSchema
        evilPlanDetailsSchema",
        ]
      `);
    });
  });

  describe("with options", () => {
    const sourceText = `export interface Superman {
      name: string;
    }

    export interface Vilain {
      name: string;
      didKillSuperman: true;
    }
    `;

    const { getZodSchemasFile } = generate({
      sourceText,
      nameFilter: (id) => id === "Superman",
      getSchemaName: (id) => id.toLowerCase(),
    });

    it("should only generate superman schema", () => {
      expect(getZodSchemasFile("./hero")).toMatchInlineSnapshot(`
        "// Generated by ts-to-zod
        import { z } from \\"zod\\";

        export const superman = z.object({
            name: z.string()
        });
        "
      `);
    });
  });
});
