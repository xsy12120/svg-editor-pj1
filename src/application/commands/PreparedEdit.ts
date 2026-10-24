import type { CommandResult } from "./CommandResult.js";

export interface PreparedEdit<TContext> {
  apply(context: TContext): CommandResult;
  revert(context: TContext): CommandResult;
}
