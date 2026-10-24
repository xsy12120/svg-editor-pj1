import { Rect } from "../../../domain/shapes/Rect.js";
import type { Shape } from "../../../domain/shapes/Shape.js";
import type { ShapeProvider } from "../ShapeProvider.js";

export class RectProvider implements ShapeProvider {
  readonly typeName = "rect";

  create(args: readonly string[]): Shape {
    if (args.length < 5 || args.length > 6) {
      throw new Error(
        "usage: create rect <id> <x> <y> <width> <height> [fill]"
      );
    }

    const [id, rawX, rawY, rawWidth, rawHeight, fill] = args;
    if (id === undefined || id.length === 0) {
      throw new Error("rect id is required");
    }

    const x = this.parseNumber(rawX, "rect x");
    const y = this.parseNumber(rawY, "rect y");
    const width = this.parseNumber(rawWidth, "rect width");
    const height = this.parseNumber(rawHeight, "rect height");
    if (width <= 0) {
      throw new Error("rect width must be positive");
    }
    if (height <= 0) {
      throw new Error("rect height must be positive");
    }

    return new Rect({
      id,
      x,
      y,
      width,
      height,
      ...(fill === undefined ? {} : { fill })
    });
  }

  private parseNumber(value: string | undefined, name: string): number {
    if (value === undefined) {
      throw new Error(`${name} is required`);
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${name} must be a finite number`);
    }

    return parsed;
  }
}
