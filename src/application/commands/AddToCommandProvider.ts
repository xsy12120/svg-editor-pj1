import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { AddToCommand } from "./AddToCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class AddToCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "addto";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 2 || args[0] === undefined || args[1] === undefined) {
      throw new Error("usage: addto <groupId> <shapeId>");
    }

    return new AddToCommand(args[0], args[1]);
  }
}
