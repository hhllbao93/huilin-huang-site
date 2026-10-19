import blockKeys from '../data/editable-blocks.json' with { type: 'json' };

import groups from '../data/editable-groups.json' with { type: 'json' };

export const BLOCK_SETTINGS_KEY = '__blockSettings';
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 88, 96];
const allowedKeys = new Set(blockKeys);
export function validBlockSettings(value) {
  if (typeof value !== 'string') return false;
  try {
    const settings = JSON.parse(value);
    if (!settings || Array.isArray(settings) || typeof settings !== 'object') return false;
    return Object.entries(settings).every(([key, item]) => allowedKeys.has(key) && item && !Array.isArray(item) && typeof item === 'object' &&
      Object.keys(item).every((name) => ['hidden', 'size', 'color', 'italic', 'width', 'align', 'order', 'compact'].includes(name)) &&
      (item.compact === undefined || typeof item.compact === 'boolean') &&
      (item.hidden === undefined || typeof item.hidden === 'boolean') &&
      (item.size === undefined || FONT_SIZES.includes(item.size)) &&
      (item.color === undefined || (typeof item.color === 'string' && /^#[0-9a-f]{6}$/i.test(item.color))) &&
      (item.italic === undefined || typeof item.italic === 'boolean') &&
      (item.width === undefined || [25, 50, 65, 75, 85, 100].includes(item.width)) &&
      (item.align === undefined || ['left', 'center', 'right'].includes(item.align)) &&
      (item.order === undefined || (Number.isInteger(item.order) && item.order >= 0 &&
        Object.values(groups).some((keys) => keys.includes(key) && item.order < keys.length))));
  } catch { return false; }
}
export function readBlockSettings(content) {
  const value = content[BLOCK_SETTINGS_KEY] ?? '{}';
  return validBlockSettings(value) ? JSON.parse(value) : {};
}
export function withBlockSetting(content, key, patch) {
  if (!allowedKeys.has(key)) throw new Error('Unknown paragraph or heading.');
  const settings = readBlockSettings(content);
  const item = { ...settings[key], ...patch };
  if (item.hidden === false) delete item.hidden;
  for (const [name, value] of Object.entries(item)) if (value === null) delete item[name];
  if (Object.keys(item).length) settings[key] = item;
  else delete settings[key];
  const value = JSON.stringify(settings);
  if (!validBlockSettings(value)) throw new Error('Invalid paragraph setting.');
  return { ...content, [BLOCK_SETTINGS_KEY]: value };
}
export function withDeletedBlocksRestored(content) {
  const settings = readBlockSettings(content);
  for (const [key, item] of Object.entries(settings)) {
    delete item.hidden;
    if (!Object.keys(item).length) delete settings[key];
  }
  return { ...content, [BLOCK_SETTINGS_KEY]: JSON.stringify(settings) };
}

export function groupForBlock(key) {
  return Object.keys(groups).find((group) => groups[group].includes(key));
}
export function orderedGroup(content, group) {
  const settings = readBlockSettings(content);
  return [...(groups[group] || [])].sort((a, b) =>
    (settings[a]?.order ?? groups[group].indexOf(a)) - (settings[b]?.order ?? groups[group].indexOf(b)));
}
export function withMovedBlock(content, group, from, to) {
  const keys = orderedGroup(content, group);
  if (!keys.includes(from) || !keys.includes(to)) throw new Error('Move paragraphs within the same section.');
  const settings = readBlockSettings(content);
  if (settings[from]?.hidden || settings[to]?.hidden) throw new Error('Restore a deleted paragraph before moving it.');
  const target = keys.indexOf(to);
  keys.splice(keys.indexOf(from), 1);
  keys.splice(target, 0, from);
  return keys.reduce((next, key, order) => withBlockSetting(next, key, { order }), content);
}
export function blockStyle(settings) {
  return {
    ...(settings.size ? { fontSize: `clamp(${Math.min(settings.size, 24)}px, calc(1rem + 4vw), ${settings.size}px)` } : {}),
    ...(settings.color ? { color: settings.color } : {}),
    ...(settings.italic !== undefined ? { fontStyle: settings.italic ? 'italic' : 'normal' } : {}),
    ...(settings.width ? { width: `${settings.width}%`, maxWidth: '100%', boxSizing: 'border-box' } : {}),
    ...(settings.align ? { textAlign: settings.align, marginLeft: settings.align === 'left' ? '0' : 'auto', marginRight: settings.align === 'right' ? '0' : 'auto' } : {}),
  };
}
