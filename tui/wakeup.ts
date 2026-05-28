import { select, isCancel } from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import { config } from "../config/conf";

const BANNER_FONT = "ANSI Shadow";
const SHADOW = chalk.hex("#5b4d9e");
const FACE = chalk.hex("#f0e6d2").bold;

function printBannerWithShadow(ascii: string) {
  const bannerLines = ascii.replace(/\s+$/, "").split("\n");
  const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
  const rowWidth = maxLen + 2;

  for (const line of bannerLines) {
    console.log(SHADOW(("  " + line).padEnd(rowWidth)));
  }
  process.stdout.write(`\x1b[${bannerLines.length}A`);
  for (const line of bannerLines) {
    console.log(FACE(line.padEnd(rowWidth)));
  }
  console.log();
}

export async function runwakeup() {
  let ascii: string;
  try {
    ascii = figlet.textSync("Mr.Jack", { font: BANNER_FONT });
  } catch (error) {
    ascii = figlet.textSync("Mr.Jack", { font: "standard" });
  }
  printBannerWithShadow(ascii);

  const node = await select({
    message: "Which mode you want proceed with ?",
    options: [
      {
        value: "cli",
        label: "CLI",
        hint: "The CLI mode is the most basic and straightforward way to interact with the assistant. It allows you to type commands directly into the terminal and receive immediate responses. This mode is ideal for users who prefer a simple and efficient interface without any distractions.",
        disabled: config.features.cli
      },
      {
        value: "telegram",
        label: "Telegram",
        hint: "Telegram bot is currently in development and will be available soon.",
        disabled: config.features.telegramBot
      },
    ],
  });

  if (isCancel(node)) {
    console.log(chalk.red("Operation cancelled."));
    process.exit(0);
  }

  if (node === "cli") {
    console.log(
      chalk.green("You have selected CLI mode. Starting the assistant..."),
    );
  } else if (node === "telegram") {
    console.log(
      chalk.yellow(
        "Telegram bot is currently in development and will be available soon. Please select CLI mode for now.",
      ),
    );
  }
}
