import type { CommandResult } from "./CommandResult.js";
import type { Command } from "./Command.js";

export interface UndoableCommand<TContext> extends Command<TContext> {
  undo(context: TContext): CommandResult;
}
