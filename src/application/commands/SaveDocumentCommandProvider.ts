import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import type { FileStore } from "../ports/FileStore.js";
import type { SvgCodec } from "../ports/SvgCodec.js";
import type { DocumentCommand } from "./ExecutableCommand.js";
import { SaveDocumentCommand } from "./SaveDocumentCommand.js";

export class SaveDocumentCommandProvider
  implements CommandProvider<EditorSession>
{
  readonly name = "save";
  readonly usage = "save [file.svg]";

  constructor(
    private readonly files: FileStore,
    private readonly codec: SvgCodec
  ) {}

  create(args: readonly string[]): DocumentCommand<EditorSession> {
    if (args.length > 1) {
      throw new Error(`usage: ${this.usage}`);
    }
    return new SaveDocumentCommand(args[0], this.files, this.codec);
  }
}
