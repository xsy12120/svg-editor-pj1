import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface EllipseInit {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

export class Ellipse extends Shape {
  private centerX: number;
  private centerY: number;
  private radiusX: number;
  private radiusY: number;

  constructor(init: EllipseInit) {
    super(init.id);
    this.centerX = init.cx;
    this.centerY = init.cy;
    this.radiusX = init.rx;
    this.radiusY = init.ry;
  }

  override move(dx: number, dy: number): void {
    this.centerX += dx;
    this.centerY += dy;
  }

  override scale(factor: number): void {
    this.centerX *= factor;
    this.centerY *= factor;
    this.radiusX *= factor;
    this.radiusY *= factor;
  }

  override get svgTagName(): string {
    return "ellipse";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "cx", value: String(this.centerX) },
      { name: "cy", value: String(this.centerY) },
      { name: "rx", value: String(this.radiusX) },
      { name: "ry", value: String(this.radiusY) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override captureGeometryState(): GeometryState {
    const cx = this.centerX;
    const cy = this.centerY;
    const rx = this.radiusX;
    const ry = this.radiusY;
    return {
      restore: (): void => {
        this.centerX = cx;
        this.centerY = cy;
        this.radiusX = rx;
        this.radiusY = ry;
      }
    };
  }

  override getAttribute(name: string): string | undefined {
    if (this.isStyleAttribute(name)) {
      return this.getStyleAttribute(name);
    }

    switch (name) {
      case "cx":
        return String(this.centerX);
      case "cy":
        return String(this.centerY);
      case "rx":
        return String(this.radiusX);
      case "ry":
        return String(this.radiusY);
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
      case "cx":
        this.centerX = parsed;
        return;
      case "cy":
        this.centerY = parsed;
        return;
      case "rx":
        this.radiusX = this.parsePositive(name, parsed);
        return;
      case "ry":
        this.radiusY = this.parsePositive(name, parsed);
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "cx", value: String(this.centerX) },
      { name: "cy", value: String(this.centerY) },
      { name: "rx", value: String(this.radiusX) },
      { name: "ry", value: String(this.radiusY) }
    ];
    this.appendStyleAttributes(attributes);
    return { typeName: "ellipse", id: this.id, attributes };
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

  private parsePositive(name: string, value: number): number {
    if (value <= 0) {
      throw new Error(`${name} must be positive`);
    }
    return value;
  }
}
