import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { inlineStyle, readInlineStyles, textSegments } from './inline-styles';
import { captureTextSelection, fieldSelection, restoreFieldSelection } from './text-selection';
import { changeText, getSnapshot, subscribe, updateState } from './content-store';

export default function EditableText({ contentKey, children }) {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const value = state.content[contentKey] ?? children ?? '';
  const field = useRef(null);
  const composing = useRef(false);
  const renderedSignature = useRef(null);
  useEffect(() => () => {
    if (getSnapshot().textSelection?.some((range) => range.key === contentKey)) updateState({ textSelection: [] });
  }, [contentKey]);
  const runs = readInlineStyles(state.content)[contentKey] || [];
  const signature = JSON.stringify(runs);
  useLayoutEffect(() => {
    const element = field.current;
    if (!element || composing.current) return;
    if (document.activeElement === element && element.textContent === value && renderedSignature.current === signature) return;
    renderedSignature.current = signature;
    const saved = fieldSelection(element);
    // Construct text nodes and validated style spans; never interpret user text as HTML.
    const nodes = textSegments(value, JSON.parse(signature)).map((segment) => {
      if (!segment.color && segment.italic === undefined) return document.createTextNode(segment.text);
      const span = document.createElement('span'); span.textContent = segment.text;
      Object.assign(span.style, inlineStyle(segment)); return span;
    });
    element.replaceChildren(...nodes);
    restoreFieldSelection(element, saved);
  }, [state.editing, value, signature]);
  if (!state.editing) return runs.length ? textSegments(value, runs).map((segment, index) => <span key={index} style={inlineStyle(segment)}>{segment.text}</span>) : value;
  return (
    <span
      ref={field}
      data-editor-field={contentKey}
      onMouseUp={captureTextSelection}
      onKeyUp={captureTextSelection}
      className="editable-text"
      contentEditable={!state.busy}
      suppressContentEditableWarning
      role="textbox"
      aria-label="Edit this text"
      aria-multiline="true"
      tabIndex={0}
      onFocus={(event) => {
        if (!event.currentTarget.closest('[data-editable-block]')) updateState({ selectedBlock: null });
      }}
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
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={(event) => { composing.current = false; changeText(contentKey, event.currentTarget.innerText.replace(/\r\n/g, '\n')); }}
      onInput={(event) => { if (!composing.current) changeText(contentKey, event.currentTarget.innerText.replace(/\r\n/g, '\n')); }}
      onBlur={(event) => changeText(contentKey, event.currentTarget.innerText.replace(/\r\n/g, '\n'))}
    />
  );
}
