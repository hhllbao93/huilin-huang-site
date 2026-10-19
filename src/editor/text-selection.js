import { getSnapshot, updateState } from './content-store';

export function captureTextSelection() {
  const state = getSnapshot();
  if (!state.editing || state.busy) return;
  // Native color pickers and toolbar controls can temporarily collapse the browser range.
  if (document.activeElement?.closest('.editor-toolbar')) return;
  const selection = window.getSelection();
  const ranges = [];
  if (selection?.rangeCount && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    for (const field of document.querySelectorAll('[data-editor-field]')) {
      if (!range.intersectsNode(field)) continue;
      let start = 0, end = field.textContent.length;
      if (field.contains(range.startContainer)) {
        const before = document.createRange(); before.selectNodeContents(field); before.setEnd(range.startContainer, range.startOffset); start = before.toString().length;
      }
      if (field.contains(range.endContainer)) {
        const before = document.createRange(); before.selectNodeContents(field); before.setEnd(range.endContainer, range.endOffset); end = before.toString().length;
      }
      if (start < end) ranges.push({ key: field.dataset.editorField, start, end });
    }
  }
  if (JSON.stringify(state.textSelection || []) !== JSON.stringify(ranges)) updateState({ textSelection: ranges });
}

export function fieldSelection(field) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return null;
  const range = selection.getRangeAt(0);
  if (!field.contains(range.startContainer) || !field.contains(range.endContainer)) return null;
  const before = document.createRange(); before.selectNodeContents(field); before.setEnd(range.startContainer, range.startOffset);
  return { start: before.toString().length, end: before.toString().length + range.toString().length };
}
export function restoreFieldSelection(field, saved) {
  if (!saved) return;
  const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT);
  let node, at = 0, start, end;
  while ((node = walker.nextNode())) {
    const length = node.textContent.length;
    if (!start && saved.start <= at + length) start = [node, Math.max(0, saved.start - at)];
    if (!end && saved.end <= at + length) end = [node, Math.max(0, saved.end - at)];
    at += length;
  }
  if (!start || !end) return;
  const range = document.createRange(); range.setStart(...start); range.setEnd(...end);
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
}
