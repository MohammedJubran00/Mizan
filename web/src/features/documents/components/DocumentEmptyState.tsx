import { FileSearch } from 'lucide-react'

export function DocumentEmptyState() {
  return (
    <div className="flex h-full min-h-[28rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-8 py-16 text-center shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-soft text-blue">
        <FileSearch className="size-6" strokeWidth={1.75} />
      </span>
      <h2 className="font-display text-xl text-navy">
        Select a document to preview its details
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
        Choose a file from the library to view metadata, open the PDF preview,
        and use Edit, Delete, or Download.
      </p>
    </div>
  )
}
