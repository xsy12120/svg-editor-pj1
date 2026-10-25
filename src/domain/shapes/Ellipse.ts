import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import { Point } from "./Point.js";
import { Size } from "./Size.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface EllipseInit {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
}

export class Ellipse extends Shape {
  private center: Point;
  private radii: Size;

  constructor(init: EllipseInit) {
    super(init.id);
    this.center = new Point(init.cx, init.cy);
    this.radii = new Size(init.rx, init.ry);
  }

  override get anchor(): Point {
    return this.center;
  }

  override move(dx: number, dy: number): void {
    this.center = this.center.translate(dx, dy);
  }

  override scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    const center = this.center.scale(factor);
    const radii = this.radii.scale(factor);
    this.center = center;
    this.radii = radii;
  }

  override get svgTagName(): string {
    return "ellipse";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "cx", value: String(this.center.x) },
      { name: "cy", value: String(this.center.y) },
      { name: "rx", value: String(this.radii.width) },
      { name: "ry", value: String(this.radii.height) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override captureGeometryState(): GeometryState {
    const center = this.center;
    const radii = this.radii;
    return {
      restore: (): void => {
        this.center = center;
        this.radii = radii;
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
      case "rx":
        return String(this.radii.width);
      case "ry":
        return String(this.radii.height);
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
      case "rx":
        this.radii = new Size(parsed, this.radii.height);
        return;
      case "ry":
        this.radii = new Size(this.radii.width, parsed);
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "cx", value: String(this.center.x) },
      { name: "cy", value: String(this.center.y) },
      { name: "rx", value: String(this.radii.width) },
      { name: "ry", value: String(this.radii.height) }
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

}
