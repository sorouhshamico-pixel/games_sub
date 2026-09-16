/**
 * Minimal CSV writer — no dependency for what's a handful of plain columns.
 * Quotes any field containing a comma, quote, or newline, doubling internal
 * quotes per RFC 4180. Prefixes a UTF-8 BOM so Excel on Windows (the
 * realistic export destination here) detects the encoding correctly instead
 * of mangling Arabic column values — a real, easy-to-miss gotcha, not
 * decoration.
 */
export function toCsv(headers: string[], rows: Array<Array<string | number | null>>): string {
  const escape = (value: string | number | null): string => {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))];
  return "﻿" + lines.join("\r\n");
}
