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

let directory: string;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "svg-transcript-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe("Phase 1 full transcript", () => {
  it("runs the documented editing session and then reads an external SVG", async () => {
    const demoPath = join(directory, "demo.svg");
    const otherPath = join(directory, "other.svg");
    await writeFile(
      otherPath,
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">',
        '  <rect x="0" y="0" width="400" height="300" fill="#ffffff"/>',
        '  <text id="t1" x="10" y="290">imported</text>',
        '  <circle id="c1" cx="50" cy="50" r="10"/>',
        '  <g id="g1">',
        '    <rect id="r2" x="0" y="0" width="10" height="10"/>',
        '    <circle id="c2" cx="5" cy="5" r="2"/>',
        "  </g>",
        '  <ellipse id="e1" cx="1" cy="2" rx="3" ry="4"/>',
        "</svg>"
      ].join("\n")
    );

    const result = await runCli(
      [
        "init 800 600",
        "create rect bg 0 0 800 600 #ffffff",
        'create text title 20 40 "My Diagram"',
        "create circle c1 100 100 20 red",
        "create rect box 200 80 60 60 #3366ff",
        "group markers c1 box",
        "tree",
        "move c1 30 0",
        "undo",
        "redo",
        'set title text "My Diagram v2"',
        "undo",
        "group bad c1 markers",
        "delete box",
        "undo",
        `save ${demoPath}`,
        "undo",
        `read ${otherPath}`,
        "tree"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("canvas 800x600 created");
    expect(result.stdout).toContain("g#markers created with 2 children");
    expect(result.stdout).toContain(
      [
        "svg (800x600)",
        "├── rect#bg x=0 y=0 w=800 h=600 fill=#ffffff",
        '├── text#title (20,40) "My Diagram"',
        "└── g#markers",
        "    ├── circle#c1 cx=100 cy=100 r=20 fill=red",
        "    └── rect#box x=200 y=80 w=60 h=60 fill=#3366ff"
      ].join("\n")
    );
    expect(result.stdout).toContain("circle#c1 moved to (130,100)");
    expect(result.stdout).toContain("circle#c1 moved back to (100,100)");
    expect(result.stdout).toContain('text#title updated: text="My Diagram v2"');
    expect(result.stdout).toContain('text#title updated: text="My Diagram"');
    expect(result.stdout).toContain(
      "error: cannot group a container into its own descendant: markers"
    );
    expect(result.stdout).toContain("rect#box restored into g#markers");
    expect(result.stdout).toContain(`saved to ${demoPath} (5 elements)`);
    expect(result.stdout).toContain(
      "error: undo not allowed after io command"
    );
    expect(result.stdout).toContain(
      "warning: assigned id rect1 to unnamed <rect>"
    );
    expect(result.stdout).toContain(`read ${otherPath} (7 elements)`);
    expect(result.stdout).toContain(
      [
        "svg (400x300)",
        "├── rect#rect1 x=0 y=0 w=400 h=300 fill=#ffffff",
        '├── text#t1 (10,290) "imported"',
        "├── circle#c1 cx=50 cy=50 r=10",
        "├── g#g1",
        "│   ├── rect#r2 x=0 y=0 w=10 h=10",
        "│   └── circle#c2 cx=5 cy=5 r=2",
        "└── ellipse#e1 cx=1 cy=2 rx=3 ry=4"
      ].join("\n")
    );

    const saved = await readFile(demoPath, "utf8");
    expect(saved).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(saved).toContain('<g id="markers">');
  });
});
