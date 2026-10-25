import type { GeometryState } from "./GeometryState.js";
import { Shape } from "./Shape.js";

export abstract class ContainerShape extends Shape {
  private readonly childShapes: Shape[] = [];

  get canUngroup(): boolean {
    return true;
  }

  get children(): readonly Shape[] {
    return this.childShapes;
  }

  addChild(shape: Shape): void {
    this.insertChildAt(shape, this.childShapes.length);
  }

  insertChildAt(shape: Shape, index: number): void {
    if (
      shape === this ||
      (shape instanceof ContainerShape && shape.contains(this))
    ) {
      throw new Error(
        `cannot group a container into its own descendant: ${shape.id}`
      );
    }

    const existingIds = new Set<string>();
    for (const child of this.childShapes) {
      for (const descendant of child.walkTree()) {
        existingIds.add(descendant.id);
      }
    }

    const addedIds = new Set<string>();
    for (const descendant of shape.walkTree()) {
      if (
        descendant.id === this.id ||
        existingIds.has(descendant.id) ||
        addedIds.has(descendant.id)
      ) {
        throw new Error(`id already exists: ${descendant.id}`);
      }
      addedIds.add(descendant.id);
    }

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index > this.childShapes.length
    ) {
      throw new Error(`invalid child index: ${index}`);
    }
    this.childShapes.splice(index, 0, shape);
  }

  contains(shape: Shape): boolean {
    return this.childShapes.some(
      (child) =>
        child === shape ||
        (child instanceof ContainerShape && child.contains(shape))
    );
  }

  containsById(id: string): boolean {
    return this.childShapes.some(
      (child) =>
        child.id === id ||
        (child instanceof ContainerShape && child.containsById(id))
    );
  }

  removeChild(id: string): Shape | undefined {
    const directIndex = this.childShapes.findIndex((child) => child.id === id);
    if (directIndex >= 0) {
      return this.childShapes.splice(directIndex, 1)[0];
    }

    for (const child of this.childShapes) {
      if (child instanceof ContainerShape) {
        const removed = child.removeChild(id);
        if (removed !== undefined) {
          return removed;
        }
      }
    }
    return undefined;
  }

  override *walkTree(): Generator<Shape> {
    yield this;
    for (const child of this.childShapes) {
      yield* child.walkTree();
    }
  }

  override move(dx: number, dy: number): void {
    for (const child of this.childShapes) {
      child.move(dx, dy);
    }
  }

  override scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }

    for (const child of this.childShapes) {
      child.scale(factor);
    }
  }

  override captureGeometryState(): GeometryState {
    const childStates = this.childShapes.map((child) =>
      child.captureGeometryState()
    );

    return {
      restore: (): void => {
        for (const state of childStates) {
          state.restore();
        }
      }
    };
  }
}
