import type { ShapeDescriptor } from "./ShapeDescriptor.js";

export abstract class Shape {
  constructor(private readonly shapeId: string) {}

  get id(): string {
    return this.shapeId;
  }

  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract toDescriptor(): ShapeDescriptor;
}
