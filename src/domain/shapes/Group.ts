import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import type { ShapeAttribute } from "./ShapeDescriptor.js";
import type { ShapeDescriptor } from "./ShapeDescriptor.js";

export class Group extends Shape {
  private readonly childShapes: Shape[] = [];

  constructor(id: string) {
    super(id);
  }

  get children(): readonly Shape[] {
    return this.childShapes;
  }

  addChild(shape: Shape): void {
    this.insertChildAt(shape, this.childShapes.length);
  }

  insertChildAt(shape: Shape, index: number): void {
    if (shape === this || (shape instanceof Group && shape.contains(this))) {
      throw new Error(
        `cannot group a container into its own descendant: ${shape.id}`
      );
    }

    const newIds = collectIds(shape);
    const existingIds = new Set(this.childShapes.flatMap(collectIds));
    const addedIds = new Set<string>();
    for (const id of newIds) {
      if (id === this.id || existingIds.has(id) || addedIds.has(id)) {
        throw new Error(`id already exists: ${id}`);
      }
      addedIds.add(id);
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
        child === shape || (child instanceof Group && child.contains(shape))
    );
  }

  containsById(id: string): boolean {
    return this.childShapes.some(
      (child) =>
        child.id === id || (child instanceof Group && child.containsById(id))
    );
  }

  removeChild(id: string): Shape | undefined {
    const directIndex = this.childShapes.findIndex((child) => child.id === id);
    if (directIndex >= 0) {
      return this.childShapes.splice(directIndex, 1)[0];
    }

    for (const child of this.childShapes) {
      if (child instanceof Group) {
        const removed = child.removeChild(id);
        if (removed !== undefined) {
          return removed;
        }
      }
    }

    return undefined;
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

  override getAttribute(name: string): string | undefined {
    if (this.isStyleAttribute(name)) {
      return this.getStyleAttribute(name);
    }
    throw new Error(`unknown attribute: ${name}`);
  }

  override setAttribute(name: string, value: string | undefined): void {
    if (!this.setStyleAttribute(name, value)) {
      throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [];
    this.appendStyleAttributes(attributes);

    return {
      typeName: "g",
      id: this.id,
      attributes
    };
  }
}

function collectIds(shape: Shape): string[] {
  if (!(shape instanceof Group)) {
    return [shape.id];
  }

  return [shape.id, ...shape.children.flatMap(collectIds)];
}
