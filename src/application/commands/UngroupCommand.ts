import type { EditorSession } from "../EditorSession.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import { UngroupEdit } from "./UngroupEdit.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class UngroupCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(private readonly groupId: string) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const document = requireDocument(session);
    const group = document.findShape(this.groupId);
    if (!(group instanceof ContainerShape)) {
      throw new Error(`no such shape: ${this.groupId}`);
    }
    if (!group.canUngroup) {
      throw new Error(`cannot ungroup composite shape: ${this.groupId}`);
    }

    const placement = document.findPlacement(this.groupId);
    if (placement === undefined) {
      throw new Error(`no such shape: ${this.groupId}`);
    }
    if (placement.parent === null) {
      throw new Error(
        `cannot ungroup top-level container: ${this.groupId}`
      );
    }

    return new UngroupEdit(
      this.groupId,
      placement,
      [...group.children]
    );
  }
}
