export interface HeadStyleSplit {
  html: string;
  styles: string;
}

/** 把区块里标记出的作者样式挪到调用方的 head，避免留在 body。 */
export function extractHeadStyles(html: string): HeadStyleSplit {
  const styles: string[] = [];
  const next = html.replace(/<!--ree-head-->([\s\S]*?)<!--\/ree-head-->/g, (_, css: string) => {
    const text = css.trim();
    if (text) styles.push(text);
    return "";
  });
  return { html: next, styles: styles.join("\n") };
}
