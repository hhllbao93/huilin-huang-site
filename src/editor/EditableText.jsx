import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { changeText, getSnapshot, subscribe } from './content-store';

export default function EditableText({ contentKey, children }) {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const value = state.content[contentKey] ?? children ?? '';
  const field = useRef(null);
  useLayoutEffect(() => {
    if (field.current && document.activeElement !== field.current) {
      field.current.textContent = value;
    }
  }, [state.editing, value]);
  if (!state.editing) return value;
  return (
    <span
      ref={field}
      className="editable-text"
      contentEditable={!state.busy}
      suppressContentEditableWarning
      role="textbox"
      aria-label="Edit this text"
      aria-multiline="true"
      tabIndex={0}
      onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Escape') event.currentTarget.blur();
      }}
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        changeText(contentKey, event.currentTarget.innerText.replace(/\r\n/g, '\n'));
      }}
      onInput={(event) => changeText(contentKey, event.currentTarget.innerText.replace(/\r\n/g, '\n'))}
      onBlur={(event) => changeText(contentKey, event.currentTarget.innerText.replace(/\r\n/g, '\n'))}
    />
  );
}
