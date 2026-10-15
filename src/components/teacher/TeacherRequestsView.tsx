import React from 'react'
import { RequestsView } from '../RequestsView'
import { INITIAL_REQUESTS } from '../../mockData'
import type { ApplicationRequest } from '../../types'

interface TeacherRequestsViewProps {
  requests?: ApplicationRequest[]
  onViewRequest: (request: ApplicationRequest) => void
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, reason?: string) => void
}

export const TeacherRequestsView: React.FC<TeacherRequestsViewProps> = ({
  requests = INITIAL_REQUESTS,
  onViewRequest,
  onApprove,
  onReject
}) => {
  return (
    <RequestsView
      requests={requests}
      onViewRequest={onViewRequest}
      onApprove={onApprove}
      onReject={onReject}
    />
  )
}
