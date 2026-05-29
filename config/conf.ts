import { z } from "zod";

const envSchema = z.object({
  features: z
    .object({
      cli: z.boolean(),
      telegramBot: z.boolean(),
    })
    .default({
      cli: false,
      telegramBot: false,
    }),

  // OPEN ROUTER
  OPENROUTER_API_KEY: z.string().default(""),
  OPENROUTER_DEFAULT_MODEL: z.string().default("openrouter/free"),
});

export const config = envSchema.parse(process.env);

export type Config = z.infer<typeof envSchema>;
