import type { ShapeDescriptor } from "./ShapeDescriptor.js";

export abstract class Shape {
  constructor(private readonly shapeId: string) {}

  get id(): string {
    return this.shapeId;
  }

  abstract toDescriptor(): ShapeDescriptor;
}
