import React, { useState } from 'react'
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  X,
  CheckCircle2
} from 'lucide-react'
import { StudentsView } from '../StudentsView'

export const AdminStudentsView: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [newStudent, setNewStudent] = useState({
    studentCode: '',
    fullName: '',
    email: '',
    major: 'Computer Science',
    enrollmentYear: 2026,
    phoneNumber: ''
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudent.studentCode || !newStudent.fullName || !newStudent.email) {
      alert('Vui lòng điền đầy đủ các trường thông tin bắt buộc.')
      return
    }
    setIsAddModalOpen(false)
    showToast(`Đã thêm sinh viên ${newStudent.fullName} (${newStudent.studentCode}) thành công!`)
    setNewStudent({
      studentCode: '',
      fullName: '',
      email: '',
      major: 'Computer Science',
      enrollmentYear: 2026,
      phoneNumber: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            Quản Lý Hồ Sơ 1,254 Sinh Viên (Phòng Đào Tạo)
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Quản trị thông tin sinh viên toàn trường, tra cứu học vụ, điểm rèn luyện và cảnh báo học vụ
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => showToast('Đang xuất danh sách sinh viên ra file Excel...')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => showToast('Chức năng nhập file danh sách sinh viên (.xlsx, .csv)')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập Excel</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sinh viên mới</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng sinh viên</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">1,254</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">↑ 5.2% so với kỳ trước</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang theo học</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">1,180</span>
            <span className="text-[10px] text-blue-600 font-medium block mt-1">94.1% tổng sĩ số</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã tốt nghiệp</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">62</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Đợt tốt nghiệp HK2</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Cảnh báo học vụ</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">12</span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">GPA &lt; 2.0 hoặc nợ môn</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Students Directory / View */}
      <StudentsView />

      {/* Modal Thêm sinh viên mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Thêm sinh viên mới</h3>
                  <p className="text-[11px] text-slate-400">Tạo hồ sơ sinh viên vào hệ thống Harvard University</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Mã sinh viên (MSSV) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: STU007"
                    value={newStudent.studentCode}
                    onChange={e => setNewStudent({ ...newStudent, studentCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Năm nhập học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newStudent.enrollmentYear}
                    onChange={e => setNewStudent({ ...newStudent, enrollmentYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Họ và tên sinh viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn Hoàng"
                  value={newStudent.fullName}
                  onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Email trường cấp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="hoang.nguyen@example.com"
                    value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0912 345 678"
                    value={newStudent.phoneNumber}
                    onChange={e => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Chuyên ngành đào tạo</label>
                <select
                  value={newStudent.major}
                  onChange={e => setNewStudent({ ...newStudent, major: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Computer Science">Khoa học máy tính (Computer Science)</option>
                  <option value="Software Engineering">Kỹ thuật phần mềm (Software Engineering)</option>
                  <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI)</option>
                  <option value="Information Security">An toàn thông tin</option>
                  <option value="Business Administration">Quản trị kinh doanh</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Lưu sinh viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
