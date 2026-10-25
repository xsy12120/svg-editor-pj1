import type { Shape } from "../../domain/shapes/Shape.js";

interface TranslateOperation {
  readonly type: "translate";
  readonly tx: number;
  readonly ty: number;
}

interface ScaleOperation {
  readonly type: "scale";
  readonly factor: number;
}

type TransformOperation = TranslateOperation | ScaleOperation;

export class SvgTransform {
  private constructor(
    private readonly operations: readonly TransformOperation[]
  ) {}

  static parse(source: string): SvgTransform {
    if (source.trim() === "none") {
      return new SvgTransform([]);
    }

    const operations: TransformOperation[] = [];
    const pattern = /([a-zA-Z]+)\s*\(([^)]*)\)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    while ((match = pattern.exec(source)) !== null) {
      const separator = source.slice(lastIndex, match.index);
      if (!/^[\s,]*$/.test(separator)) {
        throw new Error("invalid SVG transform syntax");
      }

      const name = match[1];
      const values = this.parseValues(match[2] ?? "");
      if (name === "translate") {
        if (values.length !== 1 && values.length !== 2) {
          throw new Error("translate requires one or two values");
        }
        operations.push({
          type: "translate",
          tx: values[0] as number,
          ty: values[1] ?? 0
        });
      } else if (name === "scale") {
        if (values.length !== 1 && values.length !== 2) {
          throw new Error("scale requires one or two values");
        }
        const factor = values[0] as number;
        if (values[1] !== undefined && values[1] !== factor) {
          throw new Error("unsupported non-uniform scale in transform");
        }
        if (factor <= 0) {
          throw new Error("transform scale must be positive");
        }
        operations.push({ type: "scale", factor });
      } else {
        throw new Error(`unsupported transform: ${name}`);
      }

      lastIndex = pattern.lastIndex;
    }

    if (operations.length === 0 || !/^[\s,]*$/.test(source.slice(lastIndex))) {
      throw new Error("invalid SVG transform syntax");
    }
    return new SvgTransform(operations);
  }

  apply(shape: Shape): void {
    for (let index = this.operations.length - 1; index >= 0; index -= 1) {
      const operation = this.operations[index];
      if (operation === undefined) {
        continue;
      }
      if (operation.type === "translate") {
        shape.move(operation.tx, operation.ty);
      } else {
        shape.scale(operation.factor);
      }
    }
  }

  private static parseValues(source: string): number[] {
    const trimmed = source.trim();
    if (trimmed.length === 0) {
      return [];
    }

    const values = trimmed.split(/[\s,]+/).map(Number);
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error("transform values must be finite numbers");
    }
    return values;
  }
}
