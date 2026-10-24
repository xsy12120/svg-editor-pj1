import type { CommandResult } from "./CommandResult.js";

export interface Command<TContext> {
  validate(context: TContext): void;
  execute(context: TContext): CommandResult;
}
