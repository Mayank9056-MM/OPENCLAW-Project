import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { config } from "../config/conf";

export function getAgentModel() {
  const provider = createOpenRouter({ apikey: config.OPENROUTER_API_KEY });

  const modelId = config.OPENROUTER_DEFAULT_MODEL;
  return provider(modelId);
}
