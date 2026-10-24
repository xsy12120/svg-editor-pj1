import type { EditorSession } from "../EditorSession.js";
import type { CommandResult } from "./CommandResult.js";
import type { DocumentCommand } from "./ExecutableCommand.js";

export class InitDocumentCommand implements DocumentCommand<EditorSession> {
  readonly kind = "document";

  constructor(
    private readonly width: number,
    private readonly height: number
  ) {}

  validate(): void {
    if (!Number.isFinite(this.width) || this.width <= 0) {
      throw new Error("canvas width must be a positive number");
    }

    if (!Number.isFinite(this.height) || this.height <= 0) {
      throw new Error("canvas height must be a positive number");
    }
  }

  execute(session: EditorSession): CommandResult {
    session.initializeCanvas(this.width, this.height);

    return {
      success: true,
      message: `canvas ${this.width}x${this.height} created`,
      affectedIds: []
    };
  }
}
