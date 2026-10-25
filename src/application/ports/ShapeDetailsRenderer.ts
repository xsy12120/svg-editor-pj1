import type { Shape } from "../../domain/shapes/Shape.js";

export interface ShapeDetailsRenderer {
  render(shape: Shape, parent: Shape | null): string;
}
