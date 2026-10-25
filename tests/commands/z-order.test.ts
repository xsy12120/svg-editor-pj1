import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { ZOrderCommand } from "../../src/application/commands/ZOrderCommand.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { Rect } from "../../src/domain/shapes/Rect.js";

function rect(id: string): Rect {
  return new Rect({ id, x: 0, y: 0, width: 10, height: 10 });
}

function orderedIds(session: EditorSession): string[] {
  return session.document?.shapes.map((shape) => shape.id) ?? [];
}

describe("front and back commands", () => {
  it("moves a shape to the front and restores its original position", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const invoker = new CommandInvoker(session);
    session.document?.addShape(rect("r1"));
    session.document?.addShape(rect("r2"));
    session.document?.addShape(rect("r3"));

    invoker.execute(new ZOrderCommand("r1", "front"));
    expect(orderedIds(session)).toEqual(["r2", "r3", "r1"]);

    invoker.undo();
    expect(orderedIds(session)).toEqual(["r1", "r2", "r3"]);

    invoker.redo();
    expect(orderedIds(session)).toEqual(["r2", "r3", "r1"]);
  });

  it("moves a shape to the back and restores its original position", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const invoker = new CommandInvoker(session);
    session.document?.addShape(rect("r1"));
    session.document?.addShape(rect("r2"));
    session.document?.addShape(rect("r3"));

    invoker.execute(new ZOrderCommand("r3", "back"));
    expect(orderedIds(session)).toEqual(["r3", "r1", "r2"]);

    invoker.undo();
    expect(orderedIds(session)).toEqual(["r1", "r2", "r3"]);
  });
});
