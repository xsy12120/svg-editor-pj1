import type { EditorSession } from "../EditorSession.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireShape } from "./ShapeCommandSupport.js";
import { MoveShapeEdit } from "./MoveShapeEdit.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class MoveShapeCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly id: string,
    private readonly dx: number,
    private readonly dy: number
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    if (!Number.isFinite(this.dx) || !Number.isFinite(this.dy)) {
      throw new Error("move delta must be finite");
    }

    return new MoveShapeEdit(requireShape(session, this.id), this.dx, this.dy);
  }
}
