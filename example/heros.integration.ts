// Generated by ts-to-zod
import { z } from "zod";

import * as spec from "./heros";
import * as generated from "./heros.zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function expectType<T>(_: T) {
  /* noop */
}

export type ennemySchemaInferredType = z.infer<typeof generated.ennemySchema>;

export type supermanSchemaInferredType = z.infer<
  typeof generated.supermanSchema
>;

export type vilainSchemaInferredType = z.infer<typeof generated.vilainSchema>;
expectType<spec.Ennemy>({} as ennemySchemaInferredType);
expectType<ennemySchemaInferredType>({} as spec.Ennemy);
expectType<spec.Superman>({} as supermanSchemaInferredType);
expectType<supermanSchemaInferredType>({} as spec.Superman);
expectType<spec.Vilain>({} as vilainSchemaInferredType);
expectType<vilainSchemaInferredType>({} as spec.Vilain);
