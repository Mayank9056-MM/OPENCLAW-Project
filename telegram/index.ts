import { Telegraf } from "telegraf";
import chalk from "chalk";
import { config } from "../config/conf";
import { WELCOME } from "./constant";
import { registerHandlers } from "./handlers";

export async function runTelegramMode() {
  const token = config.TELEGRAM_BOT_TOKEN;
  const ownerId = config.TELEGRAM_OWNER_ID;

  const bot = new Telegraf(token);
  registerHandlers(bot)

  await bot.telegram.sendMessage(ownerId, WELCOME, { parse_mode: "Markdown" });
  console.log(chalk.green("Sent welcome message to Telegram. \n"));

  bot.launch();
  console.log(chalk.green("Telegram bot is running. Press ctrl+C to stop.\n"));

  await new Promise<void>((resolve) => {
    const stop = () => {
      bot.stop("SIGINT");
      resolve();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });
}
