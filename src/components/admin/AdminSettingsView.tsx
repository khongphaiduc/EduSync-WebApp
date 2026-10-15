import React, { useState } from 'react'
import {
  Settings,
  Building,
  BookOpen,
  Shield,
  Database,
  Save,
  CheckCircle2,
  Download,
  RefreshCw,
  Sliders,
  Server
} from 'lucide-react'

export const AdminSettingsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'academic' | 'portal' | 'security' | 'backup'>('general')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // General settings state
  const [generalConfig, setGeneralConfig] = useState({
    universityName: 'Harvard University',
    shortName: 'Harvard',
    academicYear: '2026 - 2027',
    contactEmail: 'academic@harvard.edu.vn',
    hotline: '1900 8888',
    address: 'Cambridge, MA, United States'
  })

  // Academic settings state
  const [academicConfig, setAcademicConfig] = useState({
    minCreditsPerSemester: 14,
    maxCreditsPerSemester: 24,
    passScoreGrade10: 4.0,
    passScoreGrade4: 2.0,
    gradeScale: 'Hệ 4 (A, B, C, D, F)'
  })

  // Portal settings state
  const [portalConfig, setPortalConfig] = useState({
    isCourseRegOpen: true,
    allowClassCancel: true,
    autoApproveLeaveRequests: false,
    maxAbsentPercent: 20
  })

  // Security settings state
  const [securityConfig, setSecurityConfig] = useState({
    sessionTimeoutMinutes: 60,
    require2FAForAdmin: true,
    require2FAForTeacher: false,
    enableAuditLogs: true
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    showToast('Đã lưu các thay đổi cấu hình hệ thống thành công!')
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            Cài Đặt & Cấu Hình Hệ Thống Học Vụ
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Tùy biến quy chế đào tạo, định mức tín chỉ, cổng đăng ký học phần và chính sách bảo mật
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Lưu cấu hình</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'general'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Thông tin chung</span>
        </button>

        <button
          onClick={() => setActiveSubTab('academic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'academic'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Quy chế đào tạo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('portal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'portal'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Cổng đăng ký tín chỉ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Bảo mật & Phân quyền</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sao lưu & Dữ liệu</span>
        </button>
      </div>

      {/* Tab 1: Thông tin chung */}
      {activeSubTab === 'general' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800">Thông tin cơ sở đào tạo</h2>
            <p className="text-xs text-slate-400 mt-0.5">Các thông tin hiển thị trên văn bằng, chứng chỉ và báo cáo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên trường đại học</label>
              <input
                type="text"
                value={generalConfig.universityName}
                onChange={e => setGeneralConfig({ ...generalConfig, universityName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên viết tắt</label>
              <input
                type="text"
                value={generalConfig.shortName}
                onChange={e => setGeneralConfig({ ...generalConfig, shortName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Niên khóa mặc định</label>
              <input
                type="text"
                value={generalConfig.academicYear}
                onChange={e => setGeneralConfig({ ...generalConfig, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email phòng đào tạo</label>
              <input
                type="email"
                value={generalConfig.contactEmail}
                onChange={e => setGeneralConfig({ ...generalConfig, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Đường dây nóng (Hotline)</label>
              <input
                type="text"
                value={generalConfig.hotline}
                onChange={e => setGeneralConfig({ ...generalConfig, hotline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Địa chỉ trụ sở</label>
              <input
                type="text"
                value={generalConfig.address}
                onChange={e => setGeneralConfig({ ...generalConfig, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quy chế đào tạo */}
      {activeSubTab === 'academic' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800">Quy định đào tạo theo tín chỉ</h2>
            <p className="text-xs text-slate-400 mt-0.5">Định mức tín chỉ và thang điểm đánh giá học phần</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số tín chỉ tối thiểu mỗi kỳ</label>
              <input
                type="number"
                value={academicConfig.minCreditsPerSemester}
                onChange={e =>
                  setAcademicConfig({ ...academicConfig, minCreditsPerSemester: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số tín chỉ tối đa mỗi kỳ</label>
              <input
                type="number"
                value={academicConfig.maxCreditsPerSemester}
                onChange={e =>
                  setAcademicConfig({ ...academicConfig, maxCreditsPerSemester: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Điểm qua môn tối thiểu (Hệ 10)</label>
              <input
                type="number"
                step="0.1"
                value={academicConfig.passScoreGrade10}
                onChange={e =>
                  setAcademicConfig({ ...academicConfig, passScoreGrade10: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Thang điểm áp dụng</label>
              <select
                value={academicConfig.gradeScale}
                onChange={e => setAcademicConfig({ ...academicConfig, gradeScale: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="Hệ 4 (A, B, C, D, F)">Hệ 4 chuẩn tín chỉ (A, B, C, D, F)</option>
                <option value="Hệ 10">Hệ 10 truyền thống</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cổng đăng ký tín chỉ */}
      {activeSubTab === 'portal' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800">Cấu hình Cổng Đăng Ký Học Phần</h2>
            <p className="text-xs text-slate-400 mt-0.5">Kiểm soát việc sinh viên đăng ký lớp học phần trực tuyến</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <strong className="text-xs text-slate-800 block">Mở cổng đăng ký học phần trực tuyến</strong>
                <span className="text-[11px] text-slate-400">Cho phép sinh viên đăng ký, đổi lớp trên portal</span>
              </div>
              <input
                type="checkbox"
                checked={portalConfig.isCourseRegOpen}
                onChange={e => setPortalConfig({ ...portalConfig, isCourseRegOpen: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <strong className="text-xs text-slate-800 block">Cho phép hủy học phần trong 2 tuần đầu</strong>
                <span className="text-[11px] text-slate-400">Hủy lớp không bị tính vào điểm F hoặc nợ học phí</span>
              </div>
              <input
                type="checkbox"
                checked={portalConfig.allowClassCancel}
                onChange={e => setPortalConfig({ ...portalConfig, allowClassCancel: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <strong className="text-xs text-slate-800 block">Tự động duyệt đơn xin nghỉ học &lt; 2 buổi</strong>
                <span className="text-[11px] text-slate-400">Giảm tải công việc duyệt đơn cho Ban Đào Tạo</span>
              </div>
              <input
                type="checkbox"
                checked={portalConfig.autoApproveLeaveRequests}
                onChange={e =>
                  setPortalConfig({ ...portalConfig, autoApproveLeaveRequests: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Bảo mật & Phân quyền */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800">Chính sách bảo mật hệ thống</h2>
            <p className="text-xs text-slate-400 mt-0.5">Xác thực hai yếu tố (2FA), thời gian hết hạn phiên làm việc</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Thời gian hết hạn phiên làm việc (Phút)
                </label>
                <input
                  type="number"
                  value={securityConfig.sessionTimeoutMinutes}
                  onChange={e =>
                    setSecurityConfig({ ...securityConfig, sessionTimeoutMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <strong className="text-xs text-slate-800 block">Bắt buộc 2FA cho tài khoản Admin</strong>
                <span className="text-[11px] text-slate-400">Yêu cầu mã OTP qua Email hoặc Google Authenticator</span>
              </div>
              <input
                type="checkbox"
                checked={securityConfig.require2FAForAdmin}
                onChange={e =>
                  setSecurityConfig({ ...securityConfig, require2FAForAdmin: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <strong className="text-xs text-slate-800 block">Lưu vết hoạt động (Audit Logs)</strong>
                <span className="text-[11px] text-slate-400">Ghi lại lịch sử chỉnh sửa điểm và phân công</span>
              </div>
              <input
                type="checkbox"
                checked={securityConfig.enableAuditLogs}
                onChange={e =>
                  setSecurityConfig({ ...securityConfig, enableAuditLogs: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Sao lưu & Dữ liệu */}
      {activeSubTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800">Sao lưu & Khôi phục dữ liệu</h2>
            <p className="text-xs text-slate-400 mt-0.5">Bảo toàn dữ liệu học vụ, bảng điểm và danh sách sinh viên</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Sao lưu cơ sở dữ liệu ngay</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tạo bản snapshot dữ liệu toàn bộ sinh viên, điểm thi và phân công giảng dạy.
                </p>
              </div>

              <button
                onClick={() => showToast('Đang tiến hành sao lưu cơ sở dữ liệu Harvard University...')}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tạo bản sao lưu (.sql)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Trạng thái máy chủ học vụ</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Máy chủ SQL Server: <strong>Online</strong> • Độ trễ: <strong>12ms</strong> • Bản sao lưu gần nhất:{' '}
                  <strong>14/10/2026 23:00</strong>
                </p>
              </div>

              <button
                onClick={() => showToast('Hệ thống học vụ đang hoạt động ổn định và sẵn sàng!')}
                className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>Kiểm tra kết nối</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
