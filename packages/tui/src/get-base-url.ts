const DEFAULT = "http://localhost:3030";

export function getBaseUrl(
  argv: string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env
): string {
  const idx = argv.indexOf("--url");
  if (idx !== -1 && argv[idx + 1]) return argv[idx + 1];
  return env.SCREENPIPE_BASE_URL || DEFAULT;
}
