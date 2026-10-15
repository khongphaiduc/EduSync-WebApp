import React from 'react'
import { DashboardView } from '../DashboardView'
import { TODAY_SCHEDULE, MY_CLASSES, INITIAL_REQUESTS } from '../../mockData'
import type { ScheduleItem, ClassItem, ApplicationRequest, ActiveNavTab } from '../../types'

interface TeacherDashboardViewProps {
  schedule?: ScheduleItem[]
  classes?: ClassItem[]
  requests?: ApplicationRequest[]
  onViewRequest: (request: ApplicationRequest) => void
  onNavigateTab: (tab: ActiveNavTab) => void
  pendingCount?: number
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  schedule = TODAY_SCHEDULE,
  classes = MY_CLASSES,
  requests = INITIAL_REQUESTS,
  onViewRequest,
  onNavigateTab,
  pendingCount
}) => {
  const calculatedPending = pendingCount !== undefined ? pendingCount : requests.filter(r => r.status === 'pending').length

  return (
    <DashboardView
      schedule={schedule}
      classes={classes}
      requests={requests}
      onViewRequest={onViewRequest}
      onNavigateTab={onNavigateTab}
      pendingCount={calculatedPending}
    />
  )
}
