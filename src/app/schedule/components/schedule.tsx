import { Suspense } from 'react'
import Title from '@/components/common/title'
import ScheduleSkeleton from './schedule-skeleton'

export default function Schedule() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Title title="Agendamento de Leads" subtitle="Sistema automatizado de agendamento para maximizar conversões" />
      </div>

      <Suspense fallback={<ScheduleSkeleton />}>
        lista de agendamentos google
      </Suspense>
    </div>
  )
}
