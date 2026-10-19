import initialContent from '../data/site-content.json';

let state = { content: initialContent, baseline: initialContent, editing: false, authenticated: false, busy: false, message: '', sha: null };
const listeners = new Set();
export const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const getSnapshot = () => state;
export function updateState(patch) { state = { ...state, ...patch }; listeners.forEach((listener) => listener()); }
export function changeText(key, value) { updateState({ content: { ...state.content, [key]: value }, message: '' }); }
export function readText(key, fallback) { return state.content[key] ?? fallback; }
export function pendingChanges() { return Object.fromEntries(Object.entries(state.content).filter(([key, value]) => value !== state.baseline[key])); }
