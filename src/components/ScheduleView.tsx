import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, Download } from 'lucide-react'

export const ScheduleView: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState('Tuần 08 (12/10/2026 - 18/10/2026)')

  const days = [
    { name: 'Thứ Hai', date: '12/10', isToday: false },
    { name: 'Thứ Ba', date: '13/10', isToday: true },
    { name: 'Thứ Tư', date: '14/10', isToday: false },
    { name: 'Thứ Năm', date: '15/10', isToday: false },
    { name: 'Thứ Sáu', date: '16/10', isToday: false },
    { name: 'Thứ Bảy', date: '17/10', isToday: false },
    { name: 'Chủ Nhật', date: '18/10', isToday: false }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Lịch Giảng Dạy Tuần
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi thời khóa biểu phòng máy, giảng đường và lịch chấm đồ án
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setSelectedWeek('Tuần 07 (05/10/2026 - 11/10/2026)')}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-3 text-slate-700">{selectedWeek}</span>
            <button
              onClick={() => setSelectedWeek('Tuần 09 (19/10/2026 - 25/10/2026)')}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <button
            onClick={() => alert('Xuất file lịch giảng dạy sang Google Calendar / iCal')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Đồng bộ Calendar</span>
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 divide-x divide-slate-100 bg-slate-50/80 text-center">
          {days.map((d, i) => (
            <div
              key={i}
              className={`py-3.5 px-2 ${d.isToday ? 'bg-blue-50/70 border-b-2 border-blue-600' : ''}`}
            >
              <div className={`text-xs font-bold ${d.isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                {d.name}
              </div>
              <div className={`text-[11px] mt-0.5 ${d.isToday ? 'text-blue-500 font-bold' : 'text-slate-400'}`}>
                {d.date}
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Body */}
        <div className="p-4 space-y-4">
          {/* Morning Slots */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Buổi Sáng (07:00 - 11:45)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 mb-1">
                  <span>08:00 - 09:45 (Ca 1)</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">
                    Thứ 3 • Hôm nay
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Lập trình Web nâng cao</h4>
                <p className="text-xs text-slate-500 mt-0.5">Lớp: <strong>SE1623</strong> • Buổi 5/15</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-2 border-t border-blue-100">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Phòng A402 - Tòa A (Lab máy tính)</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-600 mb-1">
                  <span>10:00 - 11:45 (Ca 2)</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 text-[10px]">
                    Thứ 3 • Hôm nay
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Cơ sở dữ liệu</h4>
                <p className="text-xs text-slate-500 mt-0.5">Lớp: <strong>SE1234</strong> • Buổi 8/15</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-2 border-t border-cyan-100">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Phòng A301 - Tòa A</span>
                </div>
              </div>

              {/* Card 3 (Thứ 5) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>08:00 - 11:45 (Ca 1-2)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]">
                    Thứ 5 • 15/10
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Lập trình Web nâng cao (Thực hành)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Lớp: <strong>SE1623</strong> • Buổi 6/15</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200/80">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Phòng Lab 501 - Tòa B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Afternoon Slots */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Buổi Chiều (13:00 - 17:30)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 4 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 mb-1">
                  <span>13:00 - 14:45 (Ca 3)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">
                    Thứ 3 • Hôm nay
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Phát triển ứng dụng di động</h4>
                <p className="text-xs text-slate-500 mt-0.5">Lớp: <strong>SE1710</strong> • Buổi 3/15</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-2 border-t border-emerald-100">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Phòng B201 - Tòa B</span>
                </div>
              </div>

              {/* Card 5 */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors">
                <div className="flex items-center justify-between text-xs font-bold text-purple-600 mb-1">
                  <span>15:00 - 17:00 (Hội thảo)</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px]">
                    Thứ 6 • 16/10
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Sinh hoạt chuyên đề Khoa CNTT</h4>
                <p className="text-xs text-slate-500 mt-0.5">Báo cáo nghiên cứu khoa học AI & Big Data</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-2 border-t border-purple-100">
                  <MapPin className="w-3.5 h-3.5 text-purple-500" />
                  <span>Hội trường C1 - Tòa Trung tâm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
