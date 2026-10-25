import { describe, expect, it } from "vitest";

import { Document } from "../../src/domain/model/Document.js";
import { ContainerShape } from "../../src/domain/shapes/ContainerShape.js";
import { Group } from "../../src/domain/shapes/Group.js";
import { Rect } from "../../src/domain/shapes/Rect.js";
import type { ShapeAttribute, ShapeDescriptor } from "../../src/domain/shapes/ShapeDescriptor.js";

class PluginContainer extends ContainerShape {
  override get svgTagName(): string {
    return "g";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    return [];
  }

  override getAttribute(name: string): string | undefined {
    throw new Error(`unknown attribute: ${name}`);
  }

  override setAttribute(name: string): void {
    throw new Error(`unknown attribute: ${name}`);
  }

  override toDescriptor(): ShapeDescriptor {
    return { typeName: "plugin-container", id: this.id, attributes: [] };
  }
}

function rect(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number
): Rect {
  return new Rect({ id, x, y, width, height });
}

describe("Composite shape tree", () => {
  it("keeps leaf shapes and nested groups in insertion order", () => {
    const outer = new Group("g1");
    const inner = new Group("g2");
    const child = rect("r1", 0, 0, 10, 10);

    outer.addChild(inner);
    outer.addChild(child);

    expect(outer.children.map((shape) => shape.id)).toEqual(["g2", "r1"]);
  });

  it("moves every descendant when a group is moved", () => {
    const inner = new Group("g2");
    const child = rect("r1", 5, 7, 10, 20);
    inner.addChild(child);
    const outer = new Group("g1");
    outer.addChild(inner);

    outer.move(10, 20);

    expect(child.x).toBe(15);
    expect(child.y).toBe(27);
  });

  it("scales every descendant geometry when a group is scaled", () => {
    const inner = new Group("g2");
    const child = rect("r1", 10, 20, 30, 40);
    inner.addChild(child);
    const outer = new Group("g1");
    outer.addChild(inner);

    outer.scale(2);

    expect(child.x).toBe(20);
    expect(child.y).toBe(40);
    expect(child.width).toBe(60);
    expect(child.height).toBe(80);
  });

  it("rejects adding a container into its own descendant", () => {
    const outer = new Group("g1");
    const inner = new Group("g2");
    outer.addChild(inner);

    expect(() => inner.addChild(outer)).toThrow(
      "cannot group a container into its own descendant: g1"
    );
  });

  it("indexes shapes nested inside groups by id", () => {
    const group = new Group("g1");
    const child = rect("r1", 0, 0, 10, 10);
    group.addChild(child);
    const document = new Document(800, 600);

    document.addShape(group);

    expect(document.findShape("g1")).toBe(group);
    expect(document.findShape("r1")).toBe(child);
  });

  it("uses the shared container abstraction for non-Group composites", () => {
    const container = new PluginContainer("plugin1");
    const child = rect("r1", 5, 10, 20, 30);
    container.addChild(child);
    const document = new Document(800, 600);
    document.addShape(container);

    container.move(5, 5);

    expect(document.findShape("r1")).toBe(child);
    expect([child.x, child.y]).toEqual([10, 15]);
    expect([...container.walkTree()].map((shape) => shape.id)).toEqual([
      "plugin1",
      "r1"
    ]);
  });
});
