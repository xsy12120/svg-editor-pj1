import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { AddToCommand } from "../../src/application/commands/AddToCommand.js";
import { MoveShapeCommand } from "../../src/application/commands/MoveShapeCommand.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { Group } from "../../src/domain/shapes/Group.js";
import { Rect } from "../../src/domain/shapes/Rect.js";

function rect(id: string): Rect {
  return new Rect({ id, x: 0, y: 0, width: 10, height: 10 });
}

describe("addto command", () => {
  it("moves a shape to the end of the target group", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const invoker = new CommandInvoker(session);
    const group = new Group("g1");
    const first = rect("first");
    const moved = rect("moved");
    group.addChild(first);
    session.document?.addShape(group);
    session.document?.addShape(moved);

    const result = invoker.execute(new AddToCommand("g1", "moved"));
    expect(result.message).toBe("rect#moved added to g#g1");

    expect(group.children.map((shape) => shape.id)).toEqual([
      "first",
      "moved"
    ]);
    expect(session.document?.shapes.map((shape) => shape.id)).toEqual(["g1"]);
  });

  it("restores the original parent and index through undo", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const invoker = new CommandInvoker(session);
    const group = new Group("g1");
    const before = rect("before");
    const moved = rect("moved");
    const after = rect("after");
    session.document?.addShape(before);
    session.document?.addShape(moved);
    session.document?.addShape(after);
    session.document?.addShape(group);

    invoker.execute(new AddToCommand("g1", "moved"));
    const undoResult = invoker.undo();
    expect(undoResult.message).toBe("rect#moved restored");

    expect(session.document?.shapes.map((shape) => shape.id)).toEqual([
      "before",
      "moved",
      "after",
      "g1"
    ]);
    expect(group.children).toEqual([]);
  });

  it("keeps the moved shape addressable in the document index", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const invoker = new CommandInvoker(session);
    const group = new Group("g1");
    const moved = rect("moved");
    session.document?.addShape(group);
    session.document?.addShape(moved);

    invoker.execute(new AddToCommand("g1", "moved"));

    expect(session.document?.findShape("moved")).toBe(moved);
    expect(session.document?.shapeCount).toBe(2);
    invoker.execute(new MoveShapeCommand("moved", 5, 7));
    expect([moved.x, moved.y]).toEqual([5, 7]);
  });

  it("rejects a target that is not a container", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const invoker = new CommandInvoker(session);
    const target = rect("target");
    const moved = rect("moved");
    session.document?.addShape(target);
    session.document?.addShape(moved);

    expect(() => invoker.execute(new AddToCommand("target", "moved"))).toThrow(
      "not a container: target"
    );
  });
});
