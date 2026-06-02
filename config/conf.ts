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
  OPENROUTER_API_KEY: z.string(),
  OPENROUTER_DEFAULT_MODEL: z.string().default("openrouter/free"),

  // FIRE CRAWL
  FIRECRAWL_API_KEY: z.string(),

  // TELEGRAM 
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_OWNER_ID: z.string(),
});

export const config = envSchema.parse(process.env);

export type Config = z.infer<typeof envSchema>;
