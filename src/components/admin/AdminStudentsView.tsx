import React, { useState } from 'react'
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  CheckCircle2
} from 'lucide-react'
import { StudentsView } from '../StudentsView'
import { CreateStudentModal } from './CreateStudentModal'

export const AdminStudentsView: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleStudentCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    showToast('Tạo hồ sơ và cấp tài khoản sinh viên thành công!')
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
            Quản Lý Hồ Sơ Sinh Viên (Phòng Đào Tạo)
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Quản trị thông tin sinh viên toàn trường, tra cứu học vụ và tạo tài khoản sinh viên mới (POST /api/students)
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
      <StudentsView refreshTrigger={refreshTrigger} showAddButton={false} />

      {/* Modal Thêm sinh viên mới (POST /api/students) */}
      <CreateStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleStudentCreated}
      />

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
