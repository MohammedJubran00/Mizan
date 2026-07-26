import { FileText, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/Button'
import { FileTable } from '@/shared/components/FileTable'
import { SectionCard } from '@/shared/components/SectionCard'
import type { FileRef } from '@/shared/types/files'

export function DocumentsTab({ documents }: { documents: FileRef[] }) {
  const navigate = useNavigate()

  return (
    <SectionCard
      title="Documents"
      icon={FileText}
      bodyClassName="px-2 py-2"
      action={
        <Button size="sm" variant="secondary" onClick={() => navigate('/documents')}>
          <Upload className="size-4" />
          Manage documents
        </Button>
      }
    >
      <FileTable
        files={documents}
        caption="Documents filed under this matter"
        emptyDescription="Files linked to this matter will be listed here once they are uploaded in the Documents workspace."
      />
    </SectionCard>
  )
}
