import { useState } from 'react'
import { LoginView } from './components/LoginView'

// Lecturer components
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { DashboardView } from './components/DashboardView'
import { GradeEntryView } from './components/GradeEntryView'
import { ClassesView } from './components/ClassesView'
import { RequestsView } from './components/RequestsView'
import { ScheduleView } from './components/ScheduleView'
import { StudentsView } from './components/StudentsView'
import { RequestDetailModal } from './components/RequestDetailModal'

// Admin components
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'
import { AdminDashboardView } from './components/AdminDashboardView'

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
import { FileText, BarChart3, Bell, Download, Award, CheckCircle2, Plus, Users, BookOpen, Layers } from 'lucide-react'

export default function App() {
  // Authentication state: starts on the Login screen as requested!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Mode switcher: defaults to 'admin' (Phòng Đào Tạo)
  const [portalMode, setPortalMode] = useState<PortalMode>('admin')

  // Teacher navigation state
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard')

  // Admin navigation state
  const [adminTab, setAdminTab] = useState<AdminNavTab>('overview')

  const [searchQuery, setSearchQuery] = useState('')
  const [requests, setRequests] = useState<ApplicationRequest[]>(INITIAL_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<ApplicationRequest | null>(null)
  const [gradesData, setGradesData] = useState<Record<string, StudentGrade[]>>(INITIAL_STUDENTS_GRADES)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
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
            setActiveTab={setAdminTab}
            onSwitchPortal={() => setPortalMode('teacher')}
            onLogout={handleLogout}
          />

          {/* Admin Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSwitchPortal={() => {
                setPortalMode('teacher')
                showToast('Đã chuyển sang Cổng Giảng Viên')
              }}
              onLogout={handleLogout}
            />

            <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
              {/* Admin Overview (Recreates user image 100%!) */}
              {adminTab === 'overview' && (
                <AdminDashboardView
                  faculties={ADMIN_FACULTIES_STATS}
                  newSections={ADMIN_NEW_SECTIONS}
                  activities={ADMIN_ACTIVITIES}
                  recentRequests={ADMIN_RECENT_REQUESTS}
                  onNavigateTab={tab => setAdminTab(tab)}
                />
              )}

              {/* Admin: Sinh viên */}
              {adminTab === 'students' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Quản Lý Toàn Bộ 1,254 Sinh Viên (Phòng Đào Tạo)
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Hồ sơ sinh viên toàn trường, tra cứu điểm rèn luyện, học phí và cảnh báo học vụ
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Mở form thêm sinh viên mới hoặc nhập file Excel')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm sinh viên mới</span>
                    </button>
                  </div>
                  <StudentsView />
                </div>
              )}

              {/* Admin: Giảng viên */}
              {adminTab === 'teachers' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Award className="w-6 h-6 text-rose-500" />
                        Danh Sách 86 Giảng Viên Toàn Trường
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Quản lý định mức giờ giảng, học hàm học vị và phân công bộ môn
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Mở form thêm giảng viên mới')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm giảng viên</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                          alt="TS. Nguyễn Văn An"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                        />
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">ThS. Nguyễn Văn An</h3>
                          <p className="text-xs text-blue-600">Khoa CNTT - Bộ môn KTPM</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Lớp phụ trách:</span>
                          <strong className="text-slate-700">4 lớp</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Định mức giờ giảng:</span>
                          <strong className="text-emerald-600">Đã đạt 100%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                          alt="TS. Trần Thị Mai"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-100"
                        />
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">TS. Trần Thị Mai</h3>
                          <p className="text-xs text-rose-600">Khoa CNTT - Bộ môn KHMT</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Lớp phụ trách:</span>
                          <strong className="text-slate-700">3 lớp</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Định mức giờ giảng:</span>
                          <strong className="text-emerald-600">Đã đạt 100%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                          alt="ThS. Lê Quang Huy"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100"
                        />
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">ThS. Lê Quang Huy</h3>
                          <p className="text-xs text-purple-600">Khoa Kinh Tế & QTKD</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Lớp phụ trách:</span>
                          <strong className="text-slate-700">5 lớp</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Định mức giờ giảng:</span>
                          <strong className="text-emerald-600">Đã đạt 110%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin: Môn học (128 môn) */}
              {adminTab === 'subjects' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-emerald-600" />
                        Danh Mục 128 Môn Học Đào Tạo
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Chương trình khung cử nhân & kỹ sư hệ chính quy
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Thêm môn học mới')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm cursor-pointer"
                    >
                      Thêm môn học mới
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 font-bold">Mã môn</th>
                          <th className="py-3 px-4 font-bold">Tên môn học</th>
                          <th className="py-3 px-4 font-bold">Khoa phụ trách</th>
                          <th className="py-3 px-4 font-bold text-center">Số tín chỉ</th>
                          <th className="py-3 px-4 font-bold text-center">Số lớp mở kỳ này</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-blue-600">INT3102</td>
                          <td className="py-3 px-4 font-bold text-slate-800">Lập trình .NET & C# nâng cao</td>
                          <td className="py-3 px-4 text-slate-600">Khoa CNTT</td>
                          <td className="py-3 px-4 text-center font-bold">3 TC</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">8 lớp</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-blue-600">INT2204</td>
                          <td className="py-3 px-4 font-bold text-slate-800">Cơ sở dữ liệu quan hệ</td>
                          <td className="py-3 px-4 text-slate-600">Khoa CNTT</td>
                          <td className="py-3 px-4 text-center font-bold">4 TC</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">12 lớp</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-blue-600">INT3115</td>
                          <td className="py-3 px-4 font-bold text-slate-800">Phát triển ứng dụng Web</td>
                          <td className="py-3 px-4 text-slate-600">Khoa CNTT</td>
                          <td className="py-3 px-4 text-center font-bold">3 TC</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">10 lớp</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-blue-600">BSA2001</td>
                          <td className="py-3 px-4 font-bold text-slate-800">Nguyên lý kinh tế vi mô</td>
                          <td className="py-3 px-4 text-slate-600">Khoa Kinh tế</td>
                          <td className="py-3 px-4 text-center font-bold">3 TC</td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold">14 lớp</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Admin: Lớp học phần (256 lớp) */}
              {adminTab === 'sections' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-amber-500" />
                        Quản Lý 256 Lớp Học Phần (Học kỳ 1, 2026 - 2027)
                      </h1>
                      <p className="text-xs text-slate-400 mt-1">
                        Theo dõi sĩ số, trạng thái điểm danh và tiến độ nộp điểm của từng lớp
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Mở form tạo lớp học phần mới')}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm cursor-pointer"
                    >
                      Mở lớp học phần mới
                    </button>
                  </div>
                  <ClassesView classes={MY_CLASSES} onOpenGradebook={() => alert('Chi tiết sổ điểm phòng đào tạo')} />
                </div>
              )}

              {/* Admin: Đơn từ học vụ */}
              {adminTab === 'requests' && (
                <RequestsView
                  requests={requests}
                  onViewRequest={req => setSelectedRequest(req)}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              )}

              {/* Admin: Lịch học & thời khóa biểu */}
              {adminTab === 'schedule' && <ScheduleView />}

              {/* Admin: Các tab còn lại */}
              {['semesters', 'assignment', 'notifications', 'accounts', 'settings'].includes(adminTab) && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Phân hệ {adminTab.toUpperCase()} (Phòng Quản Lý Đào Tạo)
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Hệ thống đang đồng bộ dữ liệu thời gian thực từ cơ sở dữ liệu máy chủ đào tạo nhà trường.
                  </p>
                  <button
                    onClick={() => setAdminTab('overview')}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Quay về Tổng quan Admin
                  </button>
                </div>
              )}
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
            setActiveTab={setActiveTab}
            pendingRequestsCount={pendingRequestsCount}
            onLogout={handleLogout}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Header
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenNotifications={() => setActiveTab('notifications')}
              onSwitchPortal={() => {
                setPortalMode('admin')
                showToast('Đã chuyển sang Cổng Phòng Đào Tạo (Admin)')
              }}
            />

            <main className="flex-1 p-6 sm:p-8 max-w-[1600px] w-full mx-auto">
              {activeTab === 'dashboard' && (
                <DashboardView
                  schedule={TODAY_SCHEDULE}
                  classes={MY_CLASSES}
                  requests={requests}
                  onViewRequest={req => setSelectedRequest(req)}
                  onNavigateTab={tab => setActiveTab(tab)}
                  pendingCount={pendingRequestsCount}
                />
              )}

              {activeTab === 'classes' && (
                <ClassesView
                  classes={MY_CLASSES}
                  onOpenGradebook={() => setActiveTab('grades')}
                />
              )}

              {activeTab === 'grades' && (
                <GradeEntryView
                  classes={MY_CLASSES}
                  gradesData={gradesData}
                  onSaveGrades={handleSaveGrades}
                />
              )}

              {activeTab === 'schedule' && <ScheduleView />}

              {activeTab === 'students' && <StudentsView />}

              {activeTab === 'requests' && (
                <RequestsView
                  requests={requests}
                  onViewRequest={req => setSelectedRequest(req)}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-blue-600" />
                    Hộp Thư & Thông Báo Hệ Thống
                  </h1>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                    <Download className="w-6 h-6 text-blue-600" />
                    Kho Tài Liệu Học Phần
                  </h1>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
                  <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    Báo Cáo - Thống Kê Học Tập
                  </h1>
                </div>
              )}
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
