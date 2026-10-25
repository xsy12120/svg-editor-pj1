import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const startupTimeoutMs = 5_000;

export interface ProcessResult {
  readonly exitCode: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: string;
  readonly stderr: string;
}

interface RunCliOptions {
  readonly npmScript?: boolean;
}

export function runCli(
  input = "",
  options: RunCliOptions = {}
): Promise<ProcessResult> {
  return new Promise((resolve, reject) => {
    const npmExecPath = process.env["npm_execpath"];
    if (options.npmScript === true && npmExecPath === undefined) {
      reject(new Error("npm_execpath is unavailable; run this test via npm test"));
      return;
    }

    const args =
      options.npmScript === true
        ? [npmExecPath as string, "run", "cli"]
        : [join(projectRoot, "dist", "main.js")];
    const child = spawn(process.execPath, args, {
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

    child.stdin.end(input);
  });
}
