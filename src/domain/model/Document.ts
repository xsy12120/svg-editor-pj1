import type { Shape } from "../shapes/Shape.js";

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
    if (this.shapesById.has(shape.id)) {
      throw new Error(`id already exists: ${shape.id}`);
    }

    this.shapeList.push(shape);
    this.shapesById.set(shape.id, shape);
  }

  removeShape(id: string): Shape | undefined {
    const shape = this.shapesById.get(id);
    if (shape === undefined) {
      return undefined;
    }

    const index = this.shapeList.indexOf(shape);
    if (index >= 0) {
      this.shapeList.splice(index, 1);
    }
    this.shapesById.delete(id);
    return shape;
  }
}
