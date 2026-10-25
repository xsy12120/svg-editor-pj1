import type { GeometryState } from "./GeometryState.js";
import type {
  ShapeAttribute,
  ShapeDescriptor
} from "./ShapeDescriptor.js";
import { ShapeStyle } from "./ShapeStyle.js";

export abstract class Shape {
  private readonly style = new ShapeStyle();

  constructor(private readonly shapeId: string) {}

  get id(): string {
    return this.shapeId;
  }

  get fill(): string | undefined {
    return this.style.get("fill");
  }

  get stroke(): string | undefined {
    return this.style.get("stroke");
  }

  abstract get svgTagName(): string;
  abstract toSvgAttributes(): readonly ShapeAttribute[];
  get svgTextContent(): string | undefined {
    return undefined;
  }

  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract captureGeometryState(): GeometryState;
  abstract getAttribute(name: string): string | undefined;
  abstract setAttribute(name: string, value: string | undefined): void;
  abstract toDescriptor(): ShapeDescriptor;

  protected isStyleAttribute(name: string): boolean {
    return this.style.isSupported(name);
  }

  protected getStyleAttribute(name: string): string | undefined {
    return this.style.get(name);
  }

  protected setStyleAttribute(
    name: string,
    value: string | undefined
  ): boolean {
    return this.style.set(name, value);
  }

  protected appendStyleAttributes(attributes: ShapeAttribute[]): void {
    attributes.push(...this.style.toAttributes());
  }
}
