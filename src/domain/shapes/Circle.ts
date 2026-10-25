import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface CircleInit {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

export class Circle extends Shape {
  private centerX: number;
  private centerY: number;
  private radius: number;

  constructor(init: CircleInit) {
    super(init.id);
    this.centerX = init.cx;
    this.centerY = init.cy;
    this.radius = init.r;
  }

  get cx(): number {
    return this.centerX;
  }

  get cy(): number {
    return this.centerY;
  }

  get r(): number {
    return this.radius;
  }

  override move(dx: number, dy: number): void {
    this.centerX += dx;
    this.centerY += dy;
  }

  override scale(factor: number): void {
    this.centerX *= factor;
    this.centerY *= factor;
    this.radius *= factor;
  }

  override get svgTagName(): string {
    return "circle";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "cx", value: String(this.centerX) },
      { name: "cy", value: String(this.centerY) },
      { name: "r", value: String(this.radius) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override captureGeometryState(): GeometryState {
    const cx = this.centerX;
    const cy = this.centerY;
    const r = this.radius;
    return {
      restore: (): void => {
        this.centerX = cx;
        this.centerY = cy;
        this.radius = r;
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
      case "r":
        return String(this.radius);
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
      case "r":
        if (parsed <= 0) {
          throw new Error("r must be positive");
        }
        this.radius = parsed;
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "cx", value: String(this.centerX) },
      { name: "cy", value: String(this.centerY) },
      { name: "r", value: String(this.radius) }
    ];
    this.appendStyleAttributes(attributes);
    return { typeName: "circle", id: this.id, attributes };
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
