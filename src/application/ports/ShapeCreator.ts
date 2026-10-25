import type { Shape } from "../../domain/shapes/Shape.js";
import type { ShapeInit } from "../shapes/ShapeInit.js";

export interface ShapeCreator {
  create(init: ShapeInit): Shape;
}
