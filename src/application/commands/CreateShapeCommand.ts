import type { EditorSession } from "../EditorSession.js";
import type { ShapeFactory } from "../shapes/ShapeFactory.js";
import { CreateShapeEdit } from "./CreateShapeEdit.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class CreateShapeCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly shapeFactory: ShapeFactory,
    private readonly typeName: string,
    private readonly args: readonly string[]
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    const shape = this.shapeFactory.createFromCliArgs(this.typeName, this.args);
    if (document.hasShape(shape.id)) {
      throw new Error(`id already exists: ${shape.id}`);
    }

    return new CreateShapeEdit(this.typeName, shape);
  }
}
