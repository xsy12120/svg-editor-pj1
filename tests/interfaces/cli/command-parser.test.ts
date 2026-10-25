import { describe, expect, it } from "vitest";

import { CommandParser } from "../../../src/interfaces/cli/CommandParser.js";

describe("CommandParser", () => {
  const parser = new CommandParser();

  it("keeps a double-quoted argument together", () => {
    expect(
      parser.parse('create text title 20 40 "My Diagram"')
    ).toEqual({
      name: "create",
      args: ["text", "title", "20", "40", "My Diagram"]
    });
  });

  it("supports escaped double quotes inside a quoted argument", () => {
    expect(parser.parse('create text t 0 0 "say \\"hi\\""')).toEqual({
      name: "create",
      args: ["text", "t", "0", "0", 'say "hi"']
    });
  });

  it("rejects an unterminated quoted argument", () => {
    expect(() =>
      parser.parse('create text t 0 0 "not closed')
    ).toThrow("unterminated quoted argument");
  });

  it("ignores comments and blank lines", () => {
    expect(parser.parse("# init")).toBeNull();
    expect(parser.parse("   ")).toBeNull();
  });
});
