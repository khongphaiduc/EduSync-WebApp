import React from 'react'
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react'
import type { FacultyStat, SectionClassItem, ActivityEvent, AdminNavTab } from '../types'

interface AdminDashboardViewProps {
  faculties: FacultyStat[]
  newSections: SectionClassItem[]
  activities: ActivityEvent[]
  recentRequests: Array<{ id: string; date: string; studentName: string; requestType: string; status: string }>
  onNavigateTab: (tab: AdminNavTab) => void
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  faculties,
  newSections,
  activities,
  recentRequests,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="rounded-2xl relative overflow-hidden bg-gradient-to-r from-blue-50 via-sky-50/70 to-blue-100/60 border border-blue-100/80 p-6 flex flex-col justify-between shadow-xs">
        {/* Subtle campus illustration in background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 pointer-events-none overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80"
            alt="Campus"
            className="w-full h-full object-cover object-left"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 60%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)'
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Xin chào, <span className="text-blue-900">Nguyễn Văn Minh</span> 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Chào mừng bạn đến với hệ thống quản lý học vụ Harvard University.
            </p>
          </div>

          <div className="hidden lg:block max-w-xs text-right pr-4">
            <p className="text-xs italic text-slate-500 leading-relaxed font-serif">
              “ Giáo dục là chìa khóa mở ra những cơ hội mới. ”
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
          {/* Card 1: Tổng sinh viên */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium block">Tổng sinh viên</span>
                <span className="text-2xl font-black text-slate-800 leading-tight">1,254</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> ↑ 5.2%
              </span>
              <span className="text-[10px] text-slate-400">so với học kỳ trước</span>
            </div>
          </div>

          {/* Card 2: Tổng giảng viên */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium block">Tổng giảng viên</span>
                <span className="text-2xl font-black text-slate-800 leading-tight">86</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> ↑ 2.4%
              </span>
              <span className="text-[10px] text-slate-400">so với học kỳ trước</span>
            </div>
          </div>

          {/* Card 3: Tổng môn học */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium block">Tổng môn học</span>
                <span className="text-2xl font-black text-slate-800 leading-tight">128</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> ↑ 3.1%
              </span>
              <span className="text-[10px] text-slate-400">so với học kỳ trước</span>
            </div>
          </div>

          {/* Card 4: Tổng lớp học phần */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium block">Tổng lớp học phần</span>
                <span className="text-2xl font-black text-slate-800 leading-tight">256</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> ↑ 8.7%
              </span>
              <span className="text-[10px] text-slate-400">so với học kỳ trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row (3 Cards: Thống kê theo học kỳ, Tỷ lệ lớp học phần, Lịch hoạt động) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Thống kê theo học kỳ (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Thống kê theo học kỳ</h2>
              </div>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer">
                <span>HK1 2026 - 2027</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 text-xs text-slate-600 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                <span className="text-[11px]">Sinh viên</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
                <span className="text-[11px]">Giảng viên</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
                <span className="text-[11px]">Lớp học phần</span>
              </div>
            </div>

            {/* Clustered Bar Chart SVG */}
            <div className="h-56 relative flex items-end justify-between pt-6 pb-2 px-2 border-b border-l border-slate-200">
              {/* Y-axis labels */}
              <div className="absolute left-[-28px] top-0 bottom-2 flex flex-col justify-between text-[9px] text-slate-400 text-right w-6">
                <span>500</span>
                <span>400</span>
                <span>300</span>
                <span>200</span>
                <span>100</span>
                <span>0</span>
              </div>

              {/* Horizontal grid lines */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-slate-100"></div>
              <div className="absolute inset-x-0 top-1/5 h-[1px] bg-slate-100"></div>
              <div className="absolute inset-x-0 top-2/5 h-[1px] bg-slate-100"></div>
              <div className="absolute inset-x-0 top-3/5 h-[1px] bg-slate-100"></div>
              <div className="absolute inset-x-0 top-4/5 h-[1px] bg-slate-100"></div>

              {/* Clustered Bars per Faculty */}
              {faculties.map((f, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="flex items-end gap-1 h-full w-full justify-center px-1">
                    {/* Blue bar: Students */}
                    <div
                      className="w-3.5 bg-blue-600 rounded-t-sm group-hover:brightness-110 transition-all cursor-pointer relative"
                      style={{ height: `${(f.students / 500) * 100}%` }}
                      title={`${f.faculty} - Sinh viên: ${f.students}`}
                    ></div>
                    {/* Rose bar: Teachers */}
                    <div
                      className="w-3.5 bg-rose-500 rounded-t-sm group-hover:brightness-110 transition-all cursor-pointer relative"
                      style={{ height: `${(f.teachers / 500) * 100}%` }}
                      title={`${f.faculty} - Giảng viên: ${f.teachers}`}
                    ></div>
                    {/* Orange bar: Sections */}
                    <div
                      className="w-3.5 bg-amber-500 rounded-t-sm group-hover:brightness-110 transition-all cursor-pointer relative"
                      style={{ height: `${(f.sections / 500) * 100}%` }}
                      title={`${f.faculty} - Lớp học phần: ${f.sections}`}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-2 truncate w-full text-center">
                    {f.faculty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Tỷ lệ lớp học phần (Span 3.5) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-4">Tỷ lệ lớp học phần</h2>

            {/* Donut Chart */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track */}
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                {/* Slice 1: Green 24.2% (~58 of 238.76) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="58 181"
                  strokeDashoffset="0"
                />
                {/* Slice 2: Blue 58.6% (~140 of 238.76) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="140 99"
                  strokeDashoffset="-58"
                />
                {/* Slice 3: Orange 17.2% (~41 of 238.76) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="41 198"
                  strokeDashoffset="-198"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-800 leading-none">256</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Lớp học phần</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                  <span className="text-slate-600">Đang diễn ra</span>
                </div>
                <span className="font-bold text-slate-800">
                  62 <span className="font-normal text-slate-400 text-[10px]">(24.2%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                  <span className="text-slate-600">Chưa bắt đầu</span>
                </div>
                <span className="font-bold text-slate-800">
                  150 <span className="font-normal text-slate-400 text-[10px]">(58.6%)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                  <span className="text-slate-600">Đã kết thúc</span>
                </div>
                <span className="font-bold text-slate-800">
                  44 <span className="font-normal text-slate-400 text-[10px]">(17.2%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Lịch hoạt động & Mini Calendar (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800">Lịch hoạt động</h2>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mini Calendar Header */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1">
              <span>Tháng 10, 2026</span>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-slate-700 transition-colors cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 hover:text-slate-700 transition-colors cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mt-1">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700 mt-1">
              <span className="text-slate-300">28</span>
              <span className="text-slate-300">29</span>
              <span className="text-slate-300">30</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>

              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>

              <span>12</span>
              <span>14</span>
              <span className="w-6 h-6 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
                14
              </span>
              <span>15</span>
              <span>16</span>
              <span>17</span>
              <span>18</span>

              <span>29</span>
              <span>20</span>
              <span>23</span>
              <span>28</span>
              <span>29</span>
              <span>30</span>
              <span>22</span>
            </div>

            {/* Activities List */}
            <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-100 text-xs">
              {activities.map(act => (
                <div key={act.id} className="flex items-start gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      act.color === 'blue'
                        ? 'bg-blue-600'
                        : act.color === 'pink'
                        ? 'bg-rose-500'
                        : act.color === 'orange'
                        ? 'bg-amber-500'
                        : 'bg-purple-600'
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 truncate">{act.title}</span>
                      <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                        {act.time}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{act.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section (2 Cards: Danh sách lớp học phần mới & Đơn từ chờ xử lý) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Danh sách lớp học phần mới (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-800">Danh sách lớp học phần mới</h2>
            </div>
            <button
              onClick={() => onNavigateTab('sections')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-semibold">Mã lớp</th>
                  <th className="pb-3 font-semibold">Môn học</th>
                  <th className="pb-3 font-semibold">Giảng viên</th>
                  <th className="pb-3 font-semibold text-center">Sĩ số</th>
                  <th className="pb-3 font-semibold">Học kỳ</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {newSections.map(sec => (
                  <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-slate-700">{sec.code}</td>
                    <td className="py-3 font-bold text-slate-800">{sec.subjectName}</td>
                    <td className="py-3 text-slate-600 font-medium">{sec.teacherName}</td>
                    <td className="py-3 text-center text-slate-700 font-semibold">{sec.studentCount}</td>
                    <td className="py-3 text-slate-500">{sec.semester}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                          sec.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : sec.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {sec.statusText}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Đơn từ chờ xử lý (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-800">Đơn từ chờ xử lý</h2>
              </div>
              <button
                onClick={() => onNavigateTab('requests')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Ngày gửi</th>
                    <th className="pb-3 font-semibold">Sinh viên</th>
                    <th className="pb-3 font-semibold">Loại đơn</th>
                    <th className="pb-3 font-semibold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 text-slate-400 text-[11px]">{req.date}</td>
                      <td className="py-3 font-semibold text-slate-800">{req.studentName}</td>
                      <td className="py-3 text-slate-600">{req.requestType}</td>
                      <td className="py-3 text-right">
                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
