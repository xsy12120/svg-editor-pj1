import { describe, expect, it } from "vitest";

import { Rect } from "../../src/domain/shapes/Rect.js";
import { SvgTransform } from "../../src/infrastructure/svg/SvgTransform.js";

describe("SvgTransform", () => {
  it("applies the transform list from right to left", () => {
    const rectangle = new Rect({
      id: "r1",
      x: 10,
      y: 5,
      width: 20,
      height: 10
    });

    SvgTransform.parse("translate(200,10) scale(2)").apply(rectangle);

    expect([
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height
    ]).toEqual([220, 20, 40, 20]);
  });

  it("rejects unsupported or geometry-changing transforms", () => {
    expect(() => SvgTransform.parse("rotate(30)")).toThrow(
      "unsupported transform: rotate"
    );
    expect(() => SvgTransform.parse("scale(2,3)")).toThrow(
      "unsupported non-uniform scale in transform"
    );
  });
});
