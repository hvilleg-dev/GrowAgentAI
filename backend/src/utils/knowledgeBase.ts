import * as fs from 'fs';
import * as path from 'path';
import logger from './logger';

// Resolved at runtime: /app/base_conocimientos inside Docker
const KB_BASE = path.resolve(process.cwd(), 'base_conocimientos');

const cache: Record<string, string> = {};

function loadFile(filePath: string): string {
  if (cache[filePath]) return cache[filePath];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    cache[filePath] = content;
    return content;
  } catch {
    logger.warn(`Knowledge base file not found: ${filePath}`);
    return '';
  }
}

export function getSystemPrompt(idioma: string): string {
  const lang = idioma === 'en' ? 'en' : 'es';
  const filePath = path.join(KB_BASE, `system_prompt_${lang}.md`);
  return loadFile(filePath);
}
