import type { PreparedEdit } from "./PreparedEdit.js";

export interface UndoableCommand<TContext> {
  readonly kind: "edit";
  prepare(context: TContext): PreparedEdit<TContext>;
}
