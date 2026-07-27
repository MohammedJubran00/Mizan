import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'

import { TopBar } from '@/app/layout/TopBar'
import {
  deleteDocument,
  fetchDocumentBlob,
  fetchDocuments,
  updateDocument,
  uploadDocument,
} from '@/features/documents/api'
import { DocumentDetails } from '@/features/documents/components/DocumentDetails'
import { DeleteDocumentDialog } from '@/features/documents/components/DeleteDocumentDialog'
import { DocumentFilters } from '@/features/documents/components/DocumentFilters'
import { DocumentTable } from '@/features/documents/components/DocumentTable'
import { PdfViewer } from '@/features/documents/components/PdfViewer'
import { UploadDialog } from '@/features/documents/components/UploadDialog'
import type {
  DocumentCategory,
  DocumentItem,
  DocumentSortField,
  SortDirection,
} from '@/features/documents/types'
import { Button } from '@/shared/components/Button'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatBytes } from '@/shared/lib/utils'

/** Mirrors the API's MAX_UPLOAD_MB so the dialog can reject oversized files early. */
const MAX_UPLOAD_MB = Number(import.meta.env.VITE_MAX_UPLOAD_MB ?? 25)
const PAGE_SIZE = 25

/** Stable reference so selection effects don't re-run on every render. */
const NO_ITEMS: DocumentItem[] = []

export function DocumentsPage() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<DocumentCategory | ''>('')
  const [caseId, setCaseId] = useState('')
  const [clientId, setClientId] = useState('')
  const [sortBy, setSortBy] = useState<DocumentSortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<DocumentItem | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, category, caseId, clientId, sortBy, sortDir])

  const listQuery = useQuery({
    queryKey: [
      'documents',
      { debouncedSearch, category, caseId, clientId, sortBy, sortDir, page },
    ],
    queryFn: () =>
      fetchDocuments({
        search: debouncedSearch,
        category,
        caseId,
        clientId,
        sortBy,
        sortDir,
        page,
        pageSize: PAGE_SIZE,
      }),
  })

  const items = listQuery.data?.items ?? NO_ITEMS

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  )

  // Keep a document selected as the user filters or paginates.
  useEffect(() => {
    if (!items.length) {
      setSelectedId(null)
      return
    }
    if (!items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0].id)
    }
  }, [items, selectedId])

  const previewQuery = useQuery({
    queryKey: ['document-file', selectedId],
    queryFn: () => fetchDocumentBlob(selectedId as string),
    enabled: Boolean(selectedId),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

  const uploadMutation = useMutation({
    mutationFn: (payload: Parameters<typeof uploadDocument>[0]) =>
      uploadDocument(payload, setUploadProgress),
    onSuccess: async (document) => {
      setUploadOpen(false)
      setUploadProgress(0)
      setUploadError(null)
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
      setSelectedId(document.id)
    },
    onError: (error: Error) => setUploadError(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: (params: {
      id: string
      payload: Parameters<typeof updateDocument>[1]
    }) => updateDocument(params.id, params.payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
    onError: (error: Error) => setActionError(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: async (_result, id) => {
      setPendingDelete(null)
      queryClient.removeQueries({ queryKey: ['document-file', id] })
      if (selectedId === id) setSelectedId(null)
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
    onError: (error: Error) => setActionError(error.message),
  })

  const downloadRef = useRef(false)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!selected || downloadRef.current) return
    downloadRef.current = true
    setDownloading(true)
    try {
      const blob = await fetchDocumentBlob(selected.id, true)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = selected.fileName || `${selected.title}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to download document.',
      )
    } finally {
      downloadRef.current = false
      setDownloading(false)
    }
  }

  function handleSort(field: DocumentSortField) {
    if (field === sortBy) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(field)
    setSortDir(field === 'title' || field === 'category' ? 'asc' : 'desc')
  }

  function resetFilters() {
    setSearch('')
    setCategory('')
    setCaseId('')
    setClientId('')
  }

  const hasActiveFilters = Boolean(search || category || caseId || clientId)
  const summary = listQuery.data?.summary
  const pagination = listQuery.data?.pagination

  return (
    <>
      <TopBar
        title="Documents"
        subtitle={
          summary
            ? `${summary.total} document${summary.total === 1 ? '' : 's'} · ${formatBytes(summary.totalSizeBytes)} stored · ${summary.uploadedThisMonth} this month`
            : 'Filings, contracts, and shared work product'
        }
        actions={
          <Button
            size="sm"
            onClick={() => {
              setUploadError(null)
              setUploadOpen(true)
            }}
          >
            <Upload className="size-3.5" />
            Upload PDF
          </Button>
        }
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        {listQuery.isError ? (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {listQuery.error instanceof Error
              ? listQuery.error.message
              : 'Unable to load documents.'}
          </div>
        ) : null}

        {actionError ? (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <DocumentFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          caseId={caseId}
          onCaseChange={setCaseId}
          clientId={clientId}
          onClientChange={setClientId}
          facets={listQuery.data?.facets}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <DocumentTable
              items={items}
              loading={listQuery.isLoading}
              selectedId={selectedId}
              onSelect={(item: DocumentItem) => setSelectedId(item.id)}
              onDelete={(item) => setPendingDelete(item)}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
            />

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-sm">
                <span className="text-xs text-text-muted">
                  Page {pagination.page} of {pagination.totalPages} ·{' '}
                  {pagination.total} total
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}

            {selected ? (
              <DocumentDetails
                document={selected}
                saving={updateMutation.isPending}
                onSave={(payload) =>
                  updateMutation.mutate({ id: selected.id, payload })
                }
              />
            ) : null}
          </div>

          <div className="min-h-[32rem] xl:sticky xl:top-20 xl:h-[calc(100vh-7rem)]">
            <PdfViewer
              blob={previewQuery.data ?? null}
              loading={previewQuery.isLoading}
              error={
                previewQuery.isError
                  ? previewQuery.error instanceof Error
                    ? previewQuery.error.message
                    : 'Unable to preview this document.'
                  : null
              }
              onDownload={() => void handleDownload()}
              downloading={downloading}
            />
          </div>
        </div>
      </main>

      <UploadDialog
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false)
          setUploadProgress(0)
        }}
        facets={listQuery.data?.facets}
        maxUploadMb={MAX_UPLOAD_MB}
        uploading={uploadMutation.isPending}
        progress={uploadProgress}
        error={uploadError}
        onSubmit={(payload) => uploadMutation.mutate(payload)}
      />

      <DeleteDocumentDialog
        open={Boolean(pendingDelete)}
        documentTitle={pendingDelete?.title ?? ''}
        deleting={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
