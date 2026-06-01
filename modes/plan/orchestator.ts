import { confirm, isCancel, text } from "@clack/prompts";
import chalk from "chalk";
import { generatePlan } from "./planner";
import { printPlan, selectSteps } from "./selection";
import { defaultAgentConfig } from "../agent/types";
import { ActionTracker } from "../agent/action-tracker";
import { ToolExecutor } from "../agent/tool-executor";
import { createAgentTool } from "../agent/agent-tools";
import { stepCountIs, ToolLoopAgent } from "ai";
import { getAgentModel } from "../../ai";
import type { PlanStep } from "./types";
import { renderTerminalMarkdown } from "../../tui/terminal-md";
import { runApprovalFlow } from "../agent/approval";
import { createWebTools } from "./web-tools";

function stepPrompt(goal: string, step: PlanStep): string {
  return [`Goal: ${goal}`, `Step: ${step.title}`, step.description].join("\n");
}

export async function runPlanMode(): Promise<void> {
  console.log(chalk.bold("\n Plan Mode \n"));

  const goal = await text({
    message: "What is your goal?",
  });

  if (isCancel(goal) || !goal.trim()) return;

  const plan = await generatePlan(goal);

  printPlan(plan);
  const selected = await selectSteps(plan);

  if (selected.length === 0) {
    console.log(chalk.yellow("No steps selected. Exiting."));
    return;
  }

  const proceed = await confirm({
    message: `You have selected ${selected.length} step(s). Do you want to proceed with execution?`,
    initialValue: true,
  });

  const config = defaultAgentConfig();

  const tracker = new ActionTracker();
  const executor = new ToolExecutor(tracker, config);

  // TODO: add web tools if needed
  const tools = {
    ...createAgentTool(executor),
    ...createWebTools(tracker)
  };

  for (const step of selected) {
    console.log(chalk.bold(`\n ${step.title} \n`));

    const agent = new ToolLoopAgent({
      model: getAgentModel(),
      stopWhen: stepCountIs(20),
      tools,
    });

    const r = await agent.generate({ prompt: stepPrompt(plan.goal, step) });

    if (r.text) return console.log(renderTerminalMarkdown(r.text));
  }

  const ok = await runApprovalFlow(tracker);

  if (!ok) return executor.clearStaging();

  const { errors } = executor.applyApprovedFromTracker();

  if (errors.length) {
    console.log(chalk.red("\n Some errors occurred during execution:"));
    for (const e of errors) {
      console.log(chalk.red(` - ${e}`));
    }
  } else {
    console.log(chalk.green("\n All steps executed successfully!"));
  }
  executor.clearStaging();
}
