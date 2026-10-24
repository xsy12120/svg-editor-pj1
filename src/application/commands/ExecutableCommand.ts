import type { Command } from "./Command.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export interface DocumentCommand<TContext> extends Command<TContext> {
  readonly kind: "document";
}

export interface QueryCommand<TContext> extends Command<TContext> {
  readonly kind: "query";
}

export interface ControlCommand<TContext> extends Command<TContext> {
  readonly kind: "control";
}

export type ExecutableCommand<TContext> =
  | UndoableCommand<TContext>
  | DocumentCommand<TContext>
  | QueryCommand<TContext>
  | ControlCommand<TContext>;
