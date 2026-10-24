import type { Shape } from "../../domain/shapes/Shape.js";
import type { ShapeInit } from "./ShapeInit.js";

export interface ShapeProvider {
  readonly typeName: string;
  createFromCliArgs(args: readonly string[]): ShapeInit;
  create(init: ShapeInit): Shape;
}
