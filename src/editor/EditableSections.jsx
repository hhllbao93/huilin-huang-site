import { Children, cloneElement, useSyncExternalStore } from 'react';
import { getSnapshot, moveSection, subscribe, updateState } from './content-store';
import { sectionOrder } from './section-order';

let dragging = null;
export default function EditableSections({ group, children }) {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const order = sectionOrder(state.content, group);
  return Children.toArray(children).sort((a, b) => order.indexOf(a.props.sectionKey) - order.indexOf(b.props.sectionKey))
    .map((child) => cloneElement(child, { key: child.props.sectionKey, group, order }));
}
export function EditableSection({ as: Tag = 'section', sectionKey, label, group, order, children, className = '', ...props }) {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const index = order.indexOf(sectionKey);
  const canDrop = () => state.editing && !state.busy && dragging?.group === group && dragging?.key !== sectionKey;
  const move = (target) => {
    updateState({ selectedBlock: null, textSelection: [] });
    moveSection(group, sectionKey, target);
  };
  return <Tag {...props} className={`${className}${state.editing ? ' editor-section' : ''}`}
    onDragOver={(event) => { if (canDrop()) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }}
    onDrop={(event) => { if (canDrop()) { event.preventDefault(); moveSection(group, dragging.key, sectionKey); dragging = null; } }}>
    {state.editing && <div className="editor-section-controls" contentEditable={false} aria-label={`${label} section layout`}>
      <button type="button" className="editor-section-handle" disabled={state.busy} draggable={!state.busy} title="Drag this whole section" aria-label={`Drag ${label} section`}
        onDragStart={(event) => { dragging = { group, key: sectionKey }; event.dataTransfer.setData('text/plain', sectionKey); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => { dragging = null; }}>⠿ {label}</button>
      <button type="button" disabled={state.busy || index === 0} onClick={() => move(order[index - 1])} aria-label={`Move ${label} section up`}>↑ Move section up</button>
      <button type="button" disabled={state.busy || index === order.length - 1} onClick={() => move(order[index + 1])} aria-label={`Move ${label} section down`}>↓ Move section down</button>
    </div>}
    {children}
  </Tag>;
}
