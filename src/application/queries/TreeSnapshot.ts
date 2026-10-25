import type { ShapeAttribute } from "../../domain/shapes/ShapeDescriptor.js";

export interface TreeSnapshotNode {
  readonly id: string;
  readonly typeName: string;
  readonly attributes: readonly ShapeAttribute[];
  readonly children: readonly TreeSnapshotNode[];
}

export interface TreeSnapshot {
  readonly width: number;
  readonly height: number;
  readonly root: TreeSnapshotNode | null;
  readonly roots: readonly TreeSnapshotNode[];
}
