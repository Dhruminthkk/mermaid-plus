/**
 * Edits a `%%mp:` directive in place.
 *
 * A control that changes the diagram writes it back into the source rather than
 * holding it as view state: the source is the document, so the change is
 * visible, undoable in the editor, and still there after a reload or an export.
 */
const LAYOUT_LINE = /^(\s*)%%mp:\s+layout\b(.*)$/

export function upsertLayoutDirective(source: string, key: string, value: string): string {
  const lines = source.split('\n')
  const attr = `${key}=${value}`
  const existing = lines.findIndex((line) => LAYOUT_LINE.test(line))

  if (existing !== -1) {
    const line = lines[existing]!
    const match = LAYOUT_LINE.exec(line)!
    const rest = match[2] ?? ''
    const keyed = new RegExp(`(^|\\s)${key}=\\S*`)
    lines[existing] = keyed.test(rest)
      ? `${match[1]}%%mp: layout${rest.replace(keyed, `$1${attr}`)}`
      : `${match[1]}%%mp: layout${rest} ${attr}`
    return lines.join('\n')
  }

  // A fresh directive goes under the header, flush left, where the other
  // directives in these files sit.
  const header = lines.findIndex((line) => line.trim().length > 0)
  lines.splice(header === -1 ? 0 : header + 1, 0, `%%mp: layout ${attr}`)
  return lines.join('\n')
}
