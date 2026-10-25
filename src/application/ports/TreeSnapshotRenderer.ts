import type { TreeSnapshot } from "../queries/TreeSnapshot.js";

export interface TreeSnapshotRenderer {
  render(snapshot: TreeSnapshot): string;
}
