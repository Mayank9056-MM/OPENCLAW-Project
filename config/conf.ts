import { z } from "zod";

export const configSchema = z.object({
  features: z
    .object({
      cli: z.boolean().default(true),
      telegramBot: z.boolean().default(false),
    })
    .default({ cli: true, telegramBot: false }),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse(process.env);
