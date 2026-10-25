import type { EditorSession } from "../EditorSession.js";
import type { ShapePlacement } from "../../domain/model/ShapePlacement.js";
import { Group } from "../../domain/shapes/Group.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import { ShapeFeedback } from "./ShapeFeedback.js";

interface PlacedShape {
  readonly shape: Shape;
  readonly placement: ShapePlacement;
}

export class GroupEdit implements PreparedEdit<EditorSession> {
  private activeGroup: Group | null = null;

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
    this.activeGroup = group;

    return {
      success: true,
      message: ShapeFeedback.grouped(group, this.members.length),
      affectedIds: [group.id, ...this.members.map(({ shape }) => shape.id)]
    };
  }

  revert(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    if (this.activeGroup === null) {
      throw new Error("group edit has not been applied");
    }

    const group = this.activeGroup;
    document.detachShape(group.id);
    const placements = [...this.members].sort(
      (left, right) => left.placement.index - right.placement.index
    );
    for (const { shape, placement } of placements) {
      document.insertShapeAt(shape, placement.parent, placement.index);
    }
    this.activeGroup = null;

    return {
      success: true,
      message: ShapeFeedback.ungrouped(group),
      affectedIds: this.members.map(({ shape }) => shape.id)
    };
  }
}
