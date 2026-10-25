import type { EditorSession } from "../EditorSession.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import { AddToEdit } from "./AddToEdit.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class AddToCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly targetId: string,
    private readonly shapeId: string
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const document = requireDocument(session);
    const target = document.findShape(this.targetId);
    if (target === undefined) {
      throw new Error(`no such container: ${this.targetId}`);
    }
    if (!(target instanceof ContainerShape)) {
      throw new Error(`not a container: ${this.targetId}`);
    }

    const shape = document.findShape(this.shapeId);
    const placement = document.findPlacement(this.shapeId);
    if (shape === undefined || placement === undefined) {
      throw new Error(`no such shape: ${this.shapeId}`);
    }
    if (
      shape === target ||
      (shape instanceof ContainerShape &&
        (shape === target || shape.contains(target)))
    ) {
      throw new Error(
        `cannot group a container into its own descendant: ${shape.id}`
      );
    }

    return new AddToEdit(target, shape, placement);
  }
}
