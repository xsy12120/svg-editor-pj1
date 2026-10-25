import type { TreeSnapshot } from "../queries/TreeSnapshot.js";

export interface DocumentTreeRenderer {
  render(snapshot: TreeSnapshot): string;
}
