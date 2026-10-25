import type { ShapeAttribute } from "../../domain/shapes/ShapeDescriptor.js";

export interface ShapeReference {
  readonly id: string;
  readonly typeName: string;
}

export interface ShapeDetailsSnapshot {
  readonly id: string;
  readonly typeName: string;
  readonly parent: ShapeReference | null;
  readonly attributes: readonly ShapeAttribute[];
}
