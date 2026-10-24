import type { CommandResult } from "./CommandResult.js";
import type { Command } from "./Command.js";

export interface UndoableCommand<TContext> extends Command<TContext> {
  readonly kind: "edit";
  undo(context: TContext): CommandResult;
}
