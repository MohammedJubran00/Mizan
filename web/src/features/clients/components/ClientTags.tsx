import { Tags } from 'lucide-react'

import { SectionCard } from '@/shared/components/SectionCard'

import type { Tag } from '../types'
import { TagInput } from './TagInput'

interface ClientTagsProps {
  tags: Tag[]
  onAdd: (label: string) => void
  onRemove: (label: string) => void
  pending?: boolean
}

export function ClientTags({ tags, onAdd, onRemove, pending }: ClientTagsProps) {
  return (
    <SectionCard title="Client Tags" icon={Tags}>
      <TagInput
        collapsible
        values={tags.map((tag) => tag.label)}
        onAdd={onAdd}
        onRemove={onRemove}
        disabled={pending}
        emptyLabel="No tags yet."
      />
    </SectionCard>
  )
}
