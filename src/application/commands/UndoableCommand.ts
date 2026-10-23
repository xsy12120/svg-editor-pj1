import type { CommandResult } from "./CommandResult.js";

export interface UndoableCommand<TContext> {
  validate(context: TContext): void;
  execute(context: TContext): CommandResult;
  undo(context: TContext): CommandResult;
}
