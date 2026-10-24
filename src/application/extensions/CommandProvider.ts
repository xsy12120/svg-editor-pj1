import type { ExecutableCommand } from "../commands/ExecutableCommand.js";

export interface CommandProvider<TContext> {
  readonly name: string;
  create(args: readonly string[]): ExecutableCommand<TContext>;
}
