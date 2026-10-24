import { createCliApplication } from "./bootstrap/CompositionRoot.js";

const exitCode = await createCliApplication(process.stdin, process.stdout).run();
process.exitCode = exitCode;
