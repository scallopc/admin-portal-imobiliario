import { Suspense } from 'react'
import { FollowUpDashboard } from '@/app/follow-up/components/follow-up-dashboard'
import { FollowUpSkeleton } from '@/app/follow-up/components/follow-up-skeleton'
import { FollowUpStatus } from '@/app/follow-up/components/follow-up-status'
import Title from '@/components/common/title'


export default function FollowUp() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Follow-up de Leads" subtitle="Sistema automatizado de follow-up para maximizar conversões" />
      </div>

      <Suspense fallback={<FollowUpSkeleton />}>
        <FollowUpStatus />
        <FollowUpDashboard />
      </Suspense>
    </div>
  )
}
