import type { ShapeAttribute } from "./ShapeDescriptor.js";

export class ShapeStyle {
  private fillValue: string | undefined;
  private strokeValue: string | undefined;
  private strokeWidthValue: string | undefined;

  isSupported(name: string): boolean {
    return name === "fill" || name === "stroke" || name === "stroke-width";
  }

  get(name: string): string | undefined {
    switch (name) {
      case "fill":
        return this.fillValue;
      case "stroke":
        return this.strokeValue;
      case "stroke-width":
        return this.strokeWidthValue;
      default:
        return undefined;
    }
  }

  set(name: string, value: string | undefined): boolean {
    switch (name) {
      case "fill":
        this.fillValue = value;
        return true;
      case "stroke":
        this.strokeValue = value;
        return true;
      case "stroke-width":
        if (value !== undefined) {
          const parsed = Number(value);
          if (!Number.isFinite(parsed) || parsed <= 0) {
            throw new Error("stroke-width must be a positive number");
          }
        }
        this.strokeWidthValue = value;
        return true;
      default:
        return false;
    }
  }

  toAttributes(): ShapeAttribute[] {
    const attributes: ShapeAttribute[] = [];
    if (this.fillValue !== undefined) {
      attributes.push({ name: "fill", value: this.fillValue });
    }
    if (this.strokeValue !== undefined) {
      attributes.push({ name: "stroke", value: this.strokeValue });
    }
    if (this.strokeWidthValue !== undefined) {
      attributes.push({ name: "stroke-width", value: this.strokeWidthValue });
    }
    return attributes;
  }
}
