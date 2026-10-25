import { XMLParser } from "fast-xml-parser";

import type {
  ParsedSvgDocument,
  SvgCodec
} from "../../application/ports/SvgCodec.js";
import type { ShapeFactory } from "../../application/shapes/ShapeFactory.js";
import { Document } from "../../domain/model/Document.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import { SvgTransform } from "./SvgTransform.js";

type OrderedNode = Record<string, unknown>;

export class XmlSvgCodec implements SvgCodec {
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    preserveOrder: true,
    trimValues: false
  });

  constructor(private readonly shapeFactory: ShapeFactory) {}

  decode(content: string): ParsedSvgDocument {
    const parsed: unknown = this.parser.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error("invalid SVG document");
    }

    const svgNode = parsed.find(
      (node): node is OrderedNode =>
        isRecord(node) && Array.isArray(node["svg"])
    );
    if (svgNode === undefined) {
      throw new Error("missing svg root element");
    }

    const rootAttributes = this.attributesOf(svgNode);
    const rootChildren = svgNode["svg"];
    if (!Array.isArray(rootChildren)) {
      throw new Error("invalid svg root element");
    }

    const dimensions = this.readDimensions(rootAttributes);
    const document = new Document(dimensions.width, dimensions.height);
    const explicitIds = new Set<string>();
    this.collectExplicitIds(rootChildren, explicitIds);

    const usedIds = new Set(explicitIds);
    const counters = new Map<string, number>();
    const warnings: string[] = [];
    for (const shape of this.parseElements(
      rootChildren,
      usedIds,
      counters,
      warnings
    )) {
      document.addShape(shape);
    }

    return { document, warnings };
  }

  encode(document: Document): string {
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

  private parseElements(
    nodes: readonly unknown[],
    usedIds: Set<string>,
    counters: Map<string, number>,
    warnings: string[]
  ): Shape[] {
    const shapes: Shape[] = [];
    for (const node of nodes) {
      if (!isRecord(node)) {
        continue;
      }

      const elementName = Object.keys(node).find(
        (key) => key !== ":@" && key !== "#text" && key !== "#comment"
      );
      if (elementName === undefined) {
        continue;
      }

      const attributes = this.attributesOf(node);
      const rawId = attributes["id"];
      const id =
        rawId === undefined || rawId.length === 0
          ? this.generateId(elementName, usedIds, counters, warnings)
          : rawId;
      const shapeAttributes: Record<string, string> = {};
      for (const [name, value] of Object.entries(attributes)) {
        if (name !== "id") {
          shapeAttributes[name] = value;
        }
      }
      const rawTransform = shapeAttributes["transform"];
      delete shapeAttributes["transform"];

      if (elementName === "text") {
        shapeAttributes["text"] = this.textContentOf(node, elementName);
      }

      const shape = this.shapeFactory.create({
        typeName: elementName,
        id,
        attributes: shapeAttributes
      });
      if (shape instanceof ContainerShape) {
        const children = node[elementName];
        if (Array.isArray(children)) {
          for (const child of this.parseElements(
            children,
            usedIds,
            counters,
            warnings
          )) {
            shape.addChild(child);
          }
        }
      }
      if (rawTransform !== undefined) {
        SvgTransform.parse(rawTransform).apply(shape);
      }
      shapes.push(shape);
    }
    return shapes;
  }

  private collectExplicitIds(nodes: readonly unknown[], ids: Set<string>): void {
    for (const node of nodes) {
      if (!isRecord(node)) {
        continue;
      }
      const elementName = Object.keys(node).find(
        (key) => key !== ":@" && key !== "#text" && key !== "#comment"
      );
      if (elementName === undefined) {
        continue;
      }
      const id = this.attributesOf(node)["id"];
      if (id !== undefined && id.length > 0) {
        ids.add(id);
      }
      const children = node[elementName];
      if (Array.isArray(children)) {
        this.collectExplicitIds(children, ids);
      }
    }
  }

  private generateId(
    typeName: string,
    usedIds: Set<string>,
    counters: Map<string, number>,
    warnings: string[]
  ): string {
    let counter = counters.get(typeName) ?? 0;
    let id: string;
    do {
      counter += 1;
      id = `${typeName}${counter}`;
    } while (usedIds.has(id));

    counters.set(typeName, counter);
    usedIds.add(id);
    warnings.push(`warning: assigned id ${id} to unnamed <${typeName}>`);
    return id;
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

  private attributesOf(node: OrderedNode): Record<string, string> {
    const attributes = node[":@"];
    if (!isRecord(attributes)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(attributes).map(([name, value]) => [name, String(value)])
    );
  }

  private textContentOf(node: OrderedNode, elementName: string): string {
    const children = node[elementName];
    if (!Array.isArray(children)) {
      return "";
    }
    return children
      .filter(isRecord)
      .map((child) => child["#text"])
      .filter((value): value is string | number => typeof value === "string" || typeof value === "number")
      .map(String)
      .join("");
  }

  private readDimensions(attributes: Record<string, string>): {
    readonly width: number;
    readonly height: number;
  } {
    const viewBox = attributes["viewBox"]?.trim().split(/\s+/).map(Number);
    const width = Number(attributes["width"] ?? viewBox?.[2]);
    const height = Number(attributes["height"] ?? viewBox?.[3]);
    if (!Number.isFinite(width) || width <= 0) {
      throw new Error("invalid svg width");
    }
    if (!Number.isFinite(height) || height <= 0) {
      throw new Error("invalid svg height");
    }
    return { width, height };
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

function isRecord(value: unknown): value is OrderedNode {
  return typeof value === "object" && value !== null;
}
