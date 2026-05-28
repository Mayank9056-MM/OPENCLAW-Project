#!/usr/bin/env bun

import { Command } from "commander";
import { runwakeup } from "./tui/wakeup";

const program = new Command();

program
  .name("Mr.Jack")
  .description(
    "A CLI tool to help you solve your problems , personal assistant",
  )
  .version("1.0.0");

program
  .command("wakeup")
  .description("Wake up the assistant")
  .action(async () => {
    await runwakeup();
  });

await program.parseAsync(program.args);
