import type { ShapeDetailsSnapshot } from "./ShapeDetailsSnapshot.js";
import type { TreeSnapshot } from "./TreeSnapshot.js";

export type CommandView =
  | {
      readonly kind: "tree";
      readonly snapshot: TreeSnapshot;
    }
  | {
      readonly kind: "shape-details";
      readonly snapshot: ShapeDetailsSnapshot;
    };
