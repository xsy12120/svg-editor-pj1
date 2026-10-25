import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { UndoableCommand } from "./UndoableCommand.js";
import { ZOrderCommand } from "./ZOrderCommand.js";

export class FrontCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "front";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 1 || args[0] === undefined) {
      throw new Error("usage: front <shapeId>");
    }

    return new ZOrderCommand(args[0], "front");
  }
}
