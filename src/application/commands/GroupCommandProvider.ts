import type { EditorSession } from "../EditorSession.js";
import type { CommandProvider } from "../extensions/CommandProvider.js";
import { GroupCommand } from "./GroupCommand.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class GroupCommandProvider implements CommandProvider<EditorSession> {
  readonly name = "group";

  create(args: readonly string[]): UndoableCommand<EditorSession> {
    const [groupId, ...memberIds] = args;
    if (groupId === undefined || memberIds.length === 0) {
      throw new Error("usage: group <newGroupId> <shapeId> [shapeId...]");
    }

    return new GroupCommand(groupId, memberIds);
  }
}
