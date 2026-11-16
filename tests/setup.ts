import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), '.env.local');

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || match[2] === '') {
      continue;
    }

    const key = match[1];
    const value = match[2].replace(/^["']|["']$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
