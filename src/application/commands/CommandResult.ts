import type { CommandView } from "../queries/CommandView.js";

export interface CommandResult {
  readonly success: boolean;
  readonly message: string;
  readonly affectedIds: readonly string[];
  readonly view?: CommandView;
}
