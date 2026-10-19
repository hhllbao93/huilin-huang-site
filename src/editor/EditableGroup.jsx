import { Children, cloneElement, useSyncExternalStore } from 'react';
import { getSnapshot, subscribe } from './content-store';
import { orderedGroup } from './block-settings';

// A fragment preserves the page's original DOM and CSS relationships.
export default function EditableGroup({ groupKey, children }) {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  const blocks = Children.toArray(children);
  const order = orderedGroup(state.content, groupKey);
  return blocks.sort((a, b) => order.indexOf(a.props.blockKey) - order.indexOf(b.props.blockKey))
    .map((child) => cloneElement(child, { key: child.props.blockKey, groupKey }));
}
