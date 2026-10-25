import type { EditorSession } from "../EditorSession.js";
import type { ShapePlacement } from "../../domain/model/ShapePlacement.js";
import { Group } from "../../domain/shapes/Group.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export class UngroupEdit implements PreparedEdit<EditorSession> {
  constructor(
    private readonly groupId: string,
    private readonly placement: ShapePlacement,
    private readonly children: readonly Shape[]
  ) {}

  apply(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    const group = document.findShape(this.groupId);
    if (!(group instanceof Group)) {
      throw new Error(`no such shape: ${this.groupId}`);
    }

    document.detachShape(this.groupId);
    this.children.forEach((child, index) => {
      document.insertShapeAt(
        child,
        this.placement.parent,
        this.placement.index + index
      );
    });

    return {
      success: true,
      message: `g#${this.groupId} ungrouped`,
      affectedIds: [this.groupId, ...this.children.map((child) => child.id)]
    };
  }

  revert(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    const group = new Group(this.groupId);

    for (const child of this.children) {
      document.detachShape(child.id);
      group.addChild(child);
    }
    document.insertShapeAt(
      group,
      this.placement.parent,
      this.placement.index
    );

    return {
      success: true,
      message: `g#${this.groupId} restored`,
      affectedIds: [this.groupId, ...this.children.map((child) => child.id)]
    };
  }
}
