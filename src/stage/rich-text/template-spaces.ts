const TOKEN = /\{\{[\s\S]*?\}\}/g;
const SPACE_ENTITY = /\u00A0|&nbsp;|&#160;|&#x0*a0;/gi;

/** 编辑器会折叠连续空格。变量原文里的空格先换成不换行空格，才能在画布上原样显示。 */
export function preserveTemplateSpaces(value: string): string {
  return value.replace(TOKEN, (token) => token.replace(/ /g, "\u00A0"));
}

/** 写回文档时把变量里的不换行空格还原成普通空格。 */
export function restoreTemplateSpaces(value: string): string {
  return value.replace(TOKEN, (token) => token.replace(SPACE_ENTITY, " "));
}
