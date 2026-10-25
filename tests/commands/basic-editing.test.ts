import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { CreateShapeCommand } from "../../src/application/commands/CreateShapeCommand.js";
import { DeleteShapeCommand } from "../../src/application/commands/DeleteShapeCommand.js";
import { MoveShapeCommand } from "../../src/application/commands/MoveShapeCommand.js";
import { ScaleShapeCommand } from "../../src/application/commands/ScaleShapeCommand.js";
import { SetAttributeCommand } from "../../src/application/commands/SetAttributeCommand.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { RectProvider } from "../../src/application/shapes/providers/RectProvider.js";
import { ShapeFactory } from "../../src/application/shapes/ShapeFactory.js";
import { Group } from "../../src/domain/shapes/Group.js";
import { Rect } from "../../src/domain/shapes/Rect.js";

interface Harness {
  readonly session: EditorSession;
  readonly invoker: CommandInvoker<EditorSession>;
  readonly shapes: ShapeFactory;
}

function createHarness(): Harness {
  const session = new EditorSession();
  session.initializeCanvas(800, 600);
  const shapes = new ShapeFactory();
  shapes.register(new RectProvider());

  return {
    session,
    invoker: new CommandInvoker(session),
    shapes
  };
}

function addRect(harness: Harness): Rect {
  harness.invoker.execute(
    new CreateShapeCommand(
      harness.shapes,
      "rect",
      ["r1", "10", "20", "100", "50", "#f00"]
    )
  );

  const shape = harness.session.document?.findShape("r1");
  if (!(shape instanceof Rect)) {
    throw new Error("rect fixture was not created");
  }
  return shape;
}

describe("basic editing commands", () => {
  it("moves a rectangle and restores it through undo and redo", () => {
    const harness = createHarness();
    const shape = addRect(harness);

    const result = harness.invoker.execute(new MoveShapeCommand("r1", 10, 20));
    expect(result.message).toBe("rect#r1 moved to (20,40)");
    expect([shape.x, shape.y]).toEqual([20, 40]);

    harness.invoker.undo();
    expect([shape.x, shape.y]).toEqual([10, 20]);

    harness.invoker.redo();
    expect([shape.x, shape.y]).toEqual([20, 40]);
  });

  it("scales rectangle geometry and restores the exact original values", () => {
    const harness = createHarness();
    const shape = addRect(harness);

    harness.invoker.execute(new ScaleShapeCommand("r1", 2));
    expect([shape.x, shape.y, shape.width, shape.height]).toEqual([
      20,
      40,
      200,
      100
    ]);

    harness.invoker.undo();
    expect([shape.x, shape.y, shape.width, shape.height]).toEqual([
      10,
      20,
      100,
      50
    ]);

    harness.invoker.redo();
    expect([shape.x, shape.y, shape.width, shape.height]).toEqual([
      20,
      40,
      200,
      100
    ]);
  });

  it("rejects a non-positive scale factor without changing history", () => {
    const harness = createHarness();
    const shape = addRect(harness);

    expect(() =>
      harness.invoker.execute(new ScaleShapeCommand("r1", 0))
    ).toThrow("scale factor must be positive");

    harness.invoker.undo();
    expect(harness.session.document?.findShape("r1")).toBeUndefined();
    expect(shape.width).toBe(100);
  });

  it("sets a rectangle attribute and restores its previous value", () => {
    const harness = createHarness();
    const shape = addRect(harness);

    harness.invoker.execute(new SetAttributeCommand("r1", "fill", "blue"));
    expect(shape.fill).toBe("blue");

    harness.invoker.undo();
    expect(shape.fill).toBe("#f00");

    harness.invoker.redo();
    expect(shape.fill).toBe("blue");
  });

  it("deletes a rectangle and restores it through undo and redo", () => {
    const harness = createHarness();
    const shape = addRect(harness);

    harness.invoker.execute(new DeleteShapeCommand("r1"));
    expect(harness.session.document?.findShape("r1")).toBeUndefined();

    harness.invoker.undo();
    expect(harness.session.document?.findShape("r1")).toBe(shape);

    harness.invoker.redo();
    expect(harness.session.document?.findShape("r1")).toBeUndefined();
  });

  it("moves every descendant when a group is moved", () => {
    const harness = createHarness();
    const group = new Group("g1");
    const child = new Rect({
      id: "r1",
      x: 10,
      y: 20,
      width: 100,
      height: 50
    });
    group.addChild(child);
    harness.session.document?.addShape(group);

    const result = harness.invoker.execute(new MoveShapeCommand("g1", 5, 15));
    expect(result.message).toBe("g#g1 moved by (5,15)");
    expect([child.x, child.y]).toEqual([15, 35]);

    harness.invoker.undo();
    expect([child.x, child.y]).toEqual([10, 20]);
  });
});
