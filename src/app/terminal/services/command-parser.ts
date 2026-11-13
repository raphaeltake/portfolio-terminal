export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

/**
 * Divide a linha em tokens respeitando aspas simples/duplas e `\` como escape:
 * `echo "olá mundo" x` -> ["echo", "olá mundo", "x"].
 */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let hasToken = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '\\' && i + 1 < line.length && quote !== "'") {
      current += line[++i];
      hasToken = true;
    } else if (quote) {
      if (char === quote) quote = null;
      else current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      hasToken = true;
    } else if (/\s/.test(char)) {
      if (hasToken) tokens.push(current);
      current = '';
      hasToken = false;
    } else {
      current += char;
      hasToken = true;
    }
  }

  if (hasToken) tokens.push(current);
  return tokens;
}

export function parseCommandLine(line: string): ParsedCommand | null {
  const [name, ...args] = tokenize(line);
  if (!name) return null;
  return { name: name.toLowerCase(), args, raw: line };
}
