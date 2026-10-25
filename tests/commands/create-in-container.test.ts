import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { CreateShapeCommand } from "../../src/application/commands/CreateShapeCommand.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { GroupProvider } from "../../src/application/shapes/providers/GroupProvider.js";
import { RectProvider } from "../../src/application/shapes/providers/RectProvider.js";
import { ShapeFactory } from "../../src/application/shapes/ShapeFactory.js";
import { Group } from "../../src/domain/shapes/Group.js";
import { Rect } from "../../src/domain/shapes/Rect.js";

describe("create in container", () => {
  it("creates a rectangle inside a group and restores it to that group", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const invoker = new CommandInvoker(session);
    const shapes = new ShapeFactory();
    shapes.register(new GroupProvider());
    shapes.register(new RectProvider());

    invoker.execute(new CreateShapeCommand(shapes, "g", ["node1"]));
    invoker.execute(
      new CreateShapeCommand(
        shapes,
        "rect",
        ["start", "10", "20", "100", "50", "#f00", "in", "node1"]
      )
    );

    const group = session.document?.findShape("node1");
    const rectangle = session.document?.findShape("start");
    expect(group).toBeInstanceOf(Group);
    expect(rectangle).toBeInstanceOf(Rect);
    expect((group as Group).children).toEqual([rectangle]);

    invoker.undo();
    expect(session.document?.findShape("start")).toBeUndefined();
    expect((group as Group).children).toEqual([]);

    invoker.redo();
    expect(session.document?.findShape("start")).toBe(rectangle);
    expect((group as Group).children).toEqual([rectangle]);
  });
});
