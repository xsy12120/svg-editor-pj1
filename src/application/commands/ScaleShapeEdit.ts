import type { EditorSession } from "../EditorSession.js";
import type { GeometryState } from "../../domain/shapes/GeometryState.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";

export class ScaleShapeEdit implements PreparedEdit<EditorSession> {
  private readonly originalGeometry: GeometryState;

  constructor(
    private readonly shape: Shape,
    private readonly factor: number
  ) {
    this.originalGeometry = shape.captureGeometryState();
  }

  apply(): CommandResult {
    this.shape.scale(this.factor);
    return {
      success: true,
      message: `${this.shape.id} scaled by ${this.factor}`,
      affectedIds: [this.shape.id]
    };
  }

  revert(): CommandResult {
    this.originalGeometry.restore();
    return {
      success: true,
      message: `${this.shape.id} scale reverted`,
      affectedIds: [this.shape.id]
    };
  }
}
