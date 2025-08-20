interface TextFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-500 transition-colors"
      />
    </div>
  )
}
