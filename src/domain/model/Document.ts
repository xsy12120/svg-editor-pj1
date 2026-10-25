import type { Shape } from "../shapes/Shape.js";
import { Group } from "../shapes/Group.js";
import type { ShapePlacement } from "./ShapePlacement.js";

export class Document {
  private readonly shapeList: Shape[] = [];
  private readonly shapesById = new Map<string, Shape>();

  constructor(
    private readonly canvasWidth: number,
    private readonly canvasHeight: number
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
      if (root instanceof Group) {
        const placement = findPlacementInGroup(root, id);
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

    for (const descendant of collectShapeTree(shape)) {
      this.shapesById.delete(descendant.id);
    }
    return shape;
  }

  insertShapeAt(
    shape: Shape,
    parent: Group | null,
    index: number
  ): void {
    const subtree = [...collectShapeTree(shape)];
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

function* collectShapeTree(shape: Shape): Generator<Shape> {
  yield shape;
  if (shape instanceof Group) {
    for (const child of shape.children) {
      yield* collectShapeTree(child);
    }
  }
}

function findPlacementInGroup(
  group: Group,
  id: string
): ShapePlacement | undefined {
  for (let index = 0; index < group.children.length; index += 1) {
    const child = group.children[index];
    if (child === undefined) {
      continue;
    }
    if (child.id === id) {
      return { parent: group, index };
    }
    if (child instanceof Group) {
      const nested = findPlacementInGroup(child, id);
      if (nested !== undefined) {
        return nested;
      }
    }
  }
  return undefined;
}
