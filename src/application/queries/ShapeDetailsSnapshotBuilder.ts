import type { Shape } from "../../domain/shapes/Shape.js";
import type { ShapeDetailsSnapshot } from "./ShapeDetailsSnapshot.js";

export class ShapeDetailsSnapshotBuilder {
  build(shape: Shape, parent: Shape | null): ShapeDetailsSnapshot {
    const descriptor = shape.toDescriptor();
    const parentDescriptor = parent?.toDescriptor();

    return {
      id: descriptor.id,
      typeName: descriptor.typeName,
      parent:
        parentDescriptor === undefined
          ? null
          : {
              id: parentDescriptor.id,
              typeName: parentDescriptor.typeName
            },
      attributes: descriptor.attributes
    };
  }
}
