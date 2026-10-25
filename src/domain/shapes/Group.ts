import { ContainerShape } from "./ContainerShape.js";
import type { ShapeAttribute } from "./ShapeDescriptor.js";
import type { ShapeDescriptor } from "./ShapeDescriptor.js";

export class Group extends ContainerShape {
  constructor(id: string) {
    super(id);
  }

  override get svgTagName(): string {
    return "g";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [];
    this.appendStyleAttributes(attributes);
    return attributes;
  }

  override getAttribute(name: string): string | undefined {
    if (this.isStyleAttribute(name)) {
      return this.getStyleAttribute(name);
    }
    throw new Error(`unknown attribute: ${name}`);
  }

  override setAttribute(name: string, value: string | undefined): void {
    if (!this.setStyleAttribute(name, value)) {
      throw new Error(`unknown attribute: ${name}`);
    }
  }

  override toDescriptor(): ShapeDescriptor {
    const attributes: ShapeAttribute[] = [];
    this.appendStyleAttributes(attributes);

    return {
      typeName: "g",
      id: this.id,
      attributes
    };
  }
}
