import { describe, expect, it } from "vitest";

import { EditorSession } from "../../src/application/EditorSession.js";
import { CommandRegistry } from "../../src/application/extensions/CommandRegistry.js";
import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import { CommandParser } from "../../src/interfaces/cli/CommandParser.js";
import { CommandRejectedError } from "../../src/shared/errors/CommandRejectedError.js";
import { UserInputError } from "../../src/shared/errors/UserInputError.js";

describe("error taxonomy", () => {
  it("classifies unknown commands and empty history as command rejections", () => {
    const session = new EditorSession();
    session.initializeCanvas(800, 600);
    const registry = new CommandRegistry<EditorSession>();
    const invoker = new CommandInvoker(session);

    expect(() => registry.create("missing", [])).toThrow(
      CommandRejectedError
    );
    expect(() => invoker.undo()).toThrow(CommandRejectedError);
  });

  it("classifies malformed quoted input as a user input error", () => {
    expect(() => new CommandParser().parse('create text t 0 0 "x')).toThrow(
      UserInputError
    );
  });
});
