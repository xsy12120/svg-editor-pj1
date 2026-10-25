import type { ShapeDetailsRenderer } from "../../application/ports/ShapeDetailsRenderer.js";
import type {
  ShapeDetailsSnapshot,
  ShapeReference
} from "../../application/queries/ShapeDetailsSnapshot.js";

export class CliShapeDetailsRenderer implements ShapeDetailsRenderer {
  render(snapshot: ShapeDetailsSnapshot): string {
    const geometry = snapshot.attributes.filter(
      (attribute) => !this.isStyleAttribute(attribute.name)
    );
    const style = snapshot.attributes.filter((attribute) =>
      this.isStyleAttribute(attribute.name)
    );

    const lines = [
      `${snapshot.typeName}#${snapshot.id} parent=${this.formatParent(snapshot.parent)}`
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

  private formatParent(parent: ShapeReference | null): string {
    if (parent === null) {
      return "svg";
    }
    return `${parent.typeName}#${parent.id}`;
  }
}
