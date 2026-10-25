import type { Group } from "../shapes/Group.js";

export interface ShapePlacement {
  readonly parent: Group | null;
  readonly index: number;
}
