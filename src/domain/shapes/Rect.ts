import { Shape } from "./Shape.js";
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
  private readonly fillColor: string | undefined;

  constructor(init: RectInit) {
    super(init.id);
    this.positionX = init.x;
    this.positionY = init.y;
    this.rectWidth = init.width;
    this.rectHeight = init.height;
    this.fillColor = init.fill;
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

  get fill(): string | undefined {
    return this.fillColor;
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

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "x", value: String(this.positionX) },
      { name: "y", value: String(this.positionY) },
      { name: "w", value: String(this.rectWidth) },
      { name: "h", value: String(this.rectHeight) }
    ];
    if (this.fillColor !== undefined) {
      attributes.push({ name: "fill", value: this.fillColor });
    }

    return {
      typeName: "rect",
      id: this.id,
      attributes
    };
  }
}
