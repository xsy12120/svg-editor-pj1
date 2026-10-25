import type { ShapeAttribute } from "../../domain/shapes/ShapeDescriptor.js";

export interface TreeSnapshotNode {
  readonly id: string;
  readonly typeName: string;
  readonly attributes: readonly ShapeAttribute[];
  readonly children: readonly TreeSnapshotNode[];
}

interface TreeSnapshotBase {
  readonly width: number;
  readonly height: number;
}

export interface FullTreeSnapshot extends TreeSnapshotBase {
  readonly root: null;
  readonly roots: readonly TreeSnapshotNode[];
}

export interface ScopedTreeSnapshot extends TreeSnapshotBase {
  readonly root: TreeSnapshotNode;
  readonly roots: readonly [];
}

export type TreeSnapshot = FullTreeSnapshot | ScopedTreeSnapshot;
