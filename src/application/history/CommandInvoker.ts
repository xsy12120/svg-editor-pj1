import type { CommandResult } from "../commands/CommandResult.js";
import type { PreparedEdit } from "../commands/PreparedEdit.js";
import type { UndoableCommand } from "../commands/UndoableCommand.js";

export class CommandInvoker<TContext> {
  private readonly undoStack: PreparedEdit<TContext>[] = [];
  private readonly redoStack: PreparedEdit<TContext>[] = [];
  private historyBlocked = false;

  constructor(private readonly context: TContext) {}

  execute(command: UndoableCommand<TContext>): CommandResult {
    const edit = command.prepare(this.context);
    const result = edit.apply(this.context);
    if (!result.success) {
      return result;
    }

    this.historyBlocked = false;
    this.undoStack.push(edit);
    this.redoStack.length = 0;
    return result;
  }

  undo(): CommandResult {
    this.ensureHistoryAvailable("undo");

    const edit = this.undoStack.at(-1);
    if (edit === undefined) {
      throw new Error("nothing to undo");
    }

    const result = edit.revert(this.context);
    if (!result.success) {
      return result;
    }

    this.undoStack.pop();
    this.redoStack.push(edit);
    return result;
  }

  redo(): CommandResult {
    this.ensureHistoryAvailable("redo");

    const edit = this.redoStack.at(-1);
    if (edit === undefined) {
      throw new Error("nothing to redo");
    }

    const result = edit.apply(this.context);
    if (!result.success) {
      return result;
    }

    this.redoStack.pop();
    this.undoStack.push(edit);
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
