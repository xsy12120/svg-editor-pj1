import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { MoveShapeCommand } from "./MoveShapeCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class MoveCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "move";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 3) {
      throw new Error("usage: move <id> <dx> <dy>");
    }

    const [id, dx, dy] = args;
    return new MoveShapeCommand(
      this.requireValue(id, "shape id"),
      Number(this.requireValue(dx, "dx")),
      Number(this.requireValue(dy, "dy"))
    );
  }

  private requireValue(value: string | undefined, name: string): string {
    if (value === undefined) {
      throw new Error(`${name} is required`);
    }
    return value;
  }
}
