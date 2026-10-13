import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'backend');
if (!existsSync(path.join(backend, 'node_modules'))) throw new Error('Run npm run setup:local first.');
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null || !child.pid) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill('SIGTERM');
  }
  process.exitCode = code;
}
const api = process.platform === 'win32'
  ? spawn('cmd.exe', ['/d', '/s', '/c', 'npm run dev:local'], { cwd: backend, stdio: 'inherit', windowsHide: true })
  : spawn('npm', ['run', 'dev:local'], { cwd: backend, stdio: 'inherit' });
children.push(api);
for (const event of ['SIGINT', 'SIGTERM']) process.on(event, () => stop());
process.on('exit', () => stop());
api.on('error', (error) => { console.error(error.message); stop(1); });
api.on('exit', (code) => { if (!stopping) stop(code || 1); });

const timeout = Date.now() + 180_000;
let ready = false;
while (Date.now() < timeout && !stopping) {
  try {
    const response = await fetch('http://127.0.0.1:4000/api/health', { signal: AbortSignal.timeout(2000) });
    if (response.ok) { ready = true; break; }
  } catch { /* MongoDB may be downloading on the first run. */ }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
if (!ready) { console.error('API did not become ready. Check the backend output.'); stop(1); }
else {
  const web = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1'], { cwd: root, stdio: 'inherit', windowsHide: true });
  children.push(web);
  web.on('error', (error) => { console.error(error.message); stop(1); });
  web.on('exit', (code) => { if (!stopping) stop(code || 1); });
  console.log('\nDoctor Tracker: http://127.0.0.1:3000\nAPI: http://127.0.0.1:4000/api/health\n');
}
