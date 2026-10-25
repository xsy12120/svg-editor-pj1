import { randomUUID } from "node:crypto";
import {
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { basename, dirname, join } from "node:path";

import type { FileStore } from "../../application/ports/FileStore.js";

export class NodeFileStore implements FileStore {
  read(path: string): string {
    return readFileSync(path, "utf8");
  }

  write(path: string, content: string): void {
    const temporaryPath = join(
      dirname(path),
      `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`
    );
    try {
      writeFileSync(temporaryPath, content, "utf8");
      renameSync(temporaryPath, path);
    } catch (error) {
      rmSync(temporaryPath, { force: true });
      throw error;
    }
  }
}
