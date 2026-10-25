import { describe, expect, it } from "vitest";

import { runCli } from "../support/cli.js";

describe("CLI", () => {
  it("starts the editor and exits cleanly at end of input", async () => {
    const result = await runCli();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "svg-editor 0.1 — type 'help' for commands"
    );
    expect(result.stdout).toContain("svg> ");
  });

  it("creates the default canvas with the init command", async () => {
    const result = await runCli("init\n");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("canvas 800x600 created");
  });

  it("creates a rectangle and includes it in the document tree", async () => {
    const result = await runCli(
      [
        "init",
        "create rect r1 10 20 100 50 #f00",
        "tree"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("rect#r1 created");
    expect(result.stdout).toContain("svg (800x600)");
    expect(result.stdout).toMatch(
      /rect#r1\s+x=10 y=20 w=100 h=50 fill=#f00/
    );
  });

  it("undoes and redoes a created rectangle", async () => {
    const result = await runCli(
      [
        "init",
        "create rect r1 10 20 100 50 #f00",
        "undo",
        "tree",
        "redo",
        "tree"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("rect#r1 created");
    expect(result.stdout).not.toContain("error: unknown command");

    const renderedRectRows =
      result.stdout.match(
        /[└├]── rect#r1\s+x=10 y=20 w=100 h=50 fill=#f00/g
      ) ?? [];
    expect(renderedRectRows).toHaveLength(1);
  });

  it("renders nested groups and a selected subtree with tree", async () => {
    const result = await runCli(
      [
        "init 400 200",
        "create rect outside 0 0 20 20",
        "create g node1",
        "create circle c1 10 20 5 red in node1",
        "tree",
        "tree node1"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      [
        "svg (400x200)",
        "├── rect#outside x=0 y=0 w=20 h=20",
        "└── g#node1",
        "    └── circle#c1 cx=10 cy=20 r=5 fill=red"
      ].join("\n")
    );
    expect(result.stdout).toContain(
      [
        "svg> g#node1",
        "└── circle#c1 cx=10 cy=20 r=5 fill=red"
      ].join("\n")
    );
  });

  it("shows a shape, its parent and its attributes", async () => {
    const result = await runCli(
      [
        "init",
        "create g node1",
        "create circle c1 10 20 5 red in node1",
        "show c1"
      ].join("\n")
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("circle#c1 parent=g#node1");
    expect(result.stdout).toContain("cx=10 cy=20 r=5");
    expect(result.stdout).toContain("fill=red");
  });

  it("lists command syntax with help", async () => {
    const result = await runCli("help\n");

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("init [width] [height]");
    expect(result.stdout).toContain("create <type> <id>");
    expect(result.stdout).toContain("move <id> <dx> <dy>");
    expect(result.stdout).toContain("group <newGroupId>");
    expect(result.stdout).toContain("undo");
  });
});
