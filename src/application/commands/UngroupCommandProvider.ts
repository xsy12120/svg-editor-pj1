import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { UngroupCommand } from "./UngroupCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class UngroupCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "ungroup";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 1 || args[0] === undefined) {
      throw new Error("usage: ungroup <groupId>");
    }

    return new UngroupCommand(args[0]);
  }
}
