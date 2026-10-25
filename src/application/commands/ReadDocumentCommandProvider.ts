import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { FileStore } from "../ports/FileStore.js";
import type { SvgCodec } from "../ports/SvgCodec.js";
import type { DocumentCommand } from "./ExecutableCommand.js";
import { ReadDocumentCommand } from "./ReadDocumentCommand.js";

export class ReadDocumentCommandProvider
  implements CommandProvider<EditorSession>
{
  readonly name = "read";
  readonly usage = "read <file.svg>";

  constructor(
    private readonly files: FileStore,
    private readonly codec: SvgCodec
  ) {}

  create(args: readonly string[]): DocumentCommand<EditorSession> {
    if (args.length !== 1 || args[0] === undefined) {
      throw new Error(`usage: ${this.usage}`);
    }
    return new ReadDocumentCommand(args[0], this.files, this.codec);
  }
}
