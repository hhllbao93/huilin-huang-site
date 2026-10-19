import defaultContent from '../data/site-content.json' with { type: 'json' };

export const INLINE_STYLES_KEY = '__inlineStyles';
export function validInlineStyles(raw, content = defaultContent) {
  if (typeof raw !== 'string') return false;
  try {
    const styles = JSON.parse(raw);
    if (!styles || Array.isArray(styles) || typeof styles !== 'object') return false;
    return Object.entries(styles).every(([key, runs]) => !key.startsWith('__') && Object.hasOwn(defaultContent, key) &&
      typeof content[key] === 'string' && Array.isArray(runs) && runs.length <= 300 && runs.every((run, index) =>
        run && typeof run === 'object' && !Array.isArray(run) && Object.keys(run).every((k) => ['start', 'end', 'color', 'italic'].includes(k)) &&
        Number.isInteger(run.start) && Number.isInteger(run.end) && run.start >= 0 && run.start < run.end && run.end <= content[key].length &&
        (index === 0 || runs[index - 1].end <= run.start) &&
        (run.color !== undefined || run.italic !== undefined) &&
        (run.color === undefined || (typeof run.color === 'string' && /^#[0-9a-f]{6}$/i.test(run.color))) &&
        (run.italic === undefined || typeof run.italic === 'boolean')));
  } catch { return false; }
}
export function readInlineStyles(content) {
  const raw = content[INLINE_STYLES_KEY] ?? '{}';
  return validInlineStyles(raw, content) ? JSON.parse(raw) : {};
}
export function textSegments(text, runs = []) {
  const result = []; let at = 0;
  for (const run of runs) {
    if (run.start > at) result.push({ text: text.slice(at, run.start) });
    result.push({ text: text.slice(run.start, run.end), color: run.color, italic: run.italic });
    at = run.end;
  }
  if (at < text.length) result.push({ text: text.slice(at) });
  return result;
}
function normalize(runs) {
  const result = [];
  for (const run of runs) {
    if (run.start >= run.end || (run.color === undefined && run.italic === undefined)) continue;
    const last = result.at(-1);
    if (last && last.end === run.start && last.color === run.color && last.italic === run.italic) last.end = run.end;
    else result.push({ ...run });
  }
  return result;
}
export function withInlineStyle(content, ranges, patch) {
  const styles = readInlineStyles(content);
  for (const { key, start, end } of ranges) {
    if (!Object.hasOwn(defaultContent, key) || key.startsWith('__') || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > content[key]?.length || start >= end) throw new Error('Select website text first.');
    const runs = styles[key] || [];
    const points = [...new Set([0, content[key].length, start, end, ...runs.flatMap((r) => [r.start, r.end])])].sort((a, b) => a - b);
    styles[key] = normalize(points.slice(0, -1).map((a, i) => {
      const b = points[i + 1]; const old = runs.find((r) => r.start <= a && r.end >= b);
      const item = { ...(old || {}), start: a, end: b, ...(a >= start && b <= end ? patch : {}) };
      for (const [k, v] of Object.entries(item)) if (v === null) delete item[k];
      return item;
    }));
    if (!styles[key].length) delete styles[key];
  }
  const raw = JSON.stringify(styles);
  if (raw.length > 20000 || !validInlineStyles(raw, content)) throw new Error('The selected text formatting is invalid or too large.');
  return { ...content, [INLINE_STYLES_KEY]: raw };
}
// Preserve formatting outside an edited range and carry the preceding style into typed text.
export function withEditedText(content, key, value) {
  const old = content[key] ?? ''; if (old === value) return content;
  const styles = readInlineStyles(content); const runs = styles[key];
  if (!runs) return { ...content, [key]: value };
  let start = 0; while (start < old.length && start < value.length && old[start] === value[start]) start++;
  let oldEnd = old.length, newEnd = value.length;
  while (oldEnd > start && newEnd > start && old[oldEnd - 1] === value[newEnd - 1]) { oldEnd--; newEnd--; }
  const delta = newEnd - oldEnd; const next = [];
  for (const run of runs) {
    if (run.start < start) next.push({ ...run, end: Math.min(start, run.end) });
    if (run.end > oldEnd) next.push({ ...run, start: Math.max(oldEnd, run.start) + delta, end: run.end + delta });
  }
  const inherit = runs.find((r) => r.start <= start && r.end > start) || runs.find((r) => r.end === start);
  if (inherit && newEnd > start) next.push({ ...inherit, start, end: newEnd });
  styles[key] = normalize(next.sort((a, b) => a.start - b.start));
  if (!styles[key].length) delete styles[key];
  return { ...content, [key]: value, [INLINE_STYLES_KEY]: JSON.stringify(styles) };
}
export function inlineStyle(segment) {
  return { ...(segment.color ? { color: segment.color } : {}), ...(segment.italic !== undefined ? { fontStyle: segment.italic ? 'italic' : 'normal' } : {}) };
}
