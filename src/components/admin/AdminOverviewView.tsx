import React from 'react'
import { AdminDashboardView } from '../AdminDashboardView'
import {
  ADMIN_FACULTIES_STATS,
  ADMIN_NEW_SECTIONS,
  ADMIN_ACTIVITIES,
  ADMIN_RECENT_REQUESTS
} from '../../mockData'
import type { FacultyStat, SectionClassItem, ActivityEvent, AdminNavTab } from '../../types'

interface AdminOverviewViewProps {
  faculties?: FacultyStat[]
  newSections?: SectionClassItem[]
  activities?: ActivityEvent[]
  recentRequests?: Array<{ id: string; date: string; studentName: string; requestType: string; status: string }>
  onNavigateTab: (tab: AdminNavTab) => void
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  faculties = ADMIN_FACULTIES_STATS,
  newSections = ADMIN_NEW_SECTIONS,
  activities = ADMIN_ACTIVITIES,
  recentRequests = ADMIN_RECENT_REQUESTS,
  onNavigateTab
}) => {
  return (
    <AdminDashboardView
      faculties={faculties}
      newSections={newSections}
      activities={activities}
      recentRequests={recentRequests}
      onNavigateTab={onNavigateTab}
    />
  )
}
