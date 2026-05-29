import chalk from "chalk";
import { select, isCancel } from "@clack/prompts";
import { runAgentMode } from "./agent/orchestrator";

export async function runcliMode() {
  while (true) {
    const node = await select({
      message: "Choose cli sub-node",
      options: [
        { value: "agent", label: "Agent Mode" },
        { value: "plan", label: "Plan Mode" },
        { value: "ask", label: "Ask Mode" },
        { value: "back", label: "<- Back to main menu" },
      ],
    });

    if (isCancel(node) || node === "back") return;

    if (node === "agent") {
      await runAgentMode();
    } else if (node === "ask") {
      console.log("ask");
    } else if (node === "plan") {
      console.log("plan");
    }

    if (node !== "agent" && node !== "plan" && node !== "ask") {
      console.log(chalk.yellow("\nThat mode is not implemented yet.\n"));
    }
  }
}
