import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface LineInit {
  readonly id: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly stroke?: string;
}

export class Line extends Shape {
  private startX: number;
  private startY: number;
  private endX: number;
  private endY: number;

  constructor(init: LineInit) {
    super(init.id);
    this.startX = init.x1;
    this.startY = init.y1;
    this.endX = init.x2;
    this.endY = init.y2;
    if (init.stroke !== undefined) {
      this.setStyleAttribute("stroke", init.stroke);
    }
  }

  override move(dx: number, dy: number): void {
    this.startX += dx;
    this.startY += dy;
    this.endX += dx;
    this.endY += dy;
  }

  override scale(factor: number): void {
    this.startX *= factor;
    this.startY *= factor;
    this.endX *= factor;
    this.endY *= factor;
  }

  override get svgTagName(): string {
    return "line";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "x1", value: String(this.startX) },
      { name: "y1", value: String(this.startY) },
      { name: "x2", value: String(this.endX) },
      { name: "y2", value: String(this.endY) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override captureGeometryState(): GeometryState {
    const x1 = this.startX;
    const y1 = this.startY;
    const x2 = this.endX;
    const y2 = this.endY;
    return {
      restore: (): void => {
        this.startX = x1;
        this.startY = y1;
        this.endX = x2;
        this.endY = y2;
      }
    };
  }

  override getAttribute(name: string): string | undefined {
    if (this.isStyleAttribute(name)) {
      return this.getStyleAttribute(name);
    }

    switch (name) {
      case "x1":
        return String(this.startX);
      case "y1":
        return String(this.startY);
      case "x2":
        return String(this.endX);
      case "y2":
        return String(this.endY);
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
        this.startX = parsed;
        return;
      case "y1":
        this.startY = parsed;
        return;
      case "x2":
        this.endX = parsed;
        return;
      case "y2":
        this.endY = parsed;
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "x1", value: String(this.startX) },
      { name: "y1", value: String(this.startY) },
      { name: "x2", value: String(this.endX) },
      { name: "y2", value: String(this.endY) }
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
