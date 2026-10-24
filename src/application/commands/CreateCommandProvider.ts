import type { EditorSession } from "../EditorSession.js";
import type { Command } from "./Command.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { ShapeFactory } from "../shapes/ShapeFactory.js";
import { CreateShapeCommand } from "./CreateShapeCommand.js";

export class CreateCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "create";

  constructor(private readonly shapeFactory: ShapeFactory) {}

  create(args: readonly string[]): Command<EditorSession> {
    const [typeName, ...shapeArgs] = args;
    if (typeName === undefined) {
      throw new Error("usage: create <type> <id> [params...]");
    }

    return new CreateShapeCommand(this.shapeFactory, typeName, shapeArgs);
  }
}
