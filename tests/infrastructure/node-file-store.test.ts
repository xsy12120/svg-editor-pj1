import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { NodeFileStore } from "../../src/infrastructure/fs/NodeFileStore.js";

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "svg-store-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe("NodeFileStore", () => {
  it("replaces a file without leaving temporary files", async () => {
    const path = join(directory, "document.svg");
    const store = new NodeFileStore();
    await writeFile(path, "old", "utf8");

    store.write(path, "new");

    expect(await readFile(path, "utf8")).toBe("new");
    expect(await readdir(directory)).toEqual(["document.svg"]);
  });
});
