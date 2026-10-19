import { useEffect, useSyncExternalStore } from 'react';
import { getSnapshot, moveBlock, subscribe, updateState } from './content-store';
import { blockStyle, readBlockSettings } from './block-settings';

let dragging = null;
export default function EditableBlock({ as: Tag = 'p', blockKey, groupKey, children, className = '', style, ...props }) {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const settings = readBlockSettings(state.content)[blockKey] || {};
  useEffect(() => () => {
    if (getSnapshot().selectedBlock === blockKey) updateState({ selectedBlock: null });
  }, [blockKey]);
  if (settings.hidden) return null;
  function select() {
    if (state.editing && !state.busy && state.selectedBlock !== blockKey) {
      updateState({ selectedBlock: blockKey, selectedKind: Tag });
    }
  }
  const canDrop = () => state.editing && !state.busy && dragging?.group === groupKey && dragging?.key !== blockKey;
  return (
    <Tag {...props} data-editable-block={blockKey}
      className={`${className}${state.editing ? ' editor-block' : ''}${state.editing && state.selectedBlock === blockKey ? ' editor-selected-block' : ''}${settings.color ? ' editor-custom-color' : ''}${settings.italic !== undefined ? ' editor-custom-italic' : ''}`}
      style={{ ...style, ...blockStyle(settings) }} onFocusCapture={select} onClickCapture={select}
      onDragOver={(event) => { if (canDrop()) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }}
      onDrop={(event) => { if (canDrop()) { event.preventDefault(); moveBlock(groupKey, dragging.key, blockKey); dragging = null; } }}
    >{state.editing && groupKey && <button type="button" className="editor-drag-handle" contentEditable={false}
        draggable={!state.busy} disabled={state.busy} aria-label="Drag to reorder within this section" title="Drag to reorder within this section"
        onClick={(event) => { event.preventDefault(); event.stopPropagation(); select(); }}
        onDragStart={(event) => { select(); dragging = { group: groupKey, key: blockKey }; event.dataTransfer.setData('text/plain', blockKey); event.dataTransfer.effectAllowed = 'move'; }}
        onDragEnd={() => { dragging = null; }}>⠿</button>}{children}</Tag>
  );
}
