import type { EditorSession } from "../EditorSession.js";
import type { FileStore } from "../ports/FileStore.js";
import type { SvgCodec } from "../ports/SvgCodec.js";
import type { CommandResult } from "./CommandResult.js";
import type { DocumentCommand } from "./ExecutableCommand.js";
import { CommandRejectedError } from "../../shared/errors/CommandRejectedError.js";

export class ReadDocumentCommand implements DocumentCommand<EditorSession> {
  readonly kind = "document";

  constructor(
    private readonly path: string,
    private readonly files: FileStore,
    private readonly codec: SvgCodec
  ) {}

  validate(): void {}

  execute(session: EditorSession): CommandResult {
    let content: string;
    try {
      content = this.files.read(this.path);
    } catch {
      throw new CommandRejectedError(`cannot read file: ${this.path}`);
    }

    let parsed;
    try {
      parsed = this.codec.decode(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new CommandRejectedError(`invalid SVG: ${message}`);
    }

    session.replaceDocument(parsed.document, this.path);
    return {
      success: true,
      message: [
        ...parsed.warnings,
        `read ${this.path} (${parsed.document.shapeCount} elements)`
      ].join("\n"),
      affectedIds: []
    };
  }
}
