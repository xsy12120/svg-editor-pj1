import { Shape } from "./Shape.js";
import type { GeometryState } from "./GeometryState.js";
import { Point } from "./Point.js";
import type { ShapeAttribute, ShapeDescriptor } from "./ShapeDescriptor.js";

export interface TextInit {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly content: string;
}

export class Text extends Shape {
  private position: Point;
  private textContent: string;

  constructor(init: TextInit) {
    super(init.id);
    this.position = new Point(init.x, init.y);
    this.textContent = init.content;
  }

  override get anchor(): Point {
    return this.position;
  }

  override move(dx: number, dy: number): void {
    this.position = this.position.translate(dx, dy);
  }

  override scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    this.position = this.position.scale(factor);
  }

  override get svgTagName(): string {
    return "text";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [
      { name: "x", value: String(this.position.x) },
      { name: "y", value: String(this.position.y) }
    ];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override get svgTextContent(): string {
    return this.textContent;
  }

  override captureGeometryState(): GeometryState {
    const position = this.position;
    return {
      restore: (): void => {
        this.position = position;
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
      { name: "x", value: String(this.position.x) },
      { name: "y", value: String(this.position.y) },
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
      this.position = new Point(parsed, this.position.y);
    } else {
      this.position = new Point(this.position.x, parsed);
    }
  }
}
