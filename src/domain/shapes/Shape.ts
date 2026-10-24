import type { ShapeVisitor } from "./ShapeVisitor.js";

export abstract class Shape {
  constructor(private readonly shapeId: string) {}

  get id(): string {
    return this.shapeId;
  }

  abstract accept<TResult>(visitor: ShapeVisitor<TResult>): TResult;
}
