import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import { Point } from "./Point.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface CircleInit {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

export class Circle extends Shape {
  private center: Point;
  private radius: number;

  constructor(init: CircleInit) {
    super(init.id);
    this.center = new Point(init.cx, init.cy);
    if (!Number.isFinite(init.r) || init.r <= 0) {
      throw new Error("circle radius must be positive");
    }
    this.radius = init.r;
  }

  get cx(): number {
    return this.center.x;
  }

  get cy(): number {
    return this.center.y;
  }

  get r(): number {
    return this.radius;
  }

  override move(dx: number, dy: number): void {
    this.center = this.center.translate(dx, dy);
  }

  override scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    const center = this.center.scale(factor);
    const radius = this.radius * factor;
    if (!Number.isFinite(radius) || radius <= 0) {
      throw new Error("circle radius must be positive");
    }
    this.center = center;
    this.radius = radius;
  }

  override get svgTagName(): string {
    return "circle";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "cx", value: String(this.center.x) },
      { name: "cy", value: String(this.center.y) },
      { name: "r", value: String(this.radius) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override captureGeometryState(): GeometryState {
    const center = this.center;
    const r = this.radius;
    return {
      restore: (): void => {
        this.center = center;
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
        return String(this.center.x);
      case "cy":
        return String(this.center.y);
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
        this.center = new Point(parsed, this.center.y);
        return;
      case "cy":
        this.center = new Point(this.center.x, parsed);
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
      { name: "cx", value: String(this.center.x) },
      { name: "cy", value: String(this.center.y) },
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
