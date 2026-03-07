import { Command } from "commander";
import chalk from "chalk";
import { createClient } from "@screenpipe-ui/core";

export const healthCommand = new Command("health")
  .description("Check screenpipe server health")
  .option("--url <url>", "screenpipe server URL", "http://localhost:3030")
  .action(async (opts) => {
    const client = createClient({ baseUrl: opts.url });

    try {
      const health = await client.health();
      const statusColor =
        health.status === "healthy"
          ? chalk.green
          : health.status === "degraded"
            ? chalk.yellow
            : chalk.red;

      console.log(statusColor(`● Screenpipe is ${health.status}`));
      console.log(chalk.dim(`  Status:  ${health.status}`));
      console.log(chalk.dim(`  Frames:  ${health.frame_status}`));
      console.log(chalk.dim(`  Audio:   ${health.audio_status}`));
      if (health.last_frame_timestamp) {
        console.log(chalk.dim(`  Last frame: ${health.last_frame_timestamp}`));
      }
      if (health.last_audio_timestamp) {
        console.log(chalk.dim(`  Last audio: ${health.last_audio_timestamp}`));
      }
      console.log(chalk.dim(`  Message: ${health.message}`));
    } catch (e) {
      console.error(chalk.red(`Cannot reach screenpipe at ${opts.url}`));
      console.error(chalk.dim(e instanceof Error ? e.message : String(e)));
      process.exit(1);
    }
  });
