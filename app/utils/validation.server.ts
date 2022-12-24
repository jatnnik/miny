import type { z } from "zod"

export type inferSafeParseErrors<T extends z.ZodTypeAny, U = string> = {
  formErrors?: U[]
  fieldErrors: {
    [P in keyof z.infer<T>]?: U[]
  }
}
