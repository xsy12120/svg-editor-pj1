import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { ShapeFactory } from "../shapes/ShapeFactory.js";
import { CreateShapeCommand } from "./CreateShapeCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class CreateCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "create";
  readonly usage = "create <type> <id> [params...] [in <containerId>]";

  constructor(private readonly shapeFactory: ShapeFactory) {}

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    const [typeName, ...shapeArgs] = args;
    if (typeName === undefined) {
      throw new Error("usage: create <type> <id> [params...]");
    }

    return new CreateShapeCommand(this.shapeFactory, typeName, shapeArgs);
  }
}
