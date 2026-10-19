import blockKeys from '../data/editable-blocks.json' with { type: 'json' };

export const BLOCK_SETTINGS_KEY = '__blockSettings';
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 88, 96];
const allowedKeys = new Set(blockKeys);
export function validBlockSettings(value) {
  if (typeof value !== 'string') return false;
  try {
    const settings = JSON.parse(value);
    if (!settings || Array.isArray(settings) || typeof settings !== 'object') return false;
    return Object.entries(settings).every(([key, item]) => allowedKeys.has(key) && item && !Array.isArray(item) && typeof item === 'object' && Object.keys(item).every((name) => name === 'hidden' || name === 'size') && (item.hidden === undefined || typeof item.hidden === 'boolean') && (item.size === undefined || FONT_SIZES.includes(item.size)));
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
  if (item.size === null) delete item.size;
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
