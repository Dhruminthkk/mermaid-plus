interface Props {
  value: string
  onChange: (value: string) => void
}

export function Editor({ value, onChange }: Props) {
  return (
    <textarea className="mp-editor" value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} aria-label="Mermaid source" />
  )
}
