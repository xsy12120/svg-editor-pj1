import { Rect } from "../../../domain/shapes/Rect.js";
import type { Shape } from "../../../domain/shapes/Shape.js";
import type { ShapeInit } from "../ShapeInit.js";
import type { ShapeProvider } from "../ShapeProvider.js";

export class RectProvider implements ShapeProvider {
  readonly typeName = "rect";

  createFromCliArgs(args: readonly string[]): ShapeInit {
    if (args.length < 5 || args.length > 6) {
      throw new Error(
        "usage: create rect <id> <x> <y> <width> <height> [fill]"
      );
    }

    const [id, rawX, rawY, rawWidth, rawHeight, fill] = args;
    if (id === undefined || id.length === 0) {
      throw new Error("rect id is required");
    }

    const attributes: Record<string, string> = {
      x: this.requireValue(rawX, "rect x"),
      y: this.requireValue(rawY, "rect y"),
      width: this.requireValue(rawWidth, "rect width"),
      height: this.requireValue(rawHeight, "rect height")
    };
    if (fill !== undefined) {
      attributes["fill"] = fill;
    }

    return {
      typeName: this.typeName,
      id,
      attributes
    };
  }

  create(init: ShapeInit): Shape {
    if (init.typeName !== this.typeName) {
      throw new Error(`rect provider cannot create shape type: ${init.typeName}`);
    }

    const x = this.parseNumber(init.attributes["x"], "rect x");
    const y = this.parseNumber(init.attributes["y"], "rect y");
    const width = this.parseNumber(init.attributes["width"], "rect width");
    const height = this.parseNumber(init.attributes["height"], "rect height");
    if (width <= 0) {
      throw new Error("rect width must be positive");
    }
    if (height <= 0) {
      throw new Error("rect height must be positive");
    }

    return new Rect({
      id: init.id,
      x,
      y,
      width,
      height
    });
  }

  private requireValue(value: string | undefined, name: string): string {
    if (value === undefined) {
      throw new Error(`${name} is required`);
    }

    return value;
  }

  private parseNumber(value: string | undefined, name: string): number {
    const requiredValue = this.requireValue(value, name);

    const parsed = Number(requiredValue);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${name} must be a finite number`);
    }

    return parsed;
  }
}
