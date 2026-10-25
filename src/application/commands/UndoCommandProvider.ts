import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { CommandInvoker } from "../history/CommandInvoker.js";
import type { ControlCommand } from "./ExecutableCommand.js";
import { UndoCommand } from "./UndoCommand.js";

export class UndoCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "undo";
  readonly usage = "undo";

  constructor(private readonly invoker: CommandInvoker<EditorSession>) {}

  create(args: readonly string[]): ControlCommand<EditorSession> {
    if (args.length > 0) {
      throw new Error("usage: undo");
    }

    return new UndoCommand(this.invoker);
  }
}
