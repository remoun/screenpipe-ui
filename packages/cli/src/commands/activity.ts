import { Command } from "commander";
import chalk from "chalk";
import {
  createClient,
  getContentAppName,
  todayRange,
  formatTime,
  formatTable,
} from "@screenpipe-ui/core";

export const activityCommand = new Command("activity")
  .description("Show recent activity summary")
  .option("--today", "show today's activity only", false)
  .option("--app <name>", "filter by app name")
  .option("-l, --limit <number>", "max results", "50")
  .option("--url <url>", "screenpipe server URL", process.env.SCREENPIPE_BASE_URL || "http://localhost:3030")
  .action(async (opts) => {
    const client = createClient({ baseUrl: opts.url });

    try {
      const timeRange = opts.today ? todayRange() : {};

      const res = await client.search({
        ...timeRange,
        appName: opts.app,
        limit: parseInt(opts.limit, 10),
        contentType: "all",
      });

      if (res.data.length === 0) {
        console.log(chalk.yellow("No activity found."));
        return;
      }

      // Group by app
      const byApp = new Map<string, number>();
      for (const item of res.data) {
        const app = getContentAppName(item);
        byApp.set(app, (byApp.get(app) ?? 0) + 1);
      }

      console.log(chalk.bold(`Activity Summary (${res.data.length} events)\n`));

      // App breakdown
      const sortedApps = [...byApp.entries()].sort((a, b) => b[1] - a[1]);
      const rows = sortedApps.map(([app, count]) => [
        chalk.blue(app),
        String(count),
        "█".repeat(Math.min(40, Math.ceil((count / res.data.length) * 40))),
      ]);

      console.log(
        formatTable(
          [
            { header: "App", width: 20 },
            { header: "Events", width: 8, align: "right" },
            { header: "Distribution", width: 40 },
          ],
          rows
        )
      );

      // Time range
      const timestamps = res.data.map((i) => new Date(i.content.timestamp).getTime());
      const earliest = new Date(Math.min(...timestamps)).toISOString();
      const latest = new Date(Math.max(...timestamps)).toISOString();
      console.log(chalk.dim(`\nTime range: ${formatTime(earliest)} - ${formatTime(latest)}`));
    } catch (e) {
      console.error(chalk.red(`Error: ${e instanceof Error ? e.message : e}`));
      process.exit(1);
    }
  });
