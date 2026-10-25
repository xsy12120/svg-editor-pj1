import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { CommandInvoker } from "../history/CommandInvoker.js";
import type { ControlCommand } from "./ExecutableCommand.js";
import { RedoCommand } from "./RedoCommand.js";

export class RedoCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "redo";
  readonly usage = "redo";

  constructor(private readonly invoker: CommandInvoker<EditorSession>) {}

  create(args: readonly string[]): ControlCommand<EditorSession> {
    if (args.length > 0) {
      throw new Error("usage: redo");
    }

    return new RedoCommand(this.invoker);
  }
}
