import type { Shape } from "../shapes/Shape.js";
import { Group } from "../shapes/Group.js";

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
    const subtree = [...collectShapeTree(shape)];
    const newIds = new Set<string>();
    for (const descendant of subtree) {
      if (this.shapesById.has(descendant.id) || newIds.has(descendant.id)) {
        throw new Error(`id already exists: ${descendant.id}`);
      }
      newIds.add(descendant.id);
    }

    this.shapeList.push(shape);
    for (const descendant of subtree) {
      this.shapesById.set(descendant.id, descendant);
    }
  }

  removeShape(id: string): Shape | undefined {
    const root = this.shapeList.find(
      (shape) =>
        shape.id === id || (shape instanceof Group && shape.containsById(id))
    );
    if (root === undefined) {
      return undefined;
    }

    const removed =
      root.id === id
        ? root
        : root instanceof Group
          ? root.removeChild(id)
          : undefined;
    if (removed === undefined) {
      return undefined;
    }

    if (root.id === id) {
      const index = this.shapeList.indexOf(root);
      this.shapeList.splice(index, 1);
    }
    for (const descendant of collectShapeTree(removed)) {
      this.shapesById.delete(descendant.id);
    }
    return removed;
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
