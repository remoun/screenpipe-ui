import { Command } from "commander";
import chalk from "chalk";
import {
  createClient,
  getContentText,
  getContentAppName,
  contentTypeLabel,
  timeAgo,
  truncate,
  highlightMatch,
  formatTable,
} from "@screenpipe-ui/core";

export const searchCommand = new Command("search")
  .description("Search screenpipe content")
  .argument("<query>", "search query")
  .option("-t, --type <type>", "content type: all, ocr, audio", "all")
  .option("-l, --limit <number>", "max results", "20")
  .option("--app <name>", "filter by app name")
  .option("--url <url>", "screenpipe server URL", process.env.SCREENPIPE_BASE_URL || "http://localhost:3030")
  .action(async (query: string, opts) => {
    const client = createClient({ baseUrl: opts.url });

    try {
      const res = await client.search({
        q: query,
        contentType: opts.type,
        limit: parseInt(opts.limit, 10),
        appName: opts.app,
      });

      if (res.data.length === 0) {
        console.log(chalk.yellow("No results found."));
        return;
      }

      console.log(
        chalk.dim(`${res.pagination.total} results (showing ${res.data.length})\n`)
      );

      const rows = res.data.map((item) => [
        chalk.cyan(contentTypeLabel(item)),
        chalk.dim(timeAgo(item.content.timestamp)),
        chalk.blue(truncate(getContentAppName(item), 15)),
        highlightMatch(truncate(getContentText(item), 60), query),
      ]);

      console.log(
        formatTable(
          [
            { header: "Type", width: 8 },
            { header: "When", width: 10 },
            { header: "App", width: 15 },
            { header: "Content", width: 60 },
          ],
          rows
        )
      );
    } catch (e) {
      console.error(chalk.red(`Error: ${e instanceof Error ? e.message : e}`));
      process.exit(1);
    }
  });
