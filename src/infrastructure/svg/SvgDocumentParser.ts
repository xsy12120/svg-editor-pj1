import { XMLParser } from "fast-xml-parser";

import type { ParsedSvgDocument } from "../../application/ports/SvgCodec.js";
import type { ShapeFactory } from "../../application/shapes/ShapeFactory.js";
import { Document } from "../../domain/model/Document.js";
import { ContainerShape } from "../../domain/shapes/ContainerShape.js";
import type { Shape } from "../../domain/shapes/Shape.js";
import { SvgIdAllocator } from "./SvgIdAllocator.js";
import { SvgTransform } from "./SvgTransform.js";

type OrderedNode = Record<string, unknown>;

export class SvgDocumentParser {
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    preserveOrder: true,
    trimValues: false
  });

  constructor(private readonly shapeFactory: ShapeFactory) {}

  parse(content: string): ParsedSvgDocument {
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
    const idAllocator = new SvgIdAllocator(explicitIds);
    const warnings: string[] = [];

    for (const shape of this.parseElements(
      rootChildren,
      idAllocator,
      warnings
    )) {
      document.addShape(shape);
    }
    return { document, warnings };
  }

  private parseElements(
    nodes: readonly unknown[],
    idAllocator: SvgIdAllocator,
    warnings: string[]
  ): Shape[] {
    const shapes: Shape[] = [];
    for (const node of nodes) {
      if (!isRecord(node)) {
        continue;
      }

      const elementName = this.elementNameOf(node);
      if (elementName === undefined) {
        continue;
      }

      const attributes = this.attributesOf(node);
      const rawId = attributes["id"];
      let id = rawId;
      if (id === undefined || id.length === 0) {
        id = idAllocator.allocate(elementName);
        warnings.push(
          `warning: assigned id ${id} to unnamed <${elementName}>`
        );
      }

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
            idAllocator,
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
      const elementName = this.elementNameOf(node);
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

  private elementNameOf(node: OrderedNode): string | undefined {
    return Object.keys(node).find(
      (key) => key !== ":@" && key !== "#text" && key !== "#comment"
    );
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
      .filter(
        (value): value is string | number =>
          typeof value === "string" || typeof value === "number"
      )
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
}

function isRecord(value: unknown): value is OrderedNode {
  return typeof value === "object" && value !== null;
}
