import type { EditorSession } from "../EditorSession.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import type { CommandResult } from "./CommandResult.js";
import type { PreparedEdit } from "./PreparedEdit.js";

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
      message: `${this.shape.id} ${this.name} set to ${this.value}`,
      affectedIds: [this.shape.id]
    };
  }

  revert(): CommandResult {
    this.shape.setAttribute(this.name, this.previousValue);
    return {
      success: true,
      message: `${this.shape.id} ${this.name} restored`,
      affectedIds: [this.shape.id]
    };
  }
}
