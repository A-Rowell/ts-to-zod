<p align="center">
  <img src="ts-to-zod-logo.svg" width="200px" align="center" />
  <h1 align="center">ts-to-zod</h1>
</p>

Generate [Zod](https://github.com/colinhacks/zod) schemas (v3) from Typescript types/interfaces.

[![Version](https://img.shields.io/npm/v/ts-to-zod.svg)](https://npmjs.org/package/ts-to-zod)
![Github CI](https://github.com/fabien0102/ts-to-zod/actions/workflows/tests.yaml/badge.svg)
[![Codecov](https://codecov.io/gh/fabien0102/ts-to-zod/branch/master/graph/badge.svg)](https://codecov.io/gh/fabien0102/ts-to-zod)
[![License](https://img.shields.io/npm/l/ts-to-zod.svg)](https://github.com/fabien0102/ts-to-zod/blob/master/package.json)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

## Usage

```sh
$ yarn add --dev ts-to-zod
$ yarn ts-to-zod src/iDontTrustThisApi.ts src/nowIcanValidateEverything.ts
```

That's it, go to `src/nowIcanValidateEverything.ts` file, you should have all the exported `interface` and `type` as Zod schemas with the following name pattern: `${originalType}Schema`.

## Generated integration tests

To make sure the generated zod schemas are 100% compatible with your original types, you can add the `--tests src/integrationTests.ts` flag to generate an extra file.

Please make sure that this file is part of your typescript project, if everything is green, you are good to go, otherwise, please open an issue 😀.

The goal of this file is just to compare types, nothing else, you can have a look of this file into `example/heros.integration.ts`.

## Validators

This tool supports some JSDoc tags inspired from openapi to generate zod validator.

List of supported keywords:

| JSDoc keyword                      | JSDoc Example     | Generated Zod validator      |
| ---------------------------------- | ----------------- | ---------------------------- |
| `@minimum {number}`                | `@minimum 42`     | `z.number().min(42)`         |
| `@maximum {number}`                | `@maximum 42`     | `z.number().max(42)`         |
| `@minLenght {number}`              | `@minLenght 42`   | `z.string().min(42)`         |
| `@maxLenght {number}`              | `@maxLenght 42`   | `z.string().min(42)`         |
| `@format {"email"\|"uuid"\|"url"}` | `@format email`   | `z.string().email()`         |
| `@pattern {regex}`                 | `@pattern ^hello` | `z.string().regex(/^hello/)` |

Those JSDoc tags can also be combined:

```ts
// source.ts
export interface HeroContact {
  /**
   * The email of the hero.
   *
   * @format email
   */
  email: string;

  /**
   * The name of the hero.
   *
   * @minLenght 2
   * @maxLenght 50
   */
  name: string;

  /**
   * The phone number of the hero.
   *
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$
   */
  phoneNumber: string;

  /**
   * Does the hero has super power?
   *
   * @default true
   */
  hasSuperPower?: boolean;

  /**
   * The age of the hero
   *
   * @minimum 0
   * @maximum 500
   */
  age: number;
}

// output.ts
export const heroContactSchema = z.object({
  /**
   * The email of the hero.
   *
   * @format email
   */
  email: z.string().email(),

  /**
   * The name of the hero.
   *
   * @minLenght 2
   * @maxLenght 50
   */
  name: z.string().min(2).max(50),

  /**
   * The phone number of the hero.
   *
   * @pattern ^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$
   */
  phoneNumber: z.string().regex(/^([+]?d{1,2}[-s]?|)d{3}[-s]?d{3}[-s]?d{4}$/),

  /**
   * Does the hero has super power?
   *
   * @default true
   */
  hasSuperPower: z.boolean().optional(),

  /**
   * The age of the hero
   *
   * @minimum 0
   * @maximum 500
   */
  age: z.number().min(0).max(500),
});
```

## Limitation

Since we are generating Zod schemas, we are limited by what Zod actually supports:

- No type generics
- No complex circular dependencies (you will be warn if you have some in your types)
- No `Record<number, …>`
- No Function type inference
- …

To resume, you can use all the primitive types and some the following typescript helpers:

- `Record<string, …>`
- `Pick<>`
- `Omit<>`
- `Partial<>`
- `Required<>`
- `Array<>`

This utils is design to work with one file only, and will reference types from the same file:

```ts
// source.ts
export type Id = string;
export interface Hero {
  id: Id;
  name: string;
}

// output.ts
export const idSchema = z.string();
export const heroSchema = z.object({
  id: idSchema,
  name: z.string(),
});
```

## Programmatic API

You need more than one file? Want even more power? No problem, just use the tool as a library.

High-level function:

- `generate` take a `sourceText` and generate two file getters

Please have a look to `src/core/generate.test.ts` for more examples.

Low-level functions:

- `generateZodSchema` help you to generate `export const ${varName} = ${zodImportValue}.object(…)`
- `generateZodInferredType` help you to generate `export type ${aliasName} = ${zodImportValue}.infer<typeof ${zodConstName}>`
- `generateIntegrationTests` help you to generate a file comparing the original types & zod types

To learn more about thoses functions or their usages, `src/core/generate.ts` is a good starting point.

## Local development

```sh
$ git clone
$ cd ts-to-zod
$ yarn
$ ./bin/run
USAGE
  $ ts-to-zod [input] [output]
  ...
```

You also have plenty of unit tests to play safely:

```sh
$ yarn test --watch
```

And a playground inside `example`, buildable with the following command:

```sh
$ yarn example
```

Have fun!
