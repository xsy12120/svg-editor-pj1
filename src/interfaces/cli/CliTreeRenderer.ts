import type { Document } from "../../domain/model/Document.js";
import type { DocumentTreeRenderer } from "../../application/ports/DocumentTreeRenderer.js";

export class CliTreeRenderer implements DocumentTreeRenderer {
  render(document: Document): string {
    const lines = [`svg (${document.width}x${document.height})`];
    const shapes = document.shapes;

    shapes.forEach((shape, index) => {
      const connector = index === shapes.length - 1 ? "└── " : "├── ";
      const descriptor = shape.toDescriptor();
      const attributes = descriptor.attributes
        .map((attribute) => `${attribute.name}=${attribute.value}`)
        .join(" ");
      const suffix = attributes.length === 0 ? "" : ` ${attributes}`;
      lines.push(
        `${connector}${descriptor.typeName}#${descriptor.id}${suffix}`
      );
    });

    return lines.join("\n");
  }
}
