import { readFileSync, writeFileSync } from "node:fs";

import type { FileStore } from "../../application/ports/FileStore.js";

export class NodeFileStore implements FileStore {
  read(path: string): string {
    return readFileSync(path, "utf8");
  }

  write(path: string, content: string): void {
    writeFileSync(path, content, "utf8");
  }
}
