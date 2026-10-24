import type { Rect } from "./Rect.js";

export interface ShapeVisitor<TResult> {
  visitRect(shape: Rect): TResult;
}
