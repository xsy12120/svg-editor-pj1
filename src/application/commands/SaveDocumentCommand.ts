import type { EditorSession } from "../EditorSession.js";
import type { FileStore } from "../ports/FileStore.js";
import type { SvgCodec } from "../ports/SvgCodec.js";
import type { CommandResult } from "./CommandResult.js";
import type { DocumentCommand } from "./ExecutableCommand.js";
import { requireDocument } from "./ShapeCommandSupport.js";
import { CommandRejectedError } from "../../shared/errors/CommandRejectedError.js";

export class SaveDocumentCommand implements DocumentCommand<EditorSession> {
  readonly kind = "document";

  constructor(
    private readonly requestedPath: string | undefined,
    private readonly files: FileStore,
    private readonly codec: SvgCodec
  ) {}

  validate(session: EditorSession): void {
    requireDocument(session);
    if (this.requestedPath === undefined && session.documentPath === null) {
      throw new CommandRejectedError("no file path. use 'save <file.svg>'");
    }
  }

  execute(session: EditorSession): CommandResult {
    const document = requireDocument(session);
    const path = this.requestedPath ?? session.documentPath;
    if (path === null) {
      throw new CommandRejectedError("no file path. use 'save <file.svg>'");
    }

    const content = this.codec.encode(document);
    try {
      this.files.write(path, content);
    } catch {
      throw new CommandRejectedError(`cannot write file: ${path}`);
    }
    session.setDocumentPath(path);

    return {
      success: true,
      message: `saved to ${path} (${document.shapeCount} elements)`,
      affectedIds: []
    };
  }
}
