import { Ellipse } from "../../../domain/shapes/Ellipse.js";
import type { Shape } from "../../../domain/shapes/Shape.js";
import type { ShapeInit } from "../ShapeInit.js";
import type { ShapeProvider } from "../ShapeProvider.js";
import {
  assertShapeType,
  parseFiniteNumber,
  parsePositiveNumber,
  requireAttribute,
  requireShapeId
} from "./ShapeProviderSupport.js";

export class EllipseProvider implements ShapeProvider {
  readonly typeName = "ellipse";

  createFromCliArgs(args: readonly string[]): ShapeInit {
    if (args.length < 5 || args.length > 6) {
      throw new Error(
        "usage: create ellipse <id> <cx> <cy> <rx> <ry> [fill]"
      );
    }

    const [rawId, cx, cy, rx, ry, fill] = args;
    const attributes: Record<string, string> = {
      cx: requireAttribute(cx, "ellipse cx"),
      cy: requireAttribute(cy, "ellipse cy"),
      rx: requireAttribute(rx, "ellipse rx"),
      ry: requireAttribute(ry, "ellipse ry")
    };
    if (fill !== undefined) {
      attributes["fill"] = fill;
    }

    return {
      typeName: this.typeName,
      id: requireShapeId(rawId, "ellipse"),
      attributes
    };
  }

  create(init: ShapeInit): Shape {
    assertShapeType(init, this.typeName);
    return new Ellipse({
      id: init.id,
      cx: parseFiniteNumber(init.attributes["cx"], "ellipse cx"),
      cy: parseFiniteNumber(init.attributes["cy"], "ellipse cy"),
      rx: parsePositiveNumber(init.attributes["rx"], "ellipse rx"),
      ry: parsePositiveNumber(init.attributes["ry"], "ellipse ry")
    });
  }
}
