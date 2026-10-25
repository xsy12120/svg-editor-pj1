import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { GroupCommand } from "../../src/application/commands/GroupCommand.js";
import { UngroupCommand } from "../../src/application/commands/UngroupCommand.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { ContainerShape } from "../../src/domain/shapes/ContainerShape.js";
import { Group } from "../../src/domain/shapes/Group.js";
import { Rect } from "../../src/domain/shapes/Rect.js";
import type {
  ShapeAttribute,
  ShapeDescriptor
} from "../../src/domain/shapes/ShapeDescriptor.js";

class NonUngroupableContainer extends ContainerShape {
  override get canUngroup(): boolean {
    return false;
  }

  override get svgTagName(): string {
    return "g";
  }

  override toSvgAttributes(): readonly ShapeAttribute[] {
    return [{ name: "data-kind", value: "plugin" }];
  }

  override getAttribute(name: string): string | undefined {
    throw new Error(`unknown attribute: ${name}`);
  }

  override setAttribute(name: string): void {
    throw new Error(`unknown attribute: ${name}`);
  }

  override toDescriptor(): ShapeDescriptor {
    return {
      typeName: "plugin",
      id: this.id,
      attributes: [{ name: "data-kind", value: "plugin" }]
    };
  }
}

function createHarness() {
  const session = new EditorSession();
  session.initializeCanvas(800, 600);
  return {
    session,
    invoker: new CommandInvoker(session)
  };
}

function rect(id: string): Rect {
  return new Rect({ id, x: 0, y: 0, width: 10, height: 10 });
}

describe("group and ungroup commands", () => {
  it("groups root shapes in the requested order", () => {
    const { session, invoker } = createHarness();
    const r1 = rect("r1");
    const r2 = rect("r2");
    session.document?.addShape(r1);
    session.document?.addShape(r2);

    const result = invoker.execute(
      new GroupCommand("cluster", ["r2", "r1"])
    );
    expect(result.message).toBe("g#cluster created with 2 children");

    const cluster = session.document?.findShape("cluster");
    expect(cluster).toBeInstanceOf(Group);
    expect((cluster as Group).children.map((shape) => shape.id)).toEqual([
      "r2",
      "r1"
    ]);
    expect(session.document?.findShape("r1")).toBe(r1);
    expect(session.document?.findShape("r2")).toBe(r2);
  });

  it("restores every member to its original parent and index", () => {
    const { session, invoker } = createHarness();
    const before = rect("before");
    const first = rect("first");
    const after = rect("after");
    session.document?.addShape(before);
    session.document?.addShape(first);
    session.document?.addShape(after);

    invoker.execute(new GroupCommand("cluster", ["first"]));
    const undoResult = invoker.undo();
    expect(undoResult.message).toBe("g#cluster ungrouped");

    expect(session.document?.shapes.map((shape) => shape.id)).toEqual([
      "before",
      "first",
      "after"
    ]);
    expect(session.document?.findShape("cluster")).toBeUndefined();
  });

  it("rejects grouping a container together with its descendant", () => {
    const { session, invoker } = createHarness();
    const outer = new Group("g1");
    const inner = new Group("g2");
    outer.addChild(inner);
    session.document?.addShape(outer);

    expect(() =>
      invoker.execute(new GroupCommand("bad", ["g1", "g2"]))
    ).toThrow("cannot group a container into its own descendant: g1");
  });

  it("promotes children when a nested group is ungrouped", () => {
    const { session, invoker } = createHarness();
    const root = new Group("root");
    const nested = new Group("nested");
    const r1 = rect("r1");
    const r2 = rect("r2");
    nested.addChild(r1);
    nested.addChild(r2);
    root.addChild(nested);
    session.document?.addShape(root);

    const result = invoker.execute(new UngroupCommand("nested"));
    expect(result.message).toBe("g#nested ungrouped");

    expect(root.children.map((shape) => shape.id)).toEqual(["r1", "r2"]);
    expect(session.document?.findShape("nested")).toBeUndefined();

    const undoResult = invoker.undo();
    expect(undoResult.message).toBe("g#nested restored");
    const restored = root.children[0];
    expect(restored).toBeInstanceOf(Group);
    expect((restored as Group).children.map((shape) => shape.id)).toEqual([
      "r1",
      "r2"
    ]);
  });

  it("rejects ungrouping a top-level container", () => {
    const { session, invoker } = createHarness();
    session.document?.addShape(new Group("scene"));

    expect(() => invoker.execute(new UngroupCommand("scene"))).toThrow(
      "cannot ungroup top-level container: scene"
    );
  });

  it("rejects ungrouping a composite plugin container", () => {
    const { session, invoker } = createHarness();
    const root = new Group("root");
    const plugin = new NonUngroupableContainer("plugin1");
    plugin.addChild(rect("r1"));
    root.addChild(plugin);
    session.document?.addShape(root);

    expect(() => invoker.execute(new UngroupCommand("plugin1"))).toThrow(
      "cannot ungroup composite shape: plugin1"
    );
  });
});
