import { describe, expect, it } from "vitest";

import { CircleProvider } from "../../src/application/shapes/providers/CircleProvider.js";
import { EllipseProvider } from "../../src/application/shapes/providers/EllipseProvider.js";
import { GroupProvider } from "../../src/application/shapes/providers/GroupProvider.js";
import { LineProvider } from "../../src/application/shapes/providers/LineProvider.js";
import { TextProvider } from "../../src/application/shapes/providers/TextProvider.js";
import { ShapeFactory } from "../../src/application/shapes/ShapeFactory.js";

function createShapeFactory(): ShapeFactory {
  const factory = new ShapeFactory();
  factory.register(new CircleProvider());
  factory.register(new EllipseProvider());
  factory.register(new LineProvider());
  factory.register(new TextProvider());
  factory.register(new GroupProvider());
  return factory;
}

describe("basic shape creation", () => {
  it("creates a circle", () => {
    const shape = createShapeFactory().createFromCliArgs(
      "circle",
      ["c1", "10", "20", "5", "red"]
    );

    expect(shape.toDescriptor()).toEqual({
      typeName: "circle",
      id: "c1",
      attributes: [
        { name: "cx", value: "10" },
        { name: "cy", value: "20" },
        { name: "r", value: "5" },
        { name: "fill", value: "red" }
      ]
    });
  });

  it("creates an ellipse", () => {
    const shape = createShapeFactory().createFromCliArgs(
      "ellipse",
      ["e1", "10", "20", "30", "15", "#0f0"]
    );

    expect(shape.toDescriptor()).toEqual({
      typeName: "ellipse",
      id: "e1",
      attributes: [
        { name: "cx", value: "10" },
        { name: "cy", value: "20" },
        { name: "rx", value: "30" },
        { name: "ry", value: "15" },
        { name: "fill", value: "#0f0" }
      ]
    });
  });

  it("creates a line", () => {
    const shape = createShapeFactory().createFromCliArgs(
      "line",
      ["l1", "1", "2", "30", "40", "black"]
    );

    expect(shape.toDescriptor()).toEqual({
      typeName: "line",
      id: "l1",
      attributes: [
        { name: "x1", value: "1" },
        { name: "y1", value: "2" },
        { name: "x2", value: "30" },
        { name: "y2", value: "40" },
        { name: "stroke", value: "black" }
      ]
    });
  });

  it("creates text", () => {
    const shape = createShapeFactory().createFromCliArgs(
      "text",
      ["t1", "10", "20", "My Diagram"]
    );

    expect(shape.toDescriptor()).toEqual({
      typeName: "text",
      id: "t1",
      attributes: [
        { name: "x", value: "10" },
        { name: "y", value: "20" },
        { name: "text", value: "My Diagram" }
      ]
    });
  });

  it("creates an empty group", () => {
    const shape = createShapeFactory().createFromCliArgs("g", ["g1"]);

    expect(shape.toDescriptor()).toEqual({
      typeName: "g",
      id: "g1",
      attributes: []
    });
  });
});
