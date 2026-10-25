import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { ShowCommand } from "../../src/application/commands/ShowCommand.js";
import { TreeCommand } from "../../src/application/commands/TreeCommand.js";
import { ShapeDetailsSnapshotBuilder } from "../../src/application/queries/ShapeDetailsSnapshotBuilder.js";
import { TreeSnapshotBuilder } from "../../src/application/queries/TreeSnapshotBuilder.js";
import { Group } from "../../src/domain/shapes/Group.js";
import { Rect } from "../../src/domain/shapes/Rect.js";

function createSession(): EditorSession {
  const session = new EditorSession();
  session.initializeCanvas(400, 200);
  const group = new Group("g1");
  group.addChild(
    new Rect({ id: "r1", x: 10, y: 20, width: 30, height: 40 })
  );
  session.document?.addShape(group);
  return session;
}

describe("structured display queries", () => {
  it("returns a tree snapshot without formatting text", () => {
    const command = new TreeCommand(new TreeSnapshotBuilder());
    const result = command.execute(createSession());

    expect(result.view).toEqual({
      kind: "tree",
      snapshot: {
        width: 400,
        height: 200,
        root: null,
        roots: [
          {
            id: "g1",
            typeName: "g",
            attributes: [],
            children: [
              {
                id: "r1",
                typeName: "rect",
                attributes: [
                  { name: "x", value: "10" },
                  { name: "y", value: "20" },
                  { name: "w", value: "30" },
                  { name: "h", value: "40" }
                ],
                children: []
              }
            ]
          }
        ]
      }
    });
  });

  it("returns structured shape details and parent reference", () => {
    const command = new ShowCommand(
      "r1",
      new ShapeDetailsSnapshotBuilder()
    );
    const result = command.execute(createSession());

    expect(result.view).toEqual({
      kind: "shape-details",
      snapshot: {
        id: "r1",
        typeName: "rect",
        parent: { id: "g1", typeName: "g" },
        attributes: [
          { name: "x", value: "10" },
          { name: "y", value: "20" },
          { name: "w", value: "30" },
          { name: "h", value: "40" }
        ]
      }
    });
  });
});
