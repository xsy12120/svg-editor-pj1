import type { EditorSession } from "../EditorSession.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import { GroupEdit } from "./GroupEdit.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class GroupCommand implements UndoableCommand<EditorSession> {
  readonly kind = "edit";

  constructor(
    private readonly groupId: string,
    private readonly memberIds: readonly string[]
  ) {}

  prepare(session: EditorSession): PreparedEdit<EditorSession> {
    const document = requireDocument(session);
    if (document.hasShape(this.groupId)) {
      throw new Error(`id already exists: ${this.groupId}`);
    }
    if (this.memberIds.length === 0) {
      throw new Error("group requires at least one shape");
    }

    const uniqueIds = new Set(this.memberIds);
    if (uniqueIds.size !== this.memberIds.length) {
      throw new Error("group cannot include the same shape twice");
    }

    const members = this.memberIds.map((id) => {
      const shape = document.findShape(id);
      const placement = document.findPlacement(id);
      if (shape === undefined || placement === undefined) {
        throw new Error(`no such shape: ${id}`);
      }
      return { shape, placement };
    });

    this.assertNoAncestorDescendantPair(members.map(({ shape }) => shape));
    return new GroupEdit(this.groupId, members);
  }

  private assertNoAncestorDescendantPair(members: readonly Shape[]): void {
    for (const member of members) {
      if (!(member instanceof ContainerShape)) {
        continue;
      }
      for (const other of members) {
        if (member !== other && member.contains(other)) {
          throw new Error(
            `cannot group a container into its own descendant: ${member.id}`
          );
        }
      }
    }
  }
}
