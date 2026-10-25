import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { CanvasCommandProvider } from "../../src/application/commands/CanvasCommandProvider.js";
import type { PreparedEdit } from "../../src/application/commands/PreparedEdit.js";
import type { UndoableCommand } from "../../src/application/commands/UndoableCommand.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { CommandProcessor } from "../../src/application/history/CommandProcessor.js";

function counterEdit(
  counter: { value: number }
): UndoableCommand<EditorSession> {
  return {
    kind: "edit",
    prepare(): PreparedEdit<EditorSession> {
      return {
        apply(): ReturnType<PreparedEdit<EditorSession>["apply"]> {
          counter.value += 1;
          return { success: true, message: "updated", affectedIds: [] };
        },
        revert(): ReturnType<PreparedEdit<EditorSession>["revert"]> {
          counter.value -= 1;
          return { success: true, message: "restored", affectedIds: [] };
        }
      };
    }
  };
}

function createHarness() {
  const session = new EditorSession();
  session.initializeCanvas(800, 600);
  const invoker = new CommandInvoker(session);
  const processor = new CommandProcessor(invoker);

  return { session, invoker, processor };
}

describe("canvas command history behavior", () => {
  it("does not reset history when dimensions are only queried", () => {
    const { invoker, processor } = createHarness();
    const counter = { value: 0 };
    processor.execute(counterEdit(counter));

    processor.execute(new CanvasCommandProvider().create([]));
    invoker.undo();

    expect(counter.value).toBe(0);
  });

  it("resets and blocks history when dimensions are changed", () => {
    const { invoker, processor } = createHarness();
    processor.execute(counterEdit({ value: 0 }));

    processor.execute(new CanvasCommandProvider().create(["400", "200"]));

    expect(() => invoker.undo()).toThrow(
      "undo not allowed after io command"
    );
  });
});
