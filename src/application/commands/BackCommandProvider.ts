import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { UndoableCommand } from "./UndoableCommand.js";
import { ZOrderCommand } from "./ZOrderCommand.js";

export class BackCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "back";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 1 || args[0] === undefined) {
      throw new Error("usage: back <shapeId>");
    }

    return new ZOrderCommand(args[0], "back");
  }
}
