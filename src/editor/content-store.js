import { withMovedSection } from './section-order';
import { withEditedText, withInlineStyle } from './inline-styles';
import { withMovedBlock, withBlockSetting, withDeletedBlocksRestored } from './block-settings';
import initialContent from '../data/site-content.json';

let state = { content: initialContent, baseline: initialContent, editing: false, authenticated: false, busy: false, message: '', sha: null };
const listeners = new Set();
export const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const getSnapshot = () => state;
export function updateState(patch) { state = { ...state, ...patch }; listeners.forEach((listener) => listener()); }
export function changeText(key, value) {
  const content = withEditedText(state.content, key, value);
  if (content !== state.content) updateState({ content, message: '' });
}
export function readText(key, fallback) { return state.content[key] ?? fallback; }
export function pendingChanges() { return Object.fromEntries(Object.entries(state.content).filter(([key, value]) => value !== state.baseline[key])); }

export function changeBlock(patch) {
  if (!state.selectedBlock) return;
  updateState({ content: withBlockSetting(state.content, state.selectedBlock, patch), message: '', ...(patch.hidden ? { selectedBlock: null } : {}) });
}
export function restoreDeletedBlocks() {
  updateState({ content: withDeletedBlocksRestored(state.content), message: '' });
}

export function moveBlock(group, from, to) {
  if (state.busy || !state.editing) return;
  updateState({ content: withMovedBlock(state.content, group, from, to), message: '' });
}

export function changeSelectedText(patch) {
  if (state.busy || !state.editing || !state.textSelection?.length) return;
  try { updateState({ content: withInlineStyle(state.content, state.textSelection, patch), message: '' }); }
  catch (error) { updateState({ message: error.message }); }
}

export function moveSection(group, from, to) {
  if (state.busy || !state.editing) return;
  updateState({ content: withMovedSection(state.content, group, from, to), message: '' });
}
