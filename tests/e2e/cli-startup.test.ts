import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const startupTimeoutMs = 5_000;

interface ProcessResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

function runCli(): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const npmExecPath = process.env["npm_execpath"];
    if (npmExecPath === undefined) {
      reject(new Error("npm_execpath is unavailable; run this test via npm test"));
      return;
    }

    const child = spawn(process.execPath, [npmExecPath, "run", "cli"], {
      cwd: projectRoot,
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        NO_COLOR: "1"
      }
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    const finish = (callback: () => void): void => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      callback();
    };

    const timeout = setTimeout(() => {
      child.kill();
      finish(() => {
        reject(
          new Error(
            `CLI did not exit within ${startupTimeoutMs}ms\nstdout:\n${stdout}\nstderr:\n${stderr}`
          )
        );
      });
    }, startupTimeoutMs);

    child.on("error", (error) => {
      finish(() => {
        reject(error);
      });
    });

    child.on("close", (exitCode, signal) => {
      finish(() => {
        resolve({ exitCode, signal, stdout, stderr });
      });
    });

    child.stdin.end();
  });
}

describe("CLI startup", () => {
  it("starts the editor and exits cleanly at end of input", async () => {
    const result = await runCli();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      "svg-editor 0.1 — type 'help' for commands"
    );
    expect(result.stdout).toContain("svg> ");
  });
});
