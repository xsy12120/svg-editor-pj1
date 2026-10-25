import type { ExecutableCommand } from "../commands/ExecutableCommand.js";

export interface CommandProvider<TContext> {
  readonly name: string;
  readonly usage: string;
  create(args: readonly string[]): ExecutableCommand<TContext>;
}
