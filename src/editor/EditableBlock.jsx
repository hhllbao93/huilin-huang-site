import { useEffect, useSyncExternalStore } from 'react';
import { getSnapshot, subscribe, updateState } from './content-store';
import { readBlockSettings } from './block-settings';

export default function EditableBlock({ as: Tag = 'p', blockKey, children, className = '', style, ...props }) {
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
  const fontSize = settings.size ? `clamp(${Math.min(settings.size, 24)}px, calc(1rem + 4vw), ${settings.size}px)` : undefined;
  return (
    <Tag
      {...props}
      data-editable-block={blockKey}
      className={`${className}${state.editing && state.selectedBlock === blockKey ? ' editor-selected-block' : ''}`}
      style={{ ...style, ...(fontSize ? { fontSize } : {}) }}
      onFocusCapture={select}
      onClickCapture={select}
    >{children}</Tag>
  );
}
