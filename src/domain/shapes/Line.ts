import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import { Point } from "./Point.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface LineInit {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export class Line extends Shape {
  private start: Point;
  private end: Point;

  constructor(init: LineInit) {
    super(init.id);
    this.start = new Point(init.x1, init.y1);
    this.end = new Point(init.x2, init.y2);
  }

  override move(dx: number, dy: number): void {
    this.start = this.start.translate(dx, dy);
    this.end = this.end.translate(dx, dy);
  }

  override scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    const start = this.start.scale(factor);
    const end = this.end.scale(factor);
    this.start = start;
    this.end = end;
  }

  override get svgTagName(): string {
    return "line";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "x1", value: String(this.start.x) },
      { name: "y1", value: String(this.start.y) },
      { name: "x2", value: String(this.end.x) },
      { name: "y2", value: String(this.end.y) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override captureGeometryState(): GeometryState {
    const start = this.start;
    const end = this.end;
    return {
      restore: (): void => {
        this.start = start;
        this.end = end;
      }
    };
  }

  override getAttribute(name: string): string | undefined {
    if (this.isStyleAttribute(name)) {
      return this.getStyleAttribute(name);
    }

    switch (name) {
      case "x1":
        return String(this.start.x);
      case "y1":
        return String(this.start.y);
      case "x2":
        return String(this.end.x);
      case "y2":
        return String(this.end.y);
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override setAttribute(name: string, value: string | undefined): void {
    if (this.setStyleAttribute(name, value)) {
      return;
    }

    const parsed = this.parseRequiredNumber(name, value);
    switch (name) {
      case "x1":
        this.start = new Point(parsed, this.start.y);
        return;
      case "y1":
        this.start = new Point(this.start.x, parsed);
        return;
      case "x2":
        this.end = new Point(parsed, this.end.y);
        return;
      case "y2":
        this.end = new Point(this.end.x, parsed);
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "x1", value: String(this.start.x) },
      { name: "y1", value: String(this.start.y) },
      { name: "x2", value: String(this.end.x) },
      { name: "y2", value: String(this.end.y) }
    ];
    this.appendStyleAttributes(attributes);
    return { typeName: "line", id: this.id, attributes };
  }

  private parseRequiredNumber(
    name: string,
    value: string | undefined
  ): number {
    if (value === undefined) {
      throw new Error(`cannot remove required attribute: ${name}`);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${name} must be a finite number`);
    }
    return parsed;
  }
}
