export function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      [
        `Missing required environment variable: ${name}.`,
        "",
        "  Add the missing value to the root `.env` file,",
        "  run `pnpm channel:setup` to configure Slack or Teams,",
        "  or `pnpm dev:web` to try the browser template instead.",
      ].join("\n"),
    );
  }
  return value;
}
