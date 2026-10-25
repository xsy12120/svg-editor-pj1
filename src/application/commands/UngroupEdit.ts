import type { EditorSession } from "../EditorSession.js";
import type { ShapePlacement } from "../../domain/model/ShapePlacement.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import { ShapeFeedback } from "./ShapeFeedback.js";

export class UngroupEdit implements PreparedEdit<EditorSession> {
  private activeContainer: ContainerShape | null = null;

  constructor(
    private readonly groupId: string,
    private readonly placement: ShapePlacement,
    private readonly children: readonly Shape[]
  ) {}

  apply(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    const container = document.findShape(this.groupId);
    if (!(container instanceof ContainerShape)) {
      throw new Error(`no such shape: ${this.groupId}`);
    }

    document.detachShape(this.groupId);
    this.activeContainer = container;
    this.children.forEach((child, index) => {
      document.insertShapeAt(
        child,
        this.placement.parent,
        this.placement.index + index
      );
    });

    return {
      success: true,
      message: ShapeFeedback.ungrouped(container),
      affectedIds: [this.groupId, ...this.children.map((child) => child.id)]
    };
  }

  revert(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    if (this.activeContainer === null) {
      throw new Error("ungroup edit has not been applied");
    }
    const container = this.activeContainer;

    for (const child of this.children) {
      document.detachShape(child.id);
    }
    document.insertShapeAt(
      container,
      this.placement.parent,
      this.placement.index
    );
    this.activeContainer = null;

    return {
      success: true,
      message: ShapeFeedback.restored(container),
      affectedIds: [this.groupId, ...this.children.map((child) => child.id)]
    };
  }
}
