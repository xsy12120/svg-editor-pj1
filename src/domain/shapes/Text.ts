import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface TextInit {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly content: string;
}

export class Text extends Shape {
  private positionX: number;
  private positionY: number;
  private textContent: string;

  constructor(init: TextInit) {
    super(init.id);
    this.positionX = init.x;
    this.positionY = init.y;
    this.textContent = init.content;
  }

  override move(dx: number, dy: number): void {
    this.positionX += dx;
    this.positionY += dy;
  }

  override scale(factor: number): void {
    this.positionX *= factor;
    this.positionY *= factor;
  }

  override captureGeometryState(): GeometryState {
    const x = this.positionX;
    const y = this.positionY;
    return {
      restore: (): void => {
        this.positionX = x;
        this.positionY = y;
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
      case "text":
        return this.textContent;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override setAttribute(name: string, value: string | undefined): void {
    if (this.setStyleAttribute(name, value)) {
      return;
    }
    if (value === undefined) {
      throw new Error(`cannot remove required attribute: ${name}`);
    }

    switch (name) {
      case "x":
      case "y":
        this.setCoordinate(name, value);
        return;
      case "text":
        this.textContent = value;
        return;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [
      { name: "x", value: String(this.positionX) },
      { name: "y", value: String(this.positionY) },
      { name: "text", value: this.textContent }
    ];
    this.appendStyleAttributes(attributes);
    return { typeName: "text", id: this.id, attributes };
  }

  private setCoordinate(name: "x" | "y", value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${name} must be a finite number`);
    }

    if (name === "x") {
      this.positionX = parsed;
    } else {
      this.positionY = parsed;
    }
  }
}
