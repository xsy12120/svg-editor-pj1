import type { EditorSession } from "../EditorSession.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { DeleteShapeEdit } from "./DeleteShapeEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class DeleteShapeCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(private readonly id: string) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const document = requireDocument(session);
    const shape = document.findShape(this.id);
    const placement = document.findPlacement(this.id);
    if (shape === undefined || placement === undefined) {
      throw new Error(`no such shape: ${this.id}`);
    }

    return new DeleteShapeEdit(shape, placement);
  }
}
