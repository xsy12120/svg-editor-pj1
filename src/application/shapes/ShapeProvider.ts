import type { Shape } from "../../domain/shapes/Shape.js";

export interface ShapeProvider {
  readonly typeName: string;
  create(args: readonly string[]): Shape;
}
