import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { DeleteShapeCommand } from "./DeleteShapeCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class DeleteCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "delete";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 1 || args[0] === undefined) {
      throw new Error("usage: delete <id>");
    }

    return new DeleteShapeCommand(args[0]);
  }
}
