import type { Shape } from "../../domain/shapes/Shape.js";
import type { ZOrderDirection } from "./ZOrderEdit.js";

export class ShapeFeedback {
  static reference(shape: Shape): string {
    const descriptor = shape.toDescriptor();
    return `${descriptor.typeName}#${descriptor.id}`;
  }

  static created(shape: Shape, parent: Shape | null = null): string {
    const location =
      parent === null ? "" : ` in ${ShapeFeedback.reference(parent)}`;
    return `${ShapeFeedback.reference(shape)} created${location}`;
  }

  static deleted(shape: Shape): string {
    return `${ShapeFeedback.reference(shape)} deleted`;
  }

  static restored(shape: Shape): string {
    return `${ShapeFeedback.reference(shape)} restored`;
  }

  static restoredInto(shape: Shape, parent: Shape | null): string {
    return parent === null
      ? ShapeFeedback.restored(shape)
      : `${ShapeFeedback.reference(shape)} restored into ${ShapeFeedback.reference(parent)}`;
  }

  static moved(shape: Shape, dx: number, dy: number): string {
    const anchor = shape.anchor;
    return anchor === undefined
      ? `${ShapeFeedback.reference(shape)} moved by (${dx},${dy})`
      : `${ShapeFeedback.reference(shape)} moved to (${anchor.x},${anchor.y})`;
  }

  static movedBack(shape: Shape, dx: number, dy: number): string {
    const anchor = shape.anchor;
    return anchor === undefined
      ? `${ShapeFeedback.reference(shape)} moved back by (${-dx},${-dy})`
      : `${ShapeFeedback.reference(shape)} moved back to (${anchor.x},${anchor.y})`;
  }

  static scaled(shape: Shape, factor: number): string {
    return `${ShapeFeedback.reference(shape)} scaled by ${factor}`;
  }

  static attributeUpdated(
    shape: Shape,
    name: string,
    value: string | undefined
  ): string {
    const displayValue = value === undefined ? "<unset>" : `"${value}"`;
    return `${ShapeFeedback.reference(shape)} updated: ${name}=${displayValue}`;
  }

  static grouped(shape: Shape, childCount: number): string {
    const label = childCount === 1 ? "child" : "children";
    return `${ShapeFeedback.reference(shape)} created with ${childCount} ${label}`;
  }

  static ungrouped(shape: Shape): string {
    return `${ShapeFeedback.reference(shape)} ungrouped`;
  }

  static addedTo(shape: Shape, target: Shape): string {
    return `${ShapeFeedback.reference(shape)} added to ${ShapeFeedback.reference(target)}`;
  }

  static placed(shape: Shape, direction: ZOrderDirection): string {
    return `${ShapeFeedback.reference(shape)} moved to ${direction}`;
  }
}
