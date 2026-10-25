import type { Document } from "../../domain/model/Document.js";
import type { DocumentTreeRenderer } from "../../application/ports/DocumentTreeRenderer.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";

export class CliTreeRenderer implements DocumentTreeRenderer {
  render(document: Document, rootId?: string): string {
    if (rootId !== undefined) {
      const root = document.findShape(rootId);
      if (root === undefined) {
        throw new Error(`no such shape: ${rootId}`);
      }
      const lines = [this.formatShape(root)];
      this.appendChildren(lines, root, "");
      return lines.join("\n");
    }

    const lines = [`svg (${document.width}x${document.height})`];
    const shapes = document.shapes;
    shapes.forEach((shape, index) => {
      const connector = index === shapes.length - 1 ? "└── " : "├── ";
      lines.push(`${connector}${this.formatShape(shape)}`);
      this.appendChildren(
        lines,
        shape,
        connector === "└── " ? "    " : "│   "
      );
    });
    return lines.join("\n");
  }

  private appendChildren(
    lines: string[],
    shape: Shape,
    prefix: string
  ): void {
    if (!(shape instanceof ContainerShape)) {
      return;
    }

    shape.children.forEach((child, index) => {
      const isLast = index === shape.children.length - 1;
      const connector = isLast ? "└── " : "├── ";
      lines.push(`${prefix}${connector}${this.formatShape(child)}`);
      this.appendChildren(
        lines,
        child,
        prefix + (isLast ? "    " : "│   ")
      );
    });
  }

  private formatShape(shape: Shape): string {
    const descriptor = shape.toDescriptor();
    const attributes = descriptor.attributes
      .map((attribute) => `${attribute.name}=${attribute.value}`)
      .join(" ");
    const suffix = attributes.length === 0 ? "" : ` ${attributes}`;
    return `${descriptor.typeName}#${descriptor.id}${suffix}`;
  }
}
