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
  directory = await mkdtemp(join(tmpdir(), "svg-acceptance-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe("project acceptance", () => {
  it("exercises the full command surface in one editing lifecycle", async () => {
    const savedPath = join(directory, "acceptance.svg");
    const externalPath = join(directory, "external.svg");
    await writeFile(
      externalPath,
      [
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">',
        '  <rect x="0" y="0" width="400" height="300"/>',
        "</svg>"
      ].join("\n")
    );

    const result = await runCli(
      [
        "help",
        "init 800 600",
        "canvas",
        "canvas 640 480",
        "canvas",
        "create rect bg 0 0 640 480 #ffffff",
        "create circle c1 100 100 20 red",
        "create ellipse e1 300 100 30 20 #00ff00",
        "create line edge 200 200 400 200 black",
        'create text title 20 40 "My Diagram"',
        "create g node1",
        "create rect child 50 60 80 40 #aabbcc in node1",
        "tree",
        "show title",
        'set title text "Updated Diagram"',
        "move c1 10 20",
        "scale c1 2",
        "front bg",
        "back bg",
        "delete e1",
        "undo",
        "redo",
        "undo",
        "group cluster c1 edge",
        "create g outer",
        "addto outer cluster",
        "ungroup cluster",
        "group bad c1 outer",
        "set c1 unknown x",
        "scale c1 0",
        "create rect bg 0 0 10 10",
        "tree",
        `save ${savedPath}`,
        "undo",
        `read ${savedPath}`,
        "tree",
        "show title",
        `read ${externalPath}`,
        "tree"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);

    expect(result.stdout).toContain("init [width] [height]");
    expect(result.stdout).toContain("canvas 640x480 updated");
    expect(result.stdout).toContain("canvas 640x480\n");
    expect(result.stdout).toContain(
      "create <type> <id> [params...] [in <containerId>]"
    );
    expect(result.stdout).toContain('text#title (20,40) "My Diagram"');
    expect(result.stdout).toContain("circle#c1");
    expect(result.stdout).toContain("ellipse#e1");
    expect(result.stdout).toContain("line#edge");
    expect(result.stdout).toContain("g#node1");
    expect(result.stdout).toContain("rect#child");

    expect(result.stdout).toContain("text#title  parent=svg");
    expect(result.stdout).toContain('text#title updated: text="Updated Diagram"');
    expect(result.stdout).toContain("circle#c1 moved to (110,120)");
    expect(result.stdout).toContain("circle#c1 scaled by 2");
    expect(result.stdout).toContain("rect#bg moved to front");
    expect(result.stdout).toContain("rect#bg moved to back");
    expect(result.stdout).toContain("ellipse#e1 deleted");
    expect(result.stdout).toContain("ellipse#e1 restored");
    expect(result.stdout).toContain("g#cluster created with 2 children");
    expect(result.stdout).toContain("g#cluster added to g#outer");
    expect(result.stdout).toContain("g#cluster ungrouped");

    expect(result.stdout).toContain(
      "error: cannot group a container into its own descendant: outer"
    );
    expect(result.stdout).toContain("error: unknown attribute: unknown");
    expect(result.stdout).toContain("error: scale factor must be positive");
    expect(result.stdout).toContain("error: id already exists: bg");
    expect(result.stdout).toContain(`saved to ${savedPath}`);
    expect(result.stdout).toContain(
      "error: undo not allowed after io command"
    );
    expect(result.stdout).toContain(`read ${savedPath}`);
    expect(result.stdout).toContain("Updated Diagram");
    expect(result.stdout).toContain(
      "warning: assigned id rect1 to unnamed <rect>"
    );
    expect(result.stdout).toContain("rect#rect1");

    const saved = await readFile(savedPath, "utf8");
    expect(saved).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(saved).toContain('<text id="title"');
    expect(saved).toContain("Updated Diagram");
    expect(saved).toContain('<g id="node1">');
    expect(saved).toContain('<g id="outer">');
  });
});
