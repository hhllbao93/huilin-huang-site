export const SECTION_ORDER_KEY = '__sectionOrder';
export const SECTION_GROUPS = { Ourteam: ['profile', 'students', 'experience', 'join'] };
export function validSectionOrder(raw) {
  if (typeof raw !== 'string') return false;
  try {
    const groups = JSON.parse(raw);
    return groups && typeof groups === 'object' && !Array.isArray(groups) && Object.entries(groups).every(([group, keys]) =>
      Object.hasOwn(SECTION_GROUPS, group) && Array.isArray(keys) && keys.length === SECTION_GROUPS[group].length &&
      new Set(keys).size === keys.length && keys.every((key) => SECTION_GROUPS[group].includes(key)));
  } catch { return false; }
}
export function sectionOrder(content, group) {
  if (!Object.hasOwn(SECTION_GROUPS, group)) throw new Error('Unknown page sections.');
  const raw = content[SECTION_ORDER_KEY] ?? '{}';
  const saved = validSectionOrder(raw) ? JSON.parse(raw) : {};
  return saved[group] || SECTION_GROUPS[group];
}
export function withMovedSection(content, group, from, to) {
  const order = [...sectionOrder(content, group)];
  if (!order.includes(from) || !order.includes(to)) throw new Error('Move sections within the same page.');
  const target = order.indexOf(to); order.splice(order.indexOf(from), 1); order.splice(target, 0, from);
  const raw = content[SECTION_ORDER_KEY] ?? '{}';
  const saved = validSectionOrder(raw) ? JSON.parse(raw) : {};
  return { ...content, [SECTION_ORDER_KEY]: JSON.stringify({ ...saved, [group]: order }) };
}
