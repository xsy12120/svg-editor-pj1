import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { ScaleShapeCommand } from "./ScaleShapeCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class ScaleCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "scale";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 2) {
      throw new Error("usage: scale <id> <factor>");
    }

    const [id, factor] = args;
    if (id === undefined || factor === undefined) {
      throw new Error("scale id and factor are required");
    }

    return new ScaleShapeCommand(id, Number(factor));
  }
}
