import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = path.join(rootDir, 'backend');
const webDir = path.join(rootDir, 'web');
const apiPort = Number(process.env.MEDMEDIA_API_PORT || 5001);
const children = [];
let shuttingDown = false;
let backendExitCode;

function startProcess(args, cwd, env = process.env) {
  const child = spawn(process.execPath, args, { cwd, env, stdio: 'inherit' });
  children.push(child);
  child.once('error', (error) => {
    console.error(`[MedMedia] Could not start ${args.at(-1)}: ${error.message}`);
    stop(1);
  });
  return child;
}

function stop(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill('SIGTERM');
  }
  const forceStop = setTimeout(() => {
    for (const child of children) {
      if (child.exitCode === null) child.kill('SIGKILL');
    }
  }, 3000);
  forceStop.unref();
  process.exitCode = exitCode;
}

const backend = startProcess(
  ['--watch', '-r', 'ts-node/register/transpile-only', 'src/server.ts'],
  backendDir,
  { ...process.env, PORT: String(apiPort) }
);
backend.once('exit', (code) => {
  backendExitCode = code ?? 1;
  if (!shuttingDown) {
    console.error('[MedMedia] Backend stopped; shutting down the development stack.');
    stop(backendExitCode);
  }
});

async function waitForApiReady() {
  const deadline = Date.now() + 30_000;
  while (!shuttingDown && Date.now() < deadline) {
    if (backendExitCode !== undefined) return false;
    try {
      const response = await fetch(`http://127.0.0.1:${apiPort}/api/ready`, {
        signal: AbortSignal.timeout(1500)
      });
      if (response.ok) return true;
    } catch {
      // The API may still be starting; retry until it is ready or times out.
    }
    await delay(500);
  }
  return false;
}

if (await waitForApiReady()) {
  console.log(`[MedMedia] API and database ready at http://localhost:${apiPort}`);
  startProcess(
    ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1'],
    webDir
  );
} else if (!shuttingDown) {
  console.error(`[MedMedia] API/database did not become ready on port ${apiPort}. Check the backend environment and MySQL service.`);
  stop(1);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
