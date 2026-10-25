import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { SetAttributeCommand } from "./SetAttributeCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class SetAttributeCommandProvider
  implements CommandProvider<EditorSession>
{
  readonly name = "set";
  readonly usage = "set <id> <attribute> <value>";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    if (args.length !== 3) {
      throw new Error("usage: set <id> <attribute> <value>");
    }

    const [id, name, value] = args;
    if (id === undefined || name === undefined || value === undefined) {
      throw new Error("set id, attribute and value are required");
    }

    return new SetAttributeCommand(id, name, value);
  }
}
