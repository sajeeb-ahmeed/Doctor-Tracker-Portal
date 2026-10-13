import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'backend');
const run = (command, args, cwd = root) => execFileSync(command, args, { cwd, stdio: 'inherit', windowsHide: true });
if (!existsSync(path.join(backend, 'package.json'))) {
  run('git', ['clone', 'https://github.com/sajeeb-ahmeed/Doctor-Tracker-API.git', backend]);
}
if (!existsSync(path.join(root, '.env.local'))) {
  writeFileSync(path.join(root, '.env.local'), readFileSync(path.join(root, '.env.example')));
}
if (!existsSync(path.join(backend, '.env'))) {
  const example = readFileSync(path.join(backend, '.env.example'), 'utf8');
  writeFileSync(path.join(backend, '.env'), example.replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${randomBytes(48).toString('hex')}`));
}
if (process.platform === 'win32') run('cmd.exe', ['/d', '/s', '/c', 'npm ci'], backend);
else run('npm', ['ci'], backend);
console.log('Local configuration ready. Run npm run dev:all. Existing environment files were preserved.');
