import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { RedoCommand } from "../../src/application/commands/RedoCommand.js";
import { UndoCommand } from "../../src/application/commands/UndoCommand.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { CommandProcessor } from "../../src/application/history/CommandProcessor.js";

describe("undo and redo without a document", () => {
  it("return the standard no-document error", () => {
    const session = new EditorSession();
    const invoker = new CommandInvoker(session);
    const processor = new CommandProcessor(invoker);

    expect(() => processor.execute(new UndoCommand(invoker))).toThrow(
      "no document. use 'init' or 'read' first"
    );
    expect(() => processor.execute(new RedoCommand(invoker))).toThrow(
      "no document. use 'init' or 'read' first"
    );
  });
});
