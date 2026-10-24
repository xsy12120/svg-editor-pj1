import { describe, expect, it } from "vitest";

import { RectProvider } from "../../src/application/shapes/providers/RectProvider.js";
import { ShapeFactory } from "../../src/application/shapes/ShapeFactory.js";

describe("ShapeFactory", () => {
  it("creates a rectangle from neutral shape initialization data", () => {
    const factory = new ShapeFactory();
    factory.register(new RectProvider());

    const shape = factory.create({
      typeName: "rect",
      id: "r1",
      attributes: {
        x: "10",
        y: "20",
        width: "100",
        height: "50",
        fill: "#f00"
      }
    });

    expect(shape.toDescriptor()).toEqual({
      typeName: "rect",
      id: "r1",
      attributes: [
        { name: "x", value: "10" },
        { name: "y", value: "20" },
        { name: "w", value: "100" },
        { name: "h", value: "50" },
        { name: "fill", value: "#f00" }
      ]
    });
  });
});
