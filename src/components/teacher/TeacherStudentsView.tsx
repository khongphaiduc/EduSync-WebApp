import React, { useState } from 'react'
import {
  Users,
  Download,
  Mail,
  AlertTriangle,
  CheckCircle2,
  BookOpen
} from 'lucide-react'
import { StudentsView } from '../StudentsView'

export const TeacherStudentsView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            Danh Sách Sinh Viên Các Lớp Phụ Trách
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Theo dõi tiến độ học tập, điểm rèn luyện, tình trạng điểm danh của 156 sinh viên thuộc 4 lớp giảng dạy
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => showToast('Đang xuất danh sách sinh viên các lớp phụ trách ra Excel...')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất danh sách</span>
          </button>

          <button
            onClick={() => showToast('Mở cửa sổ gửi email thông báo tới toàn thể sinh viên các lớp')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Gửi email tới lớp</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng sinh viên phụ trách</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">156 SV</span>
            <span className="text-[10px] text-blue-600 font-medium block mt-1">Thuộc 4 lớp học phần</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tỷ lệ chuyên cần TB</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">94.8%</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đạt chỉ tiêu học kỳ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Số lớp giảng dạy</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">4 lớp</span>
            <span className="text-[10px] text-purple-500 font-medium block mt-1">SE1623, SE1234, SE1710, SE1805</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Cần lưu ý học vụ</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">5 SV</span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">Vắng &gt; 20% số buổi</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Class filter selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 pl-2">Lọc theo lớp:</span>
        <button
          onClick={() => setSelectedClass('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            selectedClass === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả 4 lớp (156 SV)
        </button>
        <button
          onClick={() => setSelectedClass('SE1623')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            selectedClass === 'SE1623'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          SE1623 - Web nâng cao (45 SV)
        </button>
        <button
          onClick={() => setSelectedClass('SE1234')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            selectedClass === 'SE1234'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          SE1234 - Cơ sở dữ liệu (38 SV)
        </button>
        <button
          onClick={() => setSelectedClass('SE1710')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            selectedClass === 'SE1710'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          SE1710 - Lập trình di động (42 SV)
        </button>
        <button
          onClick={() => setSelectedClass('SE1805')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            selectedClass === 'SE1805'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          SE1805 - Kiến trúc phần mềm (31 SV)
        </button>
      </div>

      {/* Directory Component */}
      <StudentsView />

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
