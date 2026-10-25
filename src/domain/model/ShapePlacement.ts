import type { ContainerShape } from "../shapes/ContainerShape.js";

export interface ShapePlacement {
  readonly parent: ContainerShape | null;
  readonly index: number;
}
