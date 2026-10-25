import type { EditorSession } from "../EditorSession.js";
import type { CommandInvoker } from "../history/CommandInvoker.js";
import type { CommandResult } from "./CommandResult.js";
import type { ControlCommand } from "./ExecutableCommand.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export class RedoCommand implements ControlCommand<EditorSession> {
  readonly kind = "control";

  constructor(private readonly invoker: CommandInvoker<EditorSession>) {}

  validate(session: EditorSession): void {
    requireDocument(session);
  }

  execute(): CommandResult {
    return this.invoker.redo();
  }
}
