import { describe, expect, it } from "vitest";

import { Document } from "../../src/domain/model/Document.js";
import { CanvasSize } from "../../src/domain/model/CanvasSize.js";
import { Circle } from "../../src/domain/shapes/Circle.js";
import { Ellipse } from "../../src/domain/shapes/Ellipse.js";
import { Point } from "../../src/domain/shapes/Point.js";
import { Rect } from "../../src/domain/shapes/Rect.js";
import { ShapeId } from "../../src/domain/shapes/ShapeId.js";
import { Size } from "../../src/domain/shapes/Size.js";

describe("domain value objects", () => {
  it("rejects invalid canvas, size, and point values", () => {
    expect(() => new CanvasSize(0, 600)).toThrow(
      "canvas size must be positive"
    );
    expect(() => new Size(10, -1)).toThrow("size must be positive");
    expect(() => new Point(Number.POSITIVE_INFINITY, 0)).toThrow(
      "point coordinates must be finite"
    );
  });

  it("requires a non-blank shape id", () => {
    expect(() => new ShapeId("   ")).toThrow("shape id must not be empty");
  });

  it("rejects invalid geometry at Rect construction", () => {
    expect(
      () =>
        new Rect({
          id: "r1",
          x: 0,
          y: 0,
          width: -10,
          height: 20
        })
    ).toThrow("size must be positive");
  });

  it("rejects invalid circle and ellipse dimensions", () => {
    expect(() => new Circle({ id: "c1", cx: 0, cy: 0, r: 0 })).toThrow(
      "circle radius must be positive"
    );
    expect(
      () => new Ellipse({ id: "e1", cx: 0, cy: 0, rx: 0, ry: 10 })
    ).toThrow("size must be positive");
  });

  it("does not change document dimensions when resize validation fails", () => {
    const document = new Document(800, 600);

    expect(() => document.resize(400, 0)).toThrow("size must be positive");
    expect([document.width, document.height]).toEqual([800, 600]);
  });
});
