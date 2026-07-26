import { FileText } from 'lucide-react'

import { FileTable } from '@/shared/components/FileTable'
import { SectionCard } from '@/shared/components/SectionCard'
import type { FileRef } from '@/shared/types/files'

export function DocumentsTab({ documents }: { documents: FileRef[] }) {
  return (
    <SectionCard title="Documents" icon={FileText} bodyClassName="px-2 py-2">
      <FileTable
        files={documents}
        caption="Documents linked to this client"
        emptyDescription="Files linked to this client will be listed here after they are uploaded."
      />
    </SectionCard>
  )
}
