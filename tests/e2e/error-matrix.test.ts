import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "../support/cli.js";

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "svg-errors-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe("standard error matrix", () => {
  it.each([
    {
      name: "duplicate id",
      input: [
        "init",
        "create rect r1 0 0 10 10",
        "create rect r1 0 0 10 10"
      ].join("\n"),
      error: "error: id already exists: r1"
    },
    {
      name: "missing shape",
      input: "init\nmove r9 1 1",
      error: "error: no such shape: r9"
    },
    {
      name: "missing container",
      input: "init\ncreate rect r1 0 0 10 10 in node9",
      error: "error: no such container: node9"
    },
    {
      name: "non-container target",
      input: [
        "init",
        "create rect r1 0 0 10 10",
        "create rect r2 0 0 10 10 in r1"
      ].join("\n"),
      error: "error: not a container: r1"
    },
    {
      name: "unknown shape type",
      input: "init\ncreate hexagon h1 0 0 10",
      error: "error: unknown shape type: hexagon (is the plugin loaded?)"
    },
    {
      name: "group container with descendant",
      input: [
        "init",
        "create g g1",
        "create g g2 in g1",
        "group bad g1 g2"
      ].join("\n"),
      error:
        "error: cannot group a container into its own descendant: g1"
    },
    {
      name: "ungroup top-level container",
      input: "init\ncreate g g1\nungroup g1",
      error: "error: cannot ungroup top-level container: g1"
    },
    {
      name: "non-positive scale",
      input: "init\ncreate rect r1 0 0 10 10\nscale r1 0",
      error: "error: scale factor must be positive"
    },
    {
      name: "command before document",
      input: "tree",
      error: "error: no document. use 'init' or 'read' first"
    },
    {
      name: "undo before document",
      input: "undo",
      error: "error: no document. use 'init' or 'read' first"
    },
    {
      name: "redo before document",
      input: "redo",
      error: "error: no document. use 'init' or 'read' first"
    },
    {
      name: "unknown command",
      input: "unknown",
      error: "error: unknown command: unknown"
    }
  ])("reports $name", async ({ input, error }) => {
    const result = await runCli(input);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(error);
  });

  it("reports file read and write failures", async () => {
    const missingPath = join(directory, "missing.svg");
    const readResult = await runCli(`read ${missingPath}`);
    expect(readResult.stdout).toContain(
      `error: cannot read file: ${missingPath}`
    );

    const writeResult = await runCli(
      ["init", `save ${directory}`].join("\n")
    );
    expect(writeResult.stdout).toContain(
      `error: cannot write file: ${directory}`
    );
  });
});
