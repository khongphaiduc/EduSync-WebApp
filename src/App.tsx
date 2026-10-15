import { useState } from 'react'
import { LoginView } from './components/LoginView'

// Lecturer components
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import {
  TeacherDashboardView,
  TeacherClassesView,
  TeacherGradesView,
  TeacherScheduleView,
  TeacherStudentsView,
  TeacherRequestsView,
  TeacherNotificationsView,
  TeacherMaterialsView,
  TeacherReportsView
} from './components/teacher'
import { RequestDetailModal } from './components/RequestDetailModal'

// Admin components
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'
import {
  AdminOverviewView,
  AdminStudentsView,
  AdminTeachersView,
  AdminSubjectsView,
  AdminSemestersView,
  AdminSectionsView,
  AdminAssignmentView,
  AdminScheduleView,
  AdminRequestsView,
  AdminNotificationsView,
  AdminAccountsView,
  AdminSettingsView
} from './components/admin'

// Datasets
import {
  TODAY_SCHEDULE,
  MY_CLASSES,
  INITIAL_REQUESTS,
  INITIAL_STUDENTS_GRADES,
  ADMIN_FACULTIES_STATS,
  ADMIN_NEW_SECTIONS,
  ADMIN_ACTIVITIES,
  ADMIN_RECENT_REQUESTS
} from './mockData'
import type {
  ActiveNavTab,
  AdminNavTab,
  PortalMode,
  ApplicationRequest,
  StudentGrade
} from './types'
import { CheckCircle2 } from 'lucide-react'

