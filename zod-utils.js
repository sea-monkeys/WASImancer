import { z } from "zod";

// Helper to create Zod schema based on argument type
export function createZodSchema(argType) {
  switch(argType.toLowerCase()) {
    case 'string':
      return z.string();
    case 'number':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'object':
      return z.record(z.any());
    case 'array':
      return z.array(z.any());
    default:
      return z.any();
  }
}