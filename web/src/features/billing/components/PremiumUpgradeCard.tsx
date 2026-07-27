import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { toast } from '@/stores/toastStore'

/** Placeholder upgrade card — dismissible, no external billing product required. */
export function PremiumUpgradeCard() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <Card className="relative overflow-hidden bg-navy p-5 text-white">
      <Sparkles
        className="pointer-events-none absolute -right-2 -top-2 size-24 text-white/10"
        strokeWidth={1}
        aria-hidden
      />
      <div className="relative space-y-3">
        <h3 className="font-display text-xl">Upgrade billing workflows</h3>
        <p className="text-sm leading-relaxed text-white/80">
          Automated reminders, client payment portals, and accounting sync will
          plug in here when enabled for your workspace.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="sm"
            variant="secondary"
            className="border-white/20 bg-white text-navy hover:bg-white/90"
            onClick={() =>
              toast.info(
                'Coming soon',
                'Premium billing workflows will be available when enabled for your workspace.',
              )
            }
          >
            Learn more
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  )
}
