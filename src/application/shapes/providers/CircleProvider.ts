import { Circle } from "../../../domain/shapes/Circle.js";
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

export class CircleProvider implements ShapeProvider {
  readonly typeName = "circle";

  createFromCliArgs(args: readonly string[]): ShapeInit {
    if (args.length < 4 || args.length > 5) {
      throw new Error("usage: create circle <id> <cx> <cy> <r> [fill]");
    }

    const [rawId, cx, cy, r, fill] = args;
    const attributes: Record<string, string> = {
      cx: requireAttribute(cx, "circle cx"),
      cy: requireAttribute(cy, "circle cy"),
      r: requireAttribute(r, "circle r")
    };
    if (fill !== undefined) {
      attributes["fill"] = fill;
    }

    return {
      typeName: this.typeName,
      id: requireShapeId(rawId, "circle"),
      attributes
    };
  }

  create(init: ShapeInit): Shape {
    assertShapeType(init, this.typeName);
    return new Circle({
      id: init.id,
      cx: parseFiniteNumber(init.attributes["cx"], "circle cx"),
      cy: parseFiniteNumber(init.attributes["cy"], "circle cy"),
      r: parsePositiveNumber(init.attributes["r"], "circle r"),
      ...(init.attributes["fill"] === undefined
        ? {}
        : { fill: init.attributes["fill"] })
    });
  }
}
