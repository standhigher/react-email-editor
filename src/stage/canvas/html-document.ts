/** 同类型节点原位更新，保留图片等资源节点及未变化的 src，避免重新加载。 */
function updateNode(current: Node, next: Node): void {
  if (current.isEqualNode(next)) return;
  if (current.nodeType === 1 && next.nodeType === 1) {
    const element = current as Element;
    const source = next as Element;
    for (const attribute of Array.from(element.attributes)) {
      if (!source.hasAttributeNS(attribute.namespaceURI, attribute.localName)) {
        element.removeAttributeNS(attribute.namespaceURI, attribute.localName);
      }
    }
    for (const attribute of Array.from(source.attributes)) {
      const existing = element.getAttributeNodeNS(attribute.namespaceURI, attribute.localName);
      if (!existing || existing.value !== attribute.value || existing.name !== attribute.name) {
        element.setAttributeNS(attribute.namespaceURI, attribute.name, attribute.value);
      }
    }
  } else if (current.nodeValue !== next.nodeValue) {
    current.nodeValue = next.nodeValue;
  }

  const children = Array.from(current.childNodes);
  const sources = Array.from(next.childNodes);
  for (const [index, child] of children.entries()) {
    const source = sources[index];
    if (!source) {
      current.removeChild(child);
    } else if (child.nodeType === source.nodeType && child.nodeName === source.nodeName
      && (child.nodeType !== 1 || (child as Element).namespaceURI === (source as Element).namespaceURI)) {
      updateNode(child, source);
    } else {
      current.replaceChild(current.ownerDocument!.importNode(source, true), child);
    }
  }
  for (const source of sources.slice(children.length)) {
    current.appendChild(current.ownerDocument!.importNode(source, true));
  }
}

/** 仅用于禁用脚本的画布 iframe；邮件导出和完整预览仍使用原始 HTML。 */
export function updateCanvasDocument(document: Document, html: string): void {
  const parser = new DOMParser();
  const next = parser.parseFromString(html, "text/html");
  updateNode(document.documentElement, next.documentElement);
}
