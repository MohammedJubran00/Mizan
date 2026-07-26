import { apiClient, getErrorMessage } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  DocumentItem,
  DocumentListParams,
  DocumentListResponse,
  UpdateDocumentPayload,
  UploadDocumentPayload,
} from '@/features/documents/types'

export async function fetchDocuments(params: DocumentListParams) {
  try {
    const { data } = await apiClient.get<DocumentListResponse>(
      endpoints.documents.root,
      {
        params: {
          search: params.search || undefined,
          category: params.category || undefined,
          caseId: params.caseId || undefined,
          clientId: params.clientId || undefined,
          sortBy: params.sortBy,
          sortDir: params.sortDir,
          page: params.page,
          pageSize: params.pageSize,
        },
      },
    )
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to load documents.'))
  }
}

export async function uploadDocument(
  payload: UploadDocumentPayload,
  onProgress?: (percent: number) => void,
) {
  const form = new FormData()
  form.append('file', payload.file)
  form.append('category', payload.category)
  if (payload.title) form.append('title', payload.title)
  if (payload.description) form.append('description', payload.description)
  if (payload.caseId) form.append('caseId', payload.caseId)
  if (payload.clientId) form.append('clientId', payload.clientId)

  try {
    const { data } = await apiClient.post<{
      success: true
      document: DocumentItem
    }>(endpoints.documents.root, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        onProgress(Math.round((event.loaded / event.total) * 100))
      },
    })
    return data.document
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to upload document.'))
  }
}

export async function updateDocument(id: string, payload: UpdateDocumentPayload) {
  try {
    const { data } = await apiClient.patch<{
      success: true
      document: DocumentItem
    }>(endpoints.documents.byId(id), payload)
    return data.document
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to update document.'))
  }
}

export async function deleteDocument(id: string) {
  try {
    await apiClient.delete(endpoints.documents.byId(id))
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to delete document.'))
  }
}

/**
 * Downloads the PDF bytes through Axios so the Bearer token is attached.
 * The resulting blob feeds both the in-browser viewer and the download action.
 */
export async function fetchDocumentBlob(id: string, download = false) {
  try {
    const { data } = await apiClient.get<Blob>(endpoints.documents.file(id), {
      responseType: 'blob',
      params: download ? { download: '1' } : undefined,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to open document file.'))
  }
}
