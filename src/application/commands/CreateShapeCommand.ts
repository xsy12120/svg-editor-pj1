import type { EditorSession } from "../EditorSession.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { ShapeFactory } from "../shapes/ShapeFactory.js";
import type { CommandResult } from "./CommandResult.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class CreateShapeCommand implements UndoableCommand<EditorSession> {
  private createdShape: Shape | null = null;

  constructor(
    private readonly shapeFactory: ShapeFactory,
    private readonly typeName: string,
    private readonly args: readonly string[]
  ) {}

  validate(session: EditorSession): void {
    const document = session.document;
    if (document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    const shape = this.shapeFactory.create(this.typeName, this.args);
    if (document.hasShape(shape.id)) {
      throw new Error(`id already exists: ${shape.id}`);
    }

    this.createdShape = shape;
  }

  execute(session: EditorSession): CommandResult {
    const document = session.document;
    if (document === null || this.createdShape === null) {
      throw new Error("create command was not validated");
    }

    document.addShape(this.createdShape);

    return {
      success: true,
      message: `${this.typeName}#${this.createdShape.id} created`,
      affectedIds: [this.createdShape.id]
    };
  }

  undo(session: EditorSession): CommandResult {
    const document = session.document;
    if (document === null || this.createdShape === null) {
      throw new Error("create command has no executed shape to undo");
    }

    document.removeShape(this.createdShape.id);

    return {
      success: true,
      message: `${this.typeName}#${this.createdShape.id} deleted`,
      affectedIds: [this.createdShape.id]
    };
  }
}
