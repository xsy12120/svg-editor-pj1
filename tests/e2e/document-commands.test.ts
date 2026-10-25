import {
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runCli } from "../support/cli.js";

let workingDirectory: string;

beforeEach(async () => {
  workingDirectory = await mkdtemp(join(tmpdir(), "svg-editor-"));
});

afterEach(async () => {
  await rm(workingDirectory, { recursive: true, force: true });
});

describe("canvas command", () => {
  it("shows and updates the canvas dimensions", async () => {
    const result = await runCli(
      ["init 800 600", "canvas", "canvas 400 200", "canvas"].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("canvas 800x600\n");
    expect(result.stdout).toContain("canvas 400x200 updated");
    expect(result.stdout).toMatch(/canvas 400x200\n/);
  });
});

describe("SVG document commands", () => {
  it("saves and reads a nested document without losing structure", async () => {
    const path = join(workingDirectory, "round-trip.svg");
    const result = await runCli(
      [
        "init 400 200",
        "create g node1",
        "create rect r1 10 20 100 50 #f00 in node1",
        `save ${path}`,
        "init",
        `read ${path}`,
        "tree"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`saved to ${path}`);
    expect(result.stdout).toContain(`read ${path}`);
    expect(result.stdout).toContain(
      [
        "svg (400x200)",
        "└── g#node1",
        "    └── rect#r1 x=10 y=20 w=100 h=50 fill=#f00"
      ].join("\n")
    );

    const svg = await readFile(path, "utf8");
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('<g id="node1">');
    expect(svg).toContain('<rect id="r1"');
  });

  it("assigns missing ids and saves back to the read path by default", async () => {
    const path = join(workingDirectory, "unnamed.svg");
    await writeFile(
      path,
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">',
        '  <rect x="0" y="0" width="400" height="300" fill="#fff"/>',
        "</svg>"
      ].join("\n")
    );

    const result = await runCli(
      [`read ${path}`, "tree", "save"].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "warning: assigned id rect1 to unnamed <rect>"
    );
    expect(result.stdout).toContain(
      "rect#rect1 x=0 y=0 w=400 h=300 fill=#fff"
    );
    expect(result.stdout).toContain(`saved to ${path}`);

    const saved = await readFile(path, "utf8");
    expect(saved).toContain('<rect id="rect1"');
  });

  it("normalizes nested translate and scale transforms while reading SVG", async () => {
    const path = join(workingDirectory, "transformed.svg");
    await writeFile(
      path,
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">',
        '  <g id="outer" transform="translate(60,40)">',
        '    <g id="inner" transform="translate(200,0) scale(0.8)">',
        '      <rect id="r1" x="10" y="0" width="100" height="50"/>',
        "    </g>",
        "  </g>",
        "</svg>"
      ].join("\n")
    );

    const result = await runCli(`read ${path}\ntree`);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "rect#r1 x=268 y=40 w=80 h=40"
    );
  });

  it("keeps the current document when reading a missing file fails", async () => {
    const missingPath = join(workingDirectory, "missing.svg");
    const result = await runCli(
      [
        "init",
        "create rect r1 10 20 100 50",
        `read ${missingPath}`,
        "tree"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`error: cannot read file: ${missingPath}`);
    expect(result.stdout).toContain(
      "rect#r1 x=10 y=20 w=100 h=50"
    );
  });
});
