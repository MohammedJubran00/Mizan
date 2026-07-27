import { useEffect, useMemo, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileWarning,
  Loader2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/lib/utils'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

interface PdfViewerProps {
  blob: Blob | null
  loading: boolean
  error: string | null
  onDownload: () => void
  downloading?: boolean
}

export function PdfViewer({
  blob,
  loading,
  error,
  onDownload,
  downloading,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoomIndex, setZoomIndex] = useState(2)
  const [renderError, setRenderError] = useState<string | null>(null)

  const fileUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    [blob],
  )

  useEffect(() => {
    if (!fileUrl) return
    return () => URL.revokeObjectURL(fileUrl)
  }, [fileUrl])

  useEffect(() => {
    setPageNumber(1)
    setRenderError(null)
  }, [fileUrl])

  const scale = ZOOM_STEPS[zoomIndex]
  const message = error ?? renderError

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-[0_1px_2px_rgba(26,46,90,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle bg-surface-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-muted disabled:opacity-40"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={!numPages || pageNumber <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-24 text-center text-xs font-medium text-text-secondary">
            {numPages ? `Page ${pageNumber} / ${numPages}` : '—'}
          </span>
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-muted disabled:opacity-40"
            onClick={() =>
              setPageNumber((page) => Math.min(numPages || 1, page + 1))
            }
            disabled={!numPages || pageNumber >= numPages}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-muted disabled:opacity-40"
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="w-12 text-center text-xs font-medium text-text-secondary">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-secondary transition hover:bg-surface-muted disabled:opacity-40"
            onClick={() =>
              setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))
            }
            disabled={zoomIndex === ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
          >
            <ZoomIn className="size-4" />
          </button>
          <Button
            variant="secondary"
            size="sm"
            className="ml-2"
            onClick={onDownload}
            loading={downloading}
            disabled={!blob}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'flex-1 overflow-auto bg-surface-muted p-4',
          'flex justify-center',
        )}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading document…</p>
          </div>
        ) : message ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center text-text-secondary">
            <FileWarning className="size-8 text-danger" />
            <p className="max-w-xs text-sm">{message}</p>
          </div>
        ) : fileUrl ? (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages: pages }) => setNumPages(pages)}
            onLoadError={(loadError) =>
              setRenderError(loadError.message || 'Unable to render this PDF.')
            }
            loading={
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Loader2 className="size-4 animate-spin" />
                Rendering…
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-[0_2px_12px_rgba(26,46,90,0.12)]"
              renderAnnotationLayer
              renderTextLayer
            />
          </Document>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-text-muted">
            <p className="text-sm">Select a document to preview it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
