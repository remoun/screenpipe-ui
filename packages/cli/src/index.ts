#!/usr/bin/env bun
import { Command } from "commander";
import { searchCommand } from "./commands/search.ts";
import { healthCommand } from "./commands/health.ts";
import { activityCommand } from "./commands/activity.ts";

const program = new Command();

program
  .name("screenpipe-ui")
  .description("CLI for querying screenpipe")
  .version("0.1.3");

program.addCommand(searchCommand);
program.addCommand(healthCommand);
program.addCommand(activityCommand);

program.parse();
