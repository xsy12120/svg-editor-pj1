import type { Command } from "../commands/Command.js";

export interface CommandProvider<TContext> {
  readonly name: string;
  create(args: readonly string[]): Command<TContext>;
}
