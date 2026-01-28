import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function generateAppId() {
  // Requirement: start with `app_` and be 20 characters long.
  // `app_` (4) + 16 hex chars (8 bytes) = 20 chars total.
  return `app_${crypto.randomBytes(8).toString('hex')}`;
}

function ensureTrailingNewline(s) {
  return s.endsWith('\n') ? s : `${s}\n`;
}

function upsertEnvVar(envText, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');

  if (re.test(envText)) return envText.replace(re, line);

  // Insert after a leading comment block if present; otherwise prepend.
  const lines = envText.split('\n');
  let insertAt = 0;
  while (insertAt < lines.length && lines[insertAt].trim().startsWith('#')) insertAt++;
  lines.splice(insertAt, 0, line);
  return ensureTrailingNewline(lines.join('\n'));
}

function main() {
  const projectDir = process.cwd();
  const envPath = path.join(projectDir, '.env');
  const envExamplePath = path.join(projectDir, 'env.example');

  const appId = generateAppId();

  let envText = '';
  if (fs.existsSync(envPath)) {
    envText = fs.readFileSync(envPath, 'utf8');
  } else if (fs.existsSync(envExamplePath)) {
    envText = fs.readFileSync(envExamplePath, 'utf8');
  }

  envText = upsertEnvVar(envText, 'APP_ID', appId);
  fs.writeFileSync(envPath, envText, 'utf8');

  // Print for convenience in CI / copy-paste.
  process.stdout.write(`${appId}\n`);
}

main();

