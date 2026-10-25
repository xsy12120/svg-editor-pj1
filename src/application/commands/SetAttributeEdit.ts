import type { EditorSession } from "../EditorSession.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";
import { ShapeFeedback } from "./ShapeFeedback.js";

export class SetAttributeEdit implements PreparedEdit<EditorSession> {
  constructor(
    private readonly shape: Shape,
    private readonly name: string,
    private readonly value: string,
    private readonly previousValue: string | undefined
  ) {}

  apply(): CommandResult {
    this.shape.setAttribute(this.name, this.value);
    return {
      success: true,
      message: ShapeFeedback.attributeUpdated(
        this.shape,
        this.name,
        this.value
      ),
      affectedIds: [this.shape.id]
    };
  }

  revert(): CommandResult {
    this.shape.setAttribute(this.name, this.previousValue);
    return {
      success: true,
      message: ShapeFeedback.attributeUpdated(
        this.shape,
        this.name,
        this.previousValue
      ),
      affectedIds: [this.shape.id]
    };
  }
}
