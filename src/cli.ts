import { Command } from "commander";
import { runInit } from "./commands/init.js";

const program = new Command();

program
  .name("reliable-ai-agents")
  .description("Install reliability skills into any AI coding agent.");

program
  .command("init")
  .description("Install skills into one or more agents")
  .option("-a, --agent <id...>", "agent id(s) to install into (skips the prompt)", [])
  .option("-s, --skill <id...>", "skill id(s) to install (skips the prompt)", [])
  .action(async (opts: { agent: string[]; skill: string[] }) => {
    await runInit({ cwd: process.cwd(), agents: opts.agent, skills: opts.skill });
  });

program.parseAsync().catch((err) => {
  console.error(err);
  process.exit(1);
});
