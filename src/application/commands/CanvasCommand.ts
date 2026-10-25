import type { EditorSession } from "../EditorSession.js";
import type { CommandResult } from "./CommandResult.js";
import type { DocumentCommand } from "./ExecutableCommand.js";
import { requireDocument } from "./ShapeCommandSupport.js";

export class CanvasCommand implements DocumentCommand<EditorSession> {
  readonly kind = "document";

  constructor(
    private readonly width?: number,
    private readonly height?: number
  ) {}

  validate(session: EditorSession): void {
    requireDocument(session);
    for (const dimension of [this.width, this.height]) {
      if (
        dimension !== undefined &&
        (!Number.isFinite(dimension) || dimension <= 0)
      ) {
        throw new Error("canvas dimensions must be positive");
      }
    }
  }

  execute(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    if (this.width === undefined && this.height === undefined) {
      return {
        success: true,
        message: `canvas ${document.width}x${document.height}`,
        affectedIds: []
      };
    }

    const width = this.width ?? document.width;
    const height = this.height ?? document.height;
    document.resize(width, height);
    return {
      success: true,
      message: `canvas ${width}x${height} updated`,
      affectedIds: []
    };
  }
}
