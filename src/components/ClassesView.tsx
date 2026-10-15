import React, { useState } from 'react'
import {
  BookOpen,
  Users,
  Calendar,
  Plus,
  Search,
  FileSpreadsheet
} from 'lucide-react'
import type { ClassItem } from '../types'

interface ClassesViewProps {
  classes: ClassItem[]
  onOpenGradebook: (classCode: string) => void
}

export const ClassesView: React.FC<ClassesViewProps> = ({ classes, onOpenGradebook }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming'>('all')
  const [search, setSearch] = useState('')

  const filtered = classes.filter(c => {
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Quản Lý Lớp Học Phụ Trách
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Học kỳ 1 (Năm học 2026 - 2027) • Tổng cộng {classes.length} lớp giảng dạy
          </p>
        </div>

        <button
          onClick={() => alert('Mở form tạo lớp học phần mới hoặc import danh sách sinh viên')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp mới</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học phần hoặc mã lớp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filterStatus === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Tất cả ({classes.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filterStatus === 'active'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Đang học (3)
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filterStatus === 'upcoming'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Chưa bắt đầu (1)
          </button>
        </div>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(cls => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {cls.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mt-2">{cls.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cls.semester}</p>
                </div>

                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${cls.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                >
                  {cls.statusText}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Sĩ số</span>
                  <strong className="text-slate-800 font-bold text-sm flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {cls.studentsCount} SV
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Số tín chỉ</span>
                  <strong className="text-slate-800 font-bold text-sm flex items-center gap-1 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> 3 TC
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lịch học</span>
                  <strong className="text-slate-800 font-bold text-sm flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Thứ 3, 5
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Tiến độ học phần:</span>
                  <span className="font-semibold text-slate-700">8 / 15 buổi</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(8 / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onOpenGradebook(cls.code)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Nhập điểm</span>
              </button>

              <button
                onClick={() => alert(`Xem danh sách 45 sinh viên lớp ${cls.code}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Danh sách SV</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
