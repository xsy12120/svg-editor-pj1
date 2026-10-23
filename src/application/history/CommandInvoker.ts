import type { CommandResult } from "../commands/CommandResult.js";
import type { UndoableCommand } from "../commands/UndoableCommand.js";

export class CommandInvoker<TContext> {
  constructor(private readonly context: TContext) {}

  execute(_command: UndoableCommand<TContext>): CommandResult {
    throw new Error("CommandInvoker.execute is not implemented");
  }

  undo(): CommandResult {
    throw new Error("CommandInvoker.undo is not implemented");
  }

  redo(): CommandResult {
    throw new Error("CommandInvoker.redo is not implemented");
  }
}
