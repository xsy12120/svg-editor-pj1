import type { EditorSession } from "../EditorSession.js";
import type { ShapePlacement } from "../../domain/model/ShapePlacement.js";
import { Group } from "../../domain/shapes/Group.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";

interface PlacedShape {
  readonly shape: Shape;
  readonly placement: ShapePlacement;
}

export class GroupEdit implements PreparedEdit<EditorSession> {
  private activeGroupId: string | null = null;

  constructor(
    private readonly groupId: string,
    private readonly members: readonly PlacedShape[]
  ) {}

  apply(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    const group = new Group(this.groupId);

    for (const { shape } of this.members) {
      if (document.detachShape(shape.id) !== shape) {
        throw new Error(`no such shape: ${shape.id}`);
      }
      group.addChild(shape);
    }
    document.addShape(group);
    this.activeGroupId = group.id;

    return {
      success: true,
      message: `g#${group.id} created with ${this.members.length} children`,
      affectedIds: [group.id, ...this.members.map(({ shape }) => shape.id)]
    };
  }

  revert(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    if (this.activeGroupId === null) {
      throw new Error("group edit has not been applied");
    }

    document.detachShape(this.activeGroupId);
    const placements = [...this.members].sort(
      (left, right) => left.placement.index - right.placement.index
    );
    for (const { shape, placement } of placements) {
      document.insertShapeAt(shape, placement.parent, placement.index);
    }
    this.activeGroupId = null;

    return {
      success: true,
      message: `g#${this.groupId} ungrouped`,
      affectedIds: this.members.map(({ shape }) => shape.id)
    };
  }
}
