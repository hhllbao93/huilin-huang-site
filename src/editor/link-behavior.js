// Let the browser and React Router handle modified clicks, including opening new tabs.
export function isLinkShortcut(event) {
  return Boolean(event.metaKey || event.ctrlKey);
}
export function guardEditorLink(event, state) {
  if (!state.editing || event.button === 2) return;
  const element = event.target?.nodeType === 3 ? event.target.parentElement : event.target;
  if (!element?.closest?.('a[href]')) return;
  if (state.busy || !isLinkShortcut(event)) event.preventDefault();
}
