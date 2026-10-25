import type { EditorSession } from "../EditorSession.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { SetAttributeEdit } from "./SetAttributeEdit.js";
import { requireShape } from "./ShapeCommandSupport.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class SetAttributeCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly value: string
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const shape = requireShape(session, this.id);
    const previousValue = shape.getAttribute(this.name);
    return new SetAttributeEdit(
      shape,
      this.name,
      this.value,
      previousValue
    );
  }
}
