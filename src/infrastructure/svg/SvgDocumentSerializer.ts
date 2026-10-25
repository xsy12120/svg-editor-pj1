import type { Document } from "../../domain/model/Document.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";

export class SvgDocumentSerializer {
  serialize(document: Document): string {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">`
    ];
    for (const shape of document.shapes) {
      this.serializeShape(shape, 1, lines);
    }
    lines.push("</svg>");
    return `${lines.join("\n")}\n`;
  }

  private serializeShape(
    shape: Shape,
    depth: number,
    lines: string[]
  ): void {
    const indent = "  ".repeat(depth);
    const attributes = [
      { name: "id", value: shape.id },
      ...shape.toSvgAttributes()
    ]
      .map(({ name, value }) => `${name}="${this.escapeAttribute(value)}"`)
      .join(" ");
    const tag = shape.svgTagName;

    if (shape instanceof ContainerShape) {
      lines.push(`${indent}<${tag} ${attributes}>`);
      for (const child of shape.children) {
        this.serializeShape(child, depth + 1, lines);
      }
      lines.push(`${indent}</${tag}>`);
      return;
    }

    const text = shape.svgTextContent;
    if (text === undefined) {
      lines.push(`${indent}<${tag} ${attributes}/>`);
    } else {
      lines.push(
        `${indent}<${tag} ${attributes}>${this.escapeText(text)}</${tag}>`
      );
    }
  }

  private escapeAttribute(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  private escapeText(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}
