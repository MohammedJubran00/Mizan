/** Lightweight reference to a stored file, used by feature detail screens. */
export interface FileRef {
  id: string
  title: string
  fileName: string
  category: string
  sizeBytes: number
  createdAt: string
  uploadedByName?: string | null
}
