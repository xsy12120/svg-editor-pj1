import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import { Point } from "./Point.js";
import { Size } from "./Size.js";
import type {
  ShapeAttribute,
  ShapeDescriptor
} from "./ShapeDescriptor.js";

export interface RectInit {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class Rect extends Shape {
  private position: Point;
  private dimensions: Size;

  constructor(init: RectInit) {
    super(init.id);
    this.position = new Point(init.x, init.y);
    this.dimensions = new Size(init.width, init.height);
  }

  get x(): number {
    return this.position.x;
  }

  get y(): number {
    return this.position.y;
  }

  get width(): number {
    return this.dimensions.width;
  }

  get height(): number {
    return this.dimensions.height;
  }

  override move(dx: number, dy: number): void {
    this.position = this.position.translate(dx, dy);
  }

  override scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    const position = this.position.scale(factor);
    const dimensions = this.dimensions.scale(factor);
    this.position = position;
    this.dimensions = dimensions;
  }

  override get svgTagName(): string {
    return "rect";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "x", value: String(this.position.x) },
      { name: "y", value: String(this.position.y) },
      { name: "width", value: String(this.dimensions.width) },
      { name: "height", value: String(this.dimensions.height) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override captureGeometryState(): GeometryState {
    const position = this.position;
    const dimensions = this.dimensions;

    return {
      restore: (): void => {
        this.position = position;
        this.dimensions = dimensions;
      }
    };
  }

  override getAttribute(name: string): string | undefined {
    if (this.isStyleAttribute(name)) {
      return this.getStyleAttribute(name);
    }

    switch (name) {
      case "x":
        return String(this.position.x);
      case "y":
        return String(this.position.y);
      case "width":
        return String(this.dimensions.width);
      case "height":
        return String(this.dimensions.height);
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
      case "x":
        this.position = new Point(parsed, this.position.y);
        return;
      case "y":
        this.position = new Point(this.position.x, parsed);
        return;
      case "width":
        this.dimensions = new Size(parsed, this.dimensions.height);
        return;
      case "height":
        this.dimensions = new Size(this.dimensions.width, parsed);
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "x", value: String(this.position.x) },
      { name: "y", value: String(this.position.y) },
      { name: "w", value: String(this.dimensions.width) },
      { name: "h", value: String(this.dimensions.height) }
    ];
    attributes.push(...this.styleAttributes());

    return {
      typeName: "rect",
      id: this.id,
      attributes
    };
  }

  private styleAttributes(): ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [];
    this.appendStyleAttributes(attributes);
    return attributes;
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
