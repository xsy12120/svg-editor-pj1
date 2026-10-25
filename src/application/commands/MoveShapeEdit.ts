import type { EditorSession } from "../EditorSession.js";
import type { GeometryState } from "../../domain/shapes/GeometryState.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { ShapeFeedback } from "./ShapeFeedback.js";

export class MoveShapeEdit implements PreparedEdit<EditorSession> {
  private readonly originalGeometry: GeometryState;

  constructor(
    private readonly shape: Shape,
    private readonly dx: number,
    private readonly dy: number
  ) {
    this.originalGeometry = shape.captureGeometryState();
  }

  apply(): CommandResult {
    this.shape.move(this.dx, this.dy);
    return {
      success: true,
      message: ShapeFeedback.moved(this.shape, this.dx, this.dy),
      affectedIds: [this.shape.id]
    };
  }

  revert(): CommandResult {
    this.originalGeometry.restore();
    return {
      success: true,
      message: ShapeFeedback.movedBack(this.shape, this.dx, this.dy),
      affectedIds: [this.shape.id]
    };
  }
}
