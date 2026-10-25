import type { ShapeDetailsSnapshot } from "../queries/ShapeDetailsSnapshot.js";

export interface ShapeDetailsRenderer {
  render(snapshot: ShapeDetailsSnapshot): string;
}
