import type { ShapeDetailsRenderer } from "../../application/ports/ShapeDetailsRenderer.js";
import type { Shape } from "../../domain/shapes/Shape.js";

export class CliShapeDetailsRenderer implements ShapeDetailsRenderer {
  render(shape: Shape, parent: Shape | null): string {
    const descriptor = shape.toDescriptor();
    const geometry = descriptor.attributes.filter(
      (attribute) => !this.isStyleAttribute(attribute.name)
    );
    const style = descriptor.attributes.filter((attribute) =>
      this.isStyleAttribute(attribute.name)
    );

    const lines = [
      `${descriptor.typeName}#${descriptor.id} parent=${this.formatParent(parent)}`
    ];
    if (geometry.length > 0) {
      lines.push(`  ${this.formatAttributes(geometry)}`);
    }
    if (style.length > 0) {
      lines.push(`  ${this.formatAttributes(style)}`);
    }
    return lines.join("\n");
  }

  private formatAttributes(
    attributes: readonly { readonly name: string; readonly value: string }[]
  ): string {
    return attributes
      .map((attribute) => `${attribute.name}=${attribute.value}`)
      .join(" ");
  }

  private isStyleAttribute(name: string): boolean {
    return name === "fill" || name === "stroke" || name === "stroke-width";
  }

  private formatParent(parent: Shape | null): string {
    if (parent === null) {
      return "svg";
    }
    const descriptor = parent.toDescriptor();
    return `${descriptor.typeName}#${descriptor.id}`;
  }
}
