import type { EditorSession } from "../EditorSession.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { ScaleShapeEdit } from "./ScaleShapeEdit.js";
import { requireShape } from "./ShapeCommandSupport.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class ScaleShapeCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly id: string,
    private readonly factor: number
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    if (!Number.isFinite(this.factor) || this.factor <= 0) {
      throw new Error("scale factor must be positive");
    }

    return new ScaleShapeEdit(requireShape(session, this.id), this.factor);
  }
}
