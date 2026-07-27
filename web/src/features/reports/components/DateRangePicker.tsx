import { Input } from '@/shared/components/Input'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  startError?: string
  endError?: string
  startLabel?: string
  endLabel?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startError,
  endError,
  startLabel = 'Start date',
  endLabel = 'End date',
}: DateRangePickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        label={startLabel}
        type="date"
        value={startDate}
        onChange={(event) => onStartChange(event.target.value)}
        error={startError}
        required
      />
      <Input
        label={endLabel}
        type="date"
        value={endDate}
        onChange={(event) => onEndChange(event.target.value)}
        error={endError}
        required
      />
    </div>
  )
}
