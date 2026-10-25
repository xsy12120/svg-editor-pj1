import type { Shape } from "../shapes/Shape.js";
import { ContainerShape } from "../shapes/ContainerShape.js";
import type { ShapePlacement } from "./ShapePlacement.js";

export class Document {
  private readonly shapeList: Shape[] = [];
  private readonly shapesById = new Map<string, Shape>();

  constructor(
    private canvasWidth: number,
    private canvasHeight: number
  ) {}

  get width(): number {
    return this.canvasWidth;
  }

  get height(): number {
    return this.canvasHeight;
  }

  get shapes(): readonly Shape[] {
    return this.shapeList;
  }

  get shapeCount(): number {
    return this.shapesById.size;
  }

  resize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  hasShape(id: string): boolean {
    return this.shapesById.has(id);
  }

  findShape(id: string): Shape | undefined {
    return this.shapesById.get(id);
  }

  addShape(shape: Shape): void {
    this.insertShapeAt(shape, null, this.shapeList.length);
  }

  findPlacement(id: string): ShapePlacement | undefined {
    const rootIndex = this.shapeList.findIndex((shape) => shape.id === id);
    if (rootIndex >= 0) {
      return { parent: null, index: rootIndex };
    }

    for (const root of this.shapeList) {
      if (root instanceof ContainerShape) {
        const placement = findPlacementInContainer(root, id);
        if (placement !== undefined) {
          return placement;
        }
      }
    }
    return undefined;
  }

  detachShape(id: string): Shape | undefined {
    const placement = this.findPlacement(id);
    if (placement === undefined) {
      return undefined;
    }

    const shape =
      placement.parent === null
        ? this.shapeList.splice(placement.index, 1)[0]
        : placement.parent.removeChild(id);
    if (shape === undefined) {
      return undefined;
    }

    for (const descendant of shape.walkTree()) {
      this.shapesById.delete(descendant.id);
    }
    return shape;
  }

  insertShapeAt(
    shape: Shape,
    parent: ContainerShape | null,
    index: number
  ): void {
    const subtree = [...shape.walkTree()];
    const newIds = new Set<string>();
    for (const descendant of subtree) {
      if (this.shapesById.has(descendant.id) || newIds.has(descendant.id)) {
        throw new Error(`id already exists: ${descendant.id}`);
      }
      newIds.add(descendant.id);
    }

    if (parent === null) {
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index > this.shapeList.length
      ) {
        throw new Error(`invalid shape index: ${index}`);
      }
      this.shapeList.splice(index, 0, shape);
    } else {
      if (!this.hasShape(parent.id)) {
        throw new Error(`no such container: ${parent.id}`);
      }
      parent.insertChildAt(shape, index);
    }

    for (const descendant of subtree) {
      this.shapesById.set(descendant.id, descendant);
    }
  }

  removeShape(id: string): Shape | undefined {
    return this.detachShape(id);
  }
}

function findPlacementInContainer(
  container: ContainerShape,
  id: string
): ShapePlacement | undefined {
  for (let index = 0; index < container.children.length; index += 1) {
    const child = container.children[index];
    if (child === undefined) {
      continue;
    }
    if (child.id === id) {
      return { parent: container, index };
    }
    if (child instanceof ContainerShape) {
      const nested = findPlacementInContainer(child, id);
      if (nested !== undefined) {
        return nested;
      }
    }
  }
  return undefined;
}
