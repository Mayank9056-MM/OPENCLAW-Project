import { z } from "zod";
import { ToolExecutor } from "../agent/tool-executor";
import {
  extractJsonMiddleware,
  generateText,
  Output,
  stepCountIs,
  tool,
  wrapLanguageModel,
} from "ai";
import { defaultAgentConfig } from "../agent/types";
import { ActionTracker } from "../agent/action-tracker";
import chalk from "chalk";
import { getAgentModel } from "../../ai";
import type { PlanStep } from "./types";
import { config as envConfig } from "../../config/conf";
import { createWebTools } from "./web-tools";

const planSchema = z.object({
  researchSummary: z.string().optional(),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        hints: z.array(z.string()).optional(),
        complexity: z.enum(["low", "medium", "high"]).optional(),
      }),
    )
    .min(1)
    .max(15),
});

function readOnlyTools(executor: ToolExecutor) {
  return {
    read_file: tool({
      description:
        "Read the content of a file. The path is relative to the root of the codebase.",
      inputSchema: z.object({
        path: z.string().describe("The relative path to the file to read."),
      }),
      execute: async ({ path: p }) => executor.readFile(p),
    }),
    list_files: tool({
      description: "List files and directories under a path.",
      inputSchema: z.object({
        path: z.string(),
        recursive: z.boolean().optional().default(false),
      }),
      execute: async ({ path: p, recursive }) =>
        executor.listFiles(p, recursive),
    }),
    search_files: tool({
      description:
        'Find files matching a glob pattern (e.g. "*.ts", "**/*.md"). Optional content substring filter.',
      inputSchema: z.object({
        root: z.string().describe("Directory to search, relative to root"),
        pattern: z
          .string()
          .describe("Glob-like pattern using * and ** (forward slashes)"),
        content_contains: z.string().optional(),
      }),
      execute: async ({ root, pattern, content_contains }) =>
        executor.searchFiles(root, pattern, content_contains),
    }),

    analyze_codebase: tool({
      description:
        "Summarize structure: file counts, size, extensions. Read-only.",
      inputSchema: z.object({
        path: z.string().default("."),
      }),
      execute: async ({ path: p }) => executor.analyzeCodebase(p),
    }),
    list_skills: tool({
      description:
        "List absolute paths to SKILL.md files under configured skill directories (Cursor / Claude).",
      inputSchema: z.object({}),
      execute: async () => executor.listSkills(),
    }),

    read_skill: tool({
      description:
        "Read a SKILL.md file. Path must be absolute and under skill roots, or use a path returned by list_skills.",
      inputSchema: z.object({
        path: z.string(),
      }),
      execute: async ({ path: p }) => executor.readSkill(p),
    }),
  };
}

const PLAN_INSTRUCTION = (codebase: string, hasWeb: boolean) =>
  [
    "You are a Plan-Mode planner. You DO NOT modify files.",
    `Workspace: ${codebase}`,
    "Use read-only tools for codebase/skills reasearch.",
    hasWeb
      ? "Web tools are available (web_search/web_crawl/fetch_url). Use only when needed."
      : "Web tools are unavailable (no FIRECRAWL_API_KEY).",
    "Output must watch the provided JSON schema.",
    "keep it short: 1-10 steps.",
  ].join("\n");

export async function generatePlan(goal: string) {
  const config = defaultAgentConfig();
  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);

  const hasWeb = Boolean(envConfig.FIRECRAWL_API_KEY);
  const model = wrapLanguageModel({
    model: getAgentModel(),
    middleware: extractJsonMiddleware(),
  });

 
  const tools = {
    ...readOnlyTools(executor),
    ...(hasWeb ? createWebTools(tracker) : {}),
  };

  console.log(chalk.cyan("\n Reasearching & drafting a plan..."));

  const result = await generateText({
    model,
    tools,
    stopWhen: stepCountIs(20),
    system: PLAN_INSTRUCTION(config.codebasePath, hasWeb),
    prompt: `User goal: \n${goal}`,
    output: Output.object({ schema: planSchema }),
  });

  const validated = planSchema.parse(result.output);

  const steps: PlanStep[] = validated.steps.map((s, i) => ({
    id: `steps-${i + 1}`,
    title: s.title,
    description: s.description,
    hints: s.hints,
    complexity: s.complexity,
  }));

  return {
    goal,
    researchSummary: validated.researchSummary,
    steps,
  };
}
