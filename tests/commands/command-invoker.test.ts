import { describe, expect, it } from "vitest";

import { CommandInvoker } from "../../src/application/history/CommandInvoker.js";
import type { CommandResult } from "../../src/application/commands/CommandResult.js";
import type { UndoableCommand } from "../../src/application/commands/UndoableCommand.js";

interface CounterState {
  value: number;
}

function success(message: string): CommandResult {
  return {
    success: true,
    message,
    affectedIds: []
  };
}

class AddCommand implements UndoableCommand<CounterState> {
  readonly kind = "edit";

  constructor(private readonly amount: number) {}

  validate(): void {
    if (this.amount <= 0) {
      throw new Error("amount must be positive");
    }
  }

  execute(state: CounterState): CommandResult {
    state.value += this.amount;
    return success(`added ${this.amount}`);
  }

  undo(state: CounterState): CommandResult {
    state.value -= this.amount;
    return success(`removed ${this.amount}`);
  }
}

class InvalidCommand implements UndoableCommand<CounterState> {
  readonly kind = "edit";

  validate(): void {
    throw new Error("invalid command");
  }

  execute(): CommandResult {
    throw new Error("execute must not run after validation fails");
  }

  undo(): CommandResult {
    throw new Error("undo must not run for an invalid command");
  }
}

class FailingUndoCommand implements UndoableCommand<CounterState> {
  readonly kind = "edit";

  validate(): void {}

  execute(state: CounterState): CommandResult {
    state.value += 1;
    return success("failing command executed");
  }

  undo(): CommandResult {
    throw new Error("undo failed");
  }
}

class FailingRedoCommand implements UndoableCommand<CounterState> {
  readonly kind = "edit";
  private executeCount = 0;

  validate(): void {}

  execute(state: CounterState): CommandResult {
    this.executeCount += 1;
    if (this.executeCount > 1) {
      throw new Error("redo failed");
    }

    state.value += 1;
    return success("redoable command executed");
  }

  undo(state: CounterState): CommandResult {
    state.value -= 1;
    return success("redoable command undone");
  }
}

describe("CommandInvoker", () => {
  it("executes a command and supports undo and redo", () => {
    const state = { value: 0 };
    const invoker = new CommandInvoker(state);

    invoker.execute(new AddCommand(5));
    expect(state.value).toBe(5);

    invoker.undo();
    expect(state.value).toBe(0);

    invoker.redo();
    expect(state.value).toBe(5);
  });

  it("clears the redo stack after a new edit", () => {
    const state = { value: 0 };
    const invoker = new CommandInvoker(state);

    invoker.execute(new AddCommand(2));
    invoker.execute(new AddCommand(3));
    invoker.undo();
    expect(state.value).toBe(2);

    invoker.execute(new AddCommand(10));
    expect(state.value).toBe(12);

    invoker.undo();
    expect(state.value).toBe(2);
  });

  it("does not execute or record a command whose validation fails", () => {
    const state = { value: 0 };
    const invoker = new CommandInvoker(state);

    expect(() => invoker.execute(new InvalidCommand())).toThrow(
      "invalid command"
    );
    expect(state.value).toBe(0);

    invoker.execute(new AddCommand(1));
    invoker.undo();
    expect(state.value).toBe(0);
  });

  it("keeps a command on the undo stack when undo throws", () => {
    const state = { value: 0 };
    const invoker = new CommandInvoker(state);
    invoker.execute(new FailingUndoCommand());

    expect(() => invoker.undo()).toThrow("undo failed");
    expect(() => invoker.undo()).toThrow("undo failed");
  });

  it("keeps a command on the redo stack when redo throws", () => {
    const state = { value: 0 };
    const invoker = new CommandInvoker(state);
    invoker.execute(new FailingRedoCommand());
    invoker.undo();

    expect(() => invoker.redo()).toThrow("redo failed");
    expect(() => invoker.redo()).toThrow("redo failed");
  });
});
