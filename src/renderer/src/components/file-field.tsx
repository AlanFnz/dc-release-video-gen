export interface FileFilter {
  name: string
  extensions: string[]
}

interface FileFieldProps {
  label: string
  accept: FileFilter[]
  value: string | null
  onChange: (path: string) => void
  placeholder?: string
}

export function FileField({ label, accept, value, onChange, placeholder }: FileFieldProps) {
  async function handleClick() {
    const path = await window.api.openFile(accept)
    if (path) onChange(path)
  }

  const displayName = value ? value.split('/').pop() ?? value : null

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      <button
        onClick={handleClick}
        className="flex items-center gap-3 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-left hover:border-neutral-500 transition-colors"
      >
        <span className="text-neutral-400 shrink-0">↑</span>
        <span className={displayName ? 'text-neutral-200 truncate' : 'text-neutral-600 truncate'}>
          {displayName ?? placeholder ?? 'choose file…'}
        </span>
      </button>
    </div>
  )
}