export default function App() {
  // Authentication state: tự động khôi phục từ localStorage khi reload trang
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('accessToken')
    const authFlag = localStorage.getItem('isAuthenticated')
    return Boolean(token || authFlag === 'true')
  })

  // Mode switcher: nhớ mode admin hoặc teacher
  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    const savedMode = localStorage.getItem('portalMode') as PortalMode | null
    if (savedMode === 'admin' || savedMode === 'teacher') return savedMode
    try {
      const savedUser = localStorage.getItem('authUser')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        if (parsed.role === 1) return 'admin'
        if (parsed.role === 2 || parsed.role === 3) return 'teacher'
      }
    } catch {
      // ignore
    }
    return 'admin'
  })

  // Teacher navigation state: nhớ tab hiện tại khi reload
  const [activeTab, setActiveTab] = useState<ActiveNavTab>(() => {
    const saved = localStorage.getItem('activeTab') as ActiveNavTab | null
    return saved || 'dashboard'
  })

  // Admin navigation state: nhớ tab hiện tại khi reload (ví dụ đang ở students thì F5 vẫn ở students)
  const [adminTab, setAdminTab] = useState<AdminNavTab>(() => {
    const saved = localStorage.getItem('adminTab') as AdminNavTab | null
    return saved || 'overview'
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [requests, setRequests] = useState<ApplicationRequest[]>(INITIAL_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<ApplicationRequest | null>(null)
  const [gradesData, setGradesData] = useState<Record<string, StudentGrade[]>>(INITIAL_STUDENTS_GRADES)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Chuyển đổi portal mode và lưu vào localStorage
  const handleSwitchPortal = (mode: PortalMode) => {
    setPortalMode(mode)
    localStorage.setItem('portalMode', mode)
  }

  // Chuyển đổi admin tab và lưu vào localStorage
  const handleSelectAdminTab = (tab: AdminNavTab) => {
    setAdminTab(tab)
    localStorage.setItem('adminTab', tab)
  }

  // Chuyển đổi teacher tab và lưu vào localStorage
  const handleSelectActiveTab = (tab: ActiveNavTab) => {
    setActiveTab(tab)
    localStorage.setItem('activeTab', tab)
  }

  // Handle request approval
  const handleApproveRequest = (id: string, comment?: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'approved',
              statusText: 'Đã duyệt'
            }
          : r
      )
    )
    showToast(`Đã duyệt đơn #${id} thành công! ${comment ? `Ghi chú: ${comment}` : ''}`)
  }

  // Handle request rejection
  const handleRejectRequest = (id: string, reason?: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'rejected',
              statusText: 'Từ chối'
            }
          : r
      )
    )
    showToast(`Đã từ chối đơn #${id}. ${reason ? `Lý do: ${reason}` : ''}`)
  }

  // Handle save grades
  const handleSaveGrades = (classCode: string, updatedGrades: StudentGrade[]) => {
    setGradesData(prev => ({
      ...prev,
      [classCode]: updatedGrades
    }))
    showToast(`Đã lưu bảng điểm lớp ${classCode} thành công!`)
  }

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('authUser')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('portalMode')
    localStorage.removeItem('adminTab')
    localStorage.removeItem('activeTab')
    setIsAuthenticated(false)
    showToast('Bạn đã đăng xuất khỏi hệ thống Harvard University.')
  }

  // If not logged in, show the Login Screen with Harvard background and logo
  if (!isAuthenticated) {
    return (
      <>
        <LoginView
          onLoginSuccess={(mode, userName) => {
            setPortalMode(mode)
            setIsAuthenticated(true)
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('portalMode', mode)
            showToast(`Chào mừng ${userName} đã đăng nhập thành công!`)
          }}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================= */}
      {/* ADMIN PORTAL (PHÒNG ĐÀO TẠO)                              */}
      {/* ========================================================= */}
      {portalMode === 'admin' ? (
        <>
          {/* Admin Sidebar */}
          <AdminSidebar
            activeTab={adminTab}
            setActiveTab={handleSelectAdminTab}
            onSwitchPortal={() => handleSwitchPortal('teacher')}
            onLogout={handleLogout}
          />

          {/* Admin Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSwitchPortal={() => {
                handleSwitchPortal('teacher')
                showToast('Đã chuyển sang Cổng Giảng Viên')
              }}
              onLogout={handleLogout}
            />

            <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
              {/* 1. Tổng quan */}
              {adminTab === 'overview' && (
                <AdminOverviewView
                  faculties={ADMIN_FACULTIES_STATS}
                  newSections={ADMIN_NEW_SECTIONS}
                  activities={ADMIN_ACTIVITIES}
                  recentRequests={ADMIN_RECENT_REQUESTS}
                  onNavigateTab={tab => handleSelectAdminTab(tab)}
                />
              )}

              {/* 2. Sinh viên */}
              {adminTab === 'students' && <AdminStudentsView />}

              {/* 3. Giảng viên */}
              {adminTab === 'teachers' && <AdminTeachersView />}

              {/* 4. Môn học */}
              {adminTab === 'subjects' && <AdminSubjectsView />}

              {/* 5. Học kỳ */}
              {adminTab === 'semesters' && <AdminSemestersView />}

              {/* 6. Lớp học phần */}
              {adminTab === 'sections' && <AdminSectionsView />}

              {/* 7. Phân công giảng viên */}
              {adminTab === 'assignment' && <AdminAssignmentView />}

              {/* 8. Lịch học */}
              {adminTab === 'schedule' && <AdminScheduleView />}

              {/* 9. Đơn từ học vụ */}
              {adminTab === 'requests' && (
                <AdminRequestsView
                  requests={requests}
                  onViewRequest={req => setSelectedRequest(req)}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              )}

              {/* 10. Thông báo */}
              {adminTab === 'notifications' && <AdminNotificationsView />}

              {/* 11. Tài khoản người dùng */}
              {adminTab === 'accounts' && <AdminAccountsView />}

              {/* 12. Cài đặt hệ thống */}
              {adminTab === 'settings' && <AdminSettingsView />}
            </main>
          </div>
        </>
      ) : (
        /* ========================================================= */
        /* TEACHER PORTAL (CỔNG GIẢNG VIÊN)                          */
        /* ========================================================= */
        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={handleSelectActiveTab}
            pendingRequestsCount={pendingRequestsCount}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenNotifications={() => handleSelectActiveTab('notifications')}
              onSwitchPortal={() => {
                handleSwitchPortal('admin')
                showToast('Đã chuyển sang Cổng Phòng Đào Tạo (Admin)')
              }}
            />

            <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
              {/* 1. Trang chủ */}
              {activeTab === 'dashboard' && (
                <TeacherDashboardView
                  schedule={TODAY_SCHEDULE}
                  classes={MY_CLASSES}
                  requests={requests}
                  onViewRequest={req => setSelectedRequest(req)}
                  onNavigateTab={tab => handleSelectActiveTab(tab)}
                  pendingCount={pendingRequestsCount}
                />
              )}

              {/* 2. Lớp học của tôi */}
              {activeTab === 'classes' && (
                <TeacherClassesView
                  classes={MY_CLASSES}
                  onOpenGradebook={() => setActiveTab('grades')}
                />
              )}

              {/* 3. Nhập điểm */}
              {activeTab === 'grades' && (
                <TeacherGradesView
                  classes={MY_CLASSES}
                  gradesData={gradesData}
                  onSaveGrades={handleSaveGrades}
                />
              )}

              {/* 4. Lịch giảng dạy */}
              {activeTab === 'schedule' && <TeacherScheduleView />}

              {/* 5. Sinh viên */}
              {activeTab === 'students' && <TeacherStudentsView />}

              {/* 6. Đơn từ học vụ */}
              {activeTab === 'requests' && (
                <TeacherRequestsView
                  requests={requests}
                  onViewRequest={req => setSelectedRequest(req)}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              )}

              {/* 7. Hộp thư & Thông báo */}
              {activeTab === 'notifications' && <TeacherNotificationsView />}

              {/* 8. Kho tài liệu học phần */}
              {activeTab === 'materials' && <TeacherMaterialsView />}

              {/* 9. Báo cáo - Thống kê học tập */}
              {activeTab === 'reports' && <TeacherReportsView />}
            </main>
          </div>
        </>
      )}

      {/* Detail Modal for Student Application Requests */}
      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
