import type { CommandResult } from "../commands/CommandResult.js";
import type { UndoableCommand } from "../commands/UndoableCommand.js";

export class CommandInvoker<TContext> {
  private readonly undoStack: UndoableCommand<TContext>[] = [];
  private readonly redoStack: UndoableCommand<TContext>[] = [];
  private historyBlocked = false;

  constructor(private readonly context: TContext) {}

  execute(command: UndoableCommand<TContext>): CommandResult {
    command.validate(this.context);
    const result = command.execute(this.context);
    if (!result.success) {
      return result;
    }

    this.historyBlocked = false;
    this.undoStack.push(command);
    this.redoStack.length = 0;
    return result;
  }

  undo(): CommandResult {
    this.ensureHistoryAvailable("undo");

    const command = this.undoStack.pop();
    if (command === undefined) {
      throw new Error("nothing to undo");
    }

    const result = command.undo(this.context);
    if (result.success) {
      this.redoStack.push(command);
    } else {
      this.undoStack.push(command);
    }
    return result;
  }

  redo(): CommandResult {
    this.ensureHistoryAvailable("redo");

    const command = this.redoStack.pop();
    if (command === undefined) {
      throw new Error("nothing to redo");
    }

    const result = command.execute(this.context);
    if (result.success) {
      this.undoStack.push(command);
    } else {
      this.redoStack.push(command);
    }
    return result;
  }

  resetAfterDocumentCommand(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.historyBlocked = true;
  }

  private ensureHistoryAvailable(operation: "undo" | "redo"): void {
    if (this.historyBlocked) {
      throw new Error(`${operation} not allowed after io command`);
    }
  }
}
