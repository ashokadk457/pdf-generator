import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
let pythonExecutablePromise;

async function resolvePythonExecutable() {
  const configured = String(process.env.PYTHON_PATH || "").trim();
  const bundledPython = path.join(
    process.env.USERPROFILE || "C:\\Users\\ihnfo",
    ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "python.exe",
  );
  const candidates = [
    configured,
    ...(process.platform === "win32" ? [bundledPython, "C:\\Python312\\python.exe", "python", "py"] : ["python3", "python"]),
  ].filter((value, index, values) => value && values.findIndex((x) => x.toLowerCase() === value.toLowerCase()) === index);

  const failures = [];
  for (const candidate of candidates) {
    if (path.isAbsolute(candidate) && !fs.existsSync(candidate)) {
      failures.push(`${candidate}: file not found`);
      continue;
    }
    try {
      await execFileAsync(candidate, ["-c", "import reportlab"], { windowsHide: true });
      return candidate;
    } catch (error) {
      failures.push(`${candidate}: ${String(error.stderr || error.message || error).trim().split("\n").at(-1)}`);
    }
  }
  throw new Error(`No Python interpreter with ReportLab was found. Tried: ${failures.join("; ")}`);
}

export async function renderLaosPdfWithPython({ payloadPath, outputPath }) {
  const root = path.resolve(import.meta.dirname, "..");
  const scriptPath = path.join(root, "python", "render_laos_pdf.py");
  pythonExecutablePromise ||= resolvePythonExecutable();
  const pythonPath = await pythonExecutablePromise;
  try {
    await execFileAsync(pythonPath, [scriptPath, payloadPath, outputPath], { cwd: root, windowsHide: true, maxBuffer: 10 * 1024 * 1024 });
  } catch (error) {
    const details = String(error.stderr || error.message || error).trim();
    throw new Error(`Python PDF renderer failed: ${details}`);
  }
}
