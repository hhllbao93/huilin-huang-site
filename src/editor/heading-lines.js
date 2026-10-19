// Read text from the same element descriptions React renders, without mutating content.
function nodeText(node, content) {
  if (Array.isArray(node)) return node.map((child) => nodeText(child, content)).join('');
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (!node?.props) return '';
  if (node.props.contentKey) return content[node.props.contentKey] ?? nodeText(node.props.children, content);
  return nodeText(node.props.children, content);
}
export function nonemptyHeadingLines(nodes, content) {
  const lines = [[]];
  for (const node of nodes) {
    if (node?.type === 'br') lines.push([]);
    else lines.at(-1).push(node);
  }
  return lines.filter((line) => nodeText(line, content).replace(/[\s\u200b-\u200d\ufeff]/g, '').length > 0);
}
