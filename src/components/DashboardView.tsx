import React from 'react'
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Code2,
  Database,
  Smartphone,
  Network,
  ChevronDown,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react'
import type { ScheduleItem, ClassItem, ApplicationRequest, ActiveNavTab } from '../types'

interface DashboardViewProps {
  schedule: ScheduleItem[]
  classes: ClassItem[]
  requests: ApplicationRequest[]
  onViewRequest: (request: ApplicationRequest) => void
  onNavigateTab: (tab: ActiveNavTab) => void
  pendingCount: number
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  schedule,
  classes,
  requests,
  onViewRequest,
  onNavigateTab,
  pendingCount
}) => {
  const pendingRequests = requests.filter(r => r.status === 'pending').slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Top Section: Hero Banner & Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Hero Banner (Span 3) */}
        <div className="lg:col-span-3 rounded-2xl relative overflow-hidden bg-gradient-to-r from-blue-50 via-sky-50/80 to-blue-100/60 border border-blue-100/80 p-6 flex flex-col justify-between shadow-sm">
          {/* Subtle campus illustration in background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 pointer-events-none overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80"
              alt="Campus"
              className="w-full h-full object-cover object-left mask-radial"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 60%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)'
              }}
            />
          </div>

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Xin chào, <span className="text-blue-900">Nguyễn Văn An</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 relative z-10">
            {/* Stat 1 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-800 leading-none">4</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  Lớp học phụ trách
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-800 leading-none">156</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  Tổng sinh viên
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-800 leading-none">
                  {pendingCount}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  Đơn từ chờ xử lý
                </div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3.5 border border-white/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-800 leading-none">8</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 leading-tight">
                  Tiết dạy trong tuần
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Calendar Card (Span 1) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-slate-800">
              Thứ Ba, 14 Tháng 10, 2026
            </div>

            <div className="flex items-center justify-between mt-3 text-xs font-semibold text-slate-700">
              <span>Tháng 10, 2026</span>
              <div className="flex items-center gap-1 text-slate-400">
                <button className="p-1 hover:text-slate-700 transition-colors cursor-pointer" aria-label="Previous">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-slate-700 transition-colors cursor-pointer" aria-label="Next">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mt-3 text-[11px] font-medium text-slate-400">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

            {/* Days row */}
            <div className="grid grid-cols-7 gap-1 text-center mt-2 text-xs font-medium text-slate-700">
              <span className="py-1">12</span>
              <span className="py-1">13</span>
              <span className="py-1 w-7 h-7 mx-auto rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
                14
              </span>
              <span className="py-1">15</span>
              <span className="py-1">16</span>
              <span className="py-1">17</span>
              <span className="py-1">18</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tiết học tiếp theo:</span>
            <span className="font-semibold text-blue-600">08:00 (Phòng A402)</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Lịch giảng dạy hôm nay & Lớp học của tôi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Lịch giảng dạy hôm nay */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Lịch giảng dạy hôm nay</h2>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-6 relative pl-3">
            {/* Timeline vertical line */}
            <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-blue-200/60 pointer-events-none"></div>

            {schedule.map(item => (
              <div key={item.id} className="relative flex items-center justify-between pl-6 group">
                {/* Timeline dot */}
                <div className="absolute left-[5px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 group-hover:scale-125 transition-transform"></div>
                </div>

                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700 w-24 shrink-0">
                    {item.time}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {item.subject}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.classCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.room}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50/90 px-2.5 py-1 rounded-lg border border-blue-100/60">
                    {item.lessonNumber}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Lớp học của tôi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Lớp học của tôi</h2>
            <button
              onClick={() => onNavigateTab('classes')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-3.5">
            {classes.map(cls => {
              const renderIcon = () => {
                switch (cls.typeIcon) {
                  case 'code':
                    return (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Code2 className="w-5 h-5" />
                      </div>
                    )
                  case 'database':
                    return (
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                        <Database className="w-5 h-5" />
                      </div>
                    )
                  case 'mobile':
                    return (
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                    )
                  case 'architecture':
                    return (
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Network className="w-5 h-5" />
                      </div>
                    )
                }
              }

              return (
                <div
                  key={cls.id}
                  onClick={() => onNavigateTab('grades')}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {renderIcon()}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        {cls.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-500">{cls.code}</span>
                        {cls.semester && <span className="mx-1.5">•</span>}
                        <span>{cls.semester}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cls.studentsCount}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Sinh viên</div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                        cls.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                      }`}
                    >
                      {cls.statusText}
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Đơn từ chờ xử lý & Thống kê nhanh */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bottom Left: Đơn từ chờ xử lý (Span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">Đơn từ chờ xử lý</h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {pendingCount}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="pb-3 font-semibold">Sinh viên</th>
                  <th className="pb-3 font-semibold">Mã SV</th>
                  <th className="pb-3 font-semibold">Loại đơn</th>
                  <th className="pb-3 font-semibold">Ngày gửi</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.avatar}
                          alt={req.studentName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-semibold text-slate-800">{req.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 font-medium">{req.studentCode}</td>
                    <td className="py-3 text-slate-700 font-medium">{req.requestType}</td>
                    <td className="py-3 text-slate-400">{req.submissionDate}</td>
                    <td className="py-3">
                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                        {req.statusText}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onViewRequest(req)}
                        className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Right: Thống kê nhanh (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Thống kê nhanh</h2>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors cursor-pointer">
                <span>HK1 2026 - 2027</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Donut Chart & Legend */}
            <div className="flex items-center justify-around gap-4 py-2">
              {/* Donut Chart with SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#f1f5f9"
                    strokeWidth="11"
                    fill="transparent"
                  />
                  {/* Segment 1: Green 43.6% (circumference ~ 238.76) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#10b981"
                    strokeWidth="11"
                    fill="transparent"
                    strokeDasharray="104 135"
                    strokeDashoffset="0"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Segment 2: Blue 46.2% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#3b82f6"
                    strokeWidth="11"
                    fill="transparent"
                    strokeDasharray="110 129"
                    strokeDashoffset="-104"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Segment 3: Orange 5.1% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#f59e0b"
                    strokeWidth="11"
                    fill="transparent"
                    strokeDasharray="12 227"
                    strokeDashoffset="-214"
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Segment 4: Red 5.1% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#ef4444"
                    strokeWidth="11"
                    fill="transparent"
                    strokeDasharray="12 227"
                    strokeDashoffset="-226"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-800 leading-none">156</span>
                  <span className="text-[11px] text-slate-400 font-medium mt-0.5">Sinh viên</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0"></span>
                    <span className="text-slate-600">Đã nhập điểm</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    68 <span className="font-normal text-slate-400 text-[10px]">(43.6%)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0"></span>
                    <span className="text-slate-600">Chưa nhập điểm</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    72 <span className="font-normal text-slate-400 text-[10px]">(46.2%)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0"></span>
                    <span className="text-slate-600">Chờ phúc khảo</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    8 <span className="font-normal text-slate-400 text-[10px]">(5.1%)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0"></span>
                    <span className="text-slate-600">Chờ xử lý đơn</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    8 <span className="font-normal text-slate-400 text-[10px]">(5.1%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('grades')}
              className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-100 text-left transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  Nhập điểm nhanh
                </div>
                <div className="text-[10px] text-slate-500">Chọn lớp để nhập điểm</div>
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100 text-left transition-all flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                  Xem báo cáo
                </div>
                <div className="text-[10px] text-slate-500">Thống kê kết quả học tập</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
