import { Text } from "../../../domain/shapes/Text.js";
import type { Shape } from "../../../domain/shapes/Shape.js";
import type { ShapeInit } from "../ShapeInit.js";
import type { ShapeProvider } from "../ShapeProvider.js";
import {
  applyStyleAttributes,
  assertShapeType,
  parseFiniteNumber,
  requireAttribute,
  requireShapeId
} from "./ShapeProviderSupport.js";

export class TextProvider implements ShapeProvider {
  readonly typeName = "text";

  createFromCliArgs(args: readonly string[]): ShapeInit {
    if (args.length !== 4) {
      throw new Error('usage: create text <id> <x> <y> "<content>"');
    }

    const [rawId, x, y, content] = args;
    return {
      typeName: this.typeName,
      id: requireShapeId(rawId, "text"),
      attributes: {
        x: requireAttribute(x, "text x"),
        y: requireAttribute(y, "text y"),
        text: requireAttribute(content, "text content")
      }
    };
  }

  create(init: ShapeInit): Shape {
    assertShapeType(init, this.typeName);
    const shape = new Text({
      id: init.id,
      x: parseFiniteNumber(init.attributes["x"], "text x"),
      y: parseFiniteNumber(init.attributes["y"], "text y"),
      content: requireAttribute(init.attributes["text"], "text content")
    });
    return applyStyleAttributes(shape, init);
  }
}
