import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
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
  readonly fill?: string;
}

export class Rect extends Shape {
  private positionX: number;
  private positionY: number;
  private rectWidth: number;
  private rectHeight: number;

  constructor(init: RectInit) {
    super(init.id);
    this.positionX = init.x;
    this.positionY = init.y;
    this.rectWidth = init.width;
    this.rectHeight = init.height;
    if (init.fill !== undefined) {
      this.setStyleAttribute("fill", init.fill);
    }
  }

  get x(): number {
    return this.positionX;
  }

  get y(): number {
    return this.positionY;
  }

  get width(): number {
    return this.rectWidth;
  }

  get height(): number {
    return this.rectHeight;
  }

  override move(dx: number, dy: number): void {
    this.positionX += dx;
    this.positionY += dy;
  }

  override scale(factor: number): void {
    this.positionX *= factor;
    this.positionY *= factor;
    this.rectWidth *= factor;
    this.rectHeight *= factor;
  }

  override captureGeometryState(): GeometryState {
    const x = this.positionX;
    const y = this.positionY;
    const width = this.rectWidth;
    const height = this.rectHeight;

    return {
      restore: (): void => {
        this.positionX = x;
        this.positionY = y;
        this.rectWidth = width;
        this.rectHeight = height;
      }
    };
  }

  override getAttribute(name: string): string | undefined {
    if (this.isStyleAttribute(name)) {
      return this.getStyleAttribute(name);
    }

    switch (name) {
      case "x":
        return String(this.positionX);
      case "y":
        return String(this.positionY);
      case "width":
        return String(this.rectWidth);
      case "height":
        return String(this.rectHeight);
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
        this.positionX = parsed;
        return;
      case "y":
        this.positionY = parsed;
        return;
      case "width":
        this.rectWidth = this.parsePositiveNumber(name, parsed);
        return;
      case "height":
        this.rectHeight = this.parsePositiveNumber(name, parsed);
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "x", value: String(this.positionX) },
      { name: "y", value: String(this.positionY) },
      { name: "w", value: String(this.rectWidth) },
      { name: "h", value: String(this.rectHeight) }
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

  private parsePositiveNumber(name: string, value: number): number {
    if (value <= 0) {
      throw new Error(`${name} must be positive`);
    }
    return value;
  }
}
