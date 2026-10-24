import type { Document } from "../../domain/model/Document.js";
import type { Rect } from "../../domain/shapes/Rect.js";
import type { ShapeVisitor } from "../../domain/shapes/ShapeVisitor.js";
import type { DocumentTreeRenderer } from "../../application/ports/DocumentTreeRenderer.js";

export class CliTreeRenderer
  implements DocumentTreeRenderer, ShapeVisitor<string>
{
  render(document: Document): string {
    const lines = [`svg (${document.width}x${document.height})`];
    const shapes = document.shapes;

    shapes.forEach((shape, index) => {
      const connector = index === shapes.length - 1 ? "└── " : "├── ";
      lines.push(`${connector}${shape.accept(this)}`);
    });

    return lines.join("\n");
  }

  visitRect(shape: Rect): string {
    const fill = shape.fill === undefined ? "" : ` fill=${shape.fill}`;
    return `rect#${shape.id} x=${shape.x} y=${shape.y} w=${shape.width} h=${shape.height}${fill}`;
  }
}
