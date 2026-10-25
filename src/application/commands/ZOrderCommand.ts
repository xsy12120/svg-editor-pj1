import type { EditorSession } from "../EditorSession.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import type { UndoableCommand } from "./UndoableCommand.js";
import {
  ZOrderEdit,
  type ZOrderDirection
} from "./ZOrderEdit.js";

export class ZOrderCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly shapeId: string,
    private readonly direction: ZOrderDirection
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const document = requireDocument(session);
    const shape = document.findShape(this.shapeId);
    const placement = document.findPlacement(this.shapeId);
    if (shape === undefined || placement === undefined) {
      throw new Error(`no such shape: ${this.shapeId}`);
    }

    return new ZOrderEdit(shape, placement, this.direction);
  }
}
