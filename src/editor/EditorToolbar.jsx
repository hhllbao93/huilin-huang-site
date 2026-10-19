import { guardEditorLink } from './link-behavior';
import { captureTextSelection } from './text-selection';
import { readInlineStyles } from './inline-styles';
import { useEffect, useSyncExternalStore } from 'react';
import { changeBlock, changeSelectedText, moveBlock, getSnapshot, pendingChanges, restoreDeletedBlocks, subscribe, updateState } from './content-store';
import { FONT_SIZES, groupForBlock, orderedGroup, readBlockSettings } from './block-settings';
import './editor.css';

async function api(action, body) {
  const response = await fetch(`/api/editor?action=${action}`, {
    method: body ? 'POST' : 'GET', credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The request failed.');
  return data;
}
let opening = false;
async function startEditing() {
  if (opening) return;
  opening = true;
  updateState({ busy: true, message: '' });
  try {
    const session = await api('session');
    if (!session.configured) throw new Error('Editing has not been activated yet. Please complete the one-time setup.');
    if (!session.authenticated) { window.location.assign('/api/editor?action=login'); return; }
    const { content, sha } = await api('content');
    updateState({ content, baseline: content, sha, authenticated: true, editing: true });
    sessionStorage.setItem('website-editor', 'active');
  } catch (error) { updateState({ message: error.message }); }
  finally { opening = false; updateState({ busy: false }); }
}
export default function EditorToolbar() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const dirty = Object.keys(pendingChanges()).length;
  const blocks = readBlockSettings(state.content);
  const selected = blocks[state.selectedBlock] || {};
  const hiddenCount = Object.values(blocks).filter((block) => block.hidden).length;
  const group = groupForBlock(state.selectedBlock);
  const visible = orderedGroup(state.content, group).filter((key) => !blocks[key]?.hidden);
  const position = visible.indexOf(state.selectedBlock);
  const disabled = state.busy || !state.selectedBlock;
  const hasSelection = !!state.textSelection?.length;
  const firstSelection = state.textSelection?.[0];
  const inline = readInlineStyles(state.content);
  const firstStyle = firstSelection ? (inline[firstSelection.key] || []).find((run) => run.start <= firstSelection.start && run.end > firstSelection.start) || {} : {};
  const colorDisabled = state.busy || !hasSelection;
  const kind = state.selectedKind === 'li' ? 'list item' : state.selectedKind === 'p' ? 'paragraph' : 'heading';
  useEffect(() => {
    const guard = (event) => guardEditorLink(event, getSnapshot());
    document.addEventListener('click', guard, true);
    document.addEventListener('auxclick', guard, true);
    return () => {
      document.removeEventListener('click', guard, true);
      document.removeEventListener('auxclick', guard, true);
    };
  }, []);
  useEffect(() => {
    document.addEventListener('selectionchange', captureTextSelection);
    return () => document.removeEventListener('selectionchange', captureTextSelection);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('editor_error')) {
      updateState({ message: 'Sign-in failed. Check your GitHub access and editor configuration.' });
    } else if (params.get('edit') === '1' || sessionStorage.getItem('website-editor')) {
      void startEditing();
    }
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  async function publish() {
    // Clicking Save blurs the active field before this handler runs.
    const latest = getSnapshot();
    const changes = pendingChanges();
    if (!Object.keys(changes).length) return;
    updateState({ busy: true, message: '' });
    try {
      const result = await api('save', { sha: latest.sha, changes });
      updateState({ baseline: latest.content, sha: result.sha, message: 'Saved. The live website will update after deployment completes.' });
    } catch (error) { updateState({ message: error.message }); }
    finally { updateState({ busy: false }); }
  }
  async function exit() {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    updateState({ busy: true });
    try {
      if (state.authenticated) await api('logout', {});
      sessionStorage.removeItem('website-editor');
      const url = new URL(window.location.href);
      url.searchParams.delete('edit'); url.searchParams.delete('editor_error');
      window.history.replaceState(null, '', url);
      window.location.reload();
    } catch (error) { updateState({ busy: false, message: error.message }); }
  }
  if (!state.authenticated) return (
    <div className="editor-entry">
      {state.message && <p role="status">{state.message}</p>}
      <button type="button" disabled={state.busy} onClick={startEditing}>{state.busy ? 'Opening editor…' : 'Edit website'}</button>
    </div>
  );
  return (
    <aside className="editor-toolbar" aria-label="Website editor" onPointerDownCapture={captureTextSelection}>
      <div><strong>{state.editing ? 'Click text to edit · ⌘/Ctrl + click to open links' : 'Preview your changes'}</strong><small>{dirty ? `${dirty} unsaved change${dirty === 1 ? '' : 's'}` : 'All changes saved'}</small></div>
      {state.editing && <>
        <p className="editor-selection-scope">{hasSelection ? `Color / Italic: selected text only (${state.textSelection.reduce((n, range) => n + range.end - range.start, 0)} characters)` : 'Highlight words to change their color or italic style.'}</p>
        <label className="editor-font-size">Font size
          <select aria-label="Selected paragraph or heading font size" disabled={state.busy || !state.selectedBlock} value={selected.size || 'default'} onChange={(event) => changeBlock({ size: event.target.value === 'default' ? null : Number(event.target.value) })}>
            <option value="default">Default</option>
            {FONT_SIZES.map((size) => <option key={size} value={size}>{size}px</option>)}
          </select>
        </label>
        <label className="editor-font-size">Selected color
          <input type="color" aria-label="Selected text color" disabled={colorDisabled} value={firstStyle.color || selected.color || '#263e32'} onChange={(event) => changeSelectedText({ color: event.target.value })} />
        </label>
        <button type="button" disabled={colorDisabled} aria-pressed={firstStyle.italic === true} onMouseDown={(event) => event.preventDefault()} onClick={() => changeSelectedText({ italic: !firstStyle.italic })}><i>Italic</i></button>
        <button type="button" disabled={colorDisabled} onMouseDown={(event) => event.preventDefault()} onClick={() => changeSelectedText({ color: null, italic: null })}>Clear selected style</button>
        <label className="editor-font-size">Width
          <select aria-label="Block width" disabled={disabled} value={selected.width || 'default'} onChange={(event) => changeBlock({ width: event.target.value === 'default' ? null : Number(event.target.value) })}>
            <option value="default">Default</option>
            {[25, 50, 65, 75, 85, 100].map((width) => <option key={width} value={width}>{width}%</option>)}
          </select>
        </label>
        <label className="editor-font-size">Align
          <select aria-label="Text alignment" disabled={disabled} value={selected.align || 'default'} onChange={(event) => changeBlock({ align: event.target.value === 'default' ? null : event.target.value })}>
            <option value="default">Default</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </label>
        <button type="button" disabled={disabled || position <= 0} onClick={() => moveBlock(group, state.selectedBlock, visible[position - 1])}>↑ Move up</button>
        <button type="button" disabled={disabled || position < 0 || position >= visible.length - 1} onClick={() => moveBlock(group, state.selectedBlock, visible[position + 1])}>↓ Move down</button>
        <button type="button" disabled={disabled} onClick={() => changeBlock({ size: null, color: null, italic: null, width: null, align: null, compact: null })}>Reset style</button>
        {state.selectedBlock && /^h[1-6]$/.test(state.selectedKind || '') && <button type="button" disabled={state.busy} onClick={() => { updateState({ textSelection: [] }); changeBlock({ compact: selected.compact ? null : true }); }}>{selected.compact ? 'Restore line breaks' : 'Remove empty lines'}</button>}
        <button className="editor-delete" type="button" disabled={state.busy || !state.selectedBlock} onClick={() => changeBlock({ hidden: true })}>Delete {kind}</button>
      </>}
      {hiddenCount > 0 && <button type="button" disabled={state.busy} onClick={restoreDeletedBlocks}>Restore deleted ({hiddenCount})</button>}
      <button type="button" disabled={state.busy} onClick={() => updateState({ editing: !state.editing, textSelection: [] })}>{state.editing ? 'Preview' : 'Continue editing'}</button>
      <button type="button" disabled={state.busy || !dirty} onClick={() => { if (window.confirm('Discard all unsaved changes?')) updateState({ content: state.baseline, selectedBlock: null, textSelection: [], message: '' }); }}>Undo changes</button>
      <button className="editor-publish" type="button" disabled={state.busy || !dirty} onClick={publish}>{state.busy ? 'Saving…' : 'Save & publish'}</button>
      <button type="button" disabled={state.busy} onClick={exit}>Exit</button>
      {state.message && <p role="status">{state.message}</p>}
    </aside>
  );
}
