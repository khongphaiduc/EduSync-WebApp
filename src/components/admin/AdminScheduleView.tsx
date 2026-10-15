import React, { useState } from 'react'
import {
  CalendarDays,
  Search,
  Filter,
  Download,
  Plus,
  Building,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'

interface ScheduleEntry {
  id: string
  day: string // 'Thứ Hai' | 'Thứ Ba' | 'Thứ Tư' | 'Thứ Năm' | 'Thứ Sáu' | 'Thứ Bảy'
  session: 'Sáng (1-3)' | 'Sáng (4-6)' | 'Chiều (7-9)' | 'Chiều (10-12)'
  classCode: string
  subjectName: string
  teacherName: string
  room: string
  building: string
  color: 'blue' | 'purple' | 'emerald' | 'amber'
}

const SCHEDULE_DATA: ScheduleEntry[] = [
  {
    id: 'sch-1',
    day: 'Thứ Hai',
    session: 'Sáng (1-3)',
    classCode: 'SE1623.1',
    subjectName: 'Lập trình Web nâng cao',
    teacherName: 'ThS. Nguyễn Văn An',
    room: 'A402',
    building: 'Tòa A',
    color: 'blue'
  },
  {
    id: 'sch-2',
    day: 'Thứ Hai',
    session: 'Chiều (7-9)',
    classCode: 'INT3401.1',
    subjectName: 'Trí tuệ nhân tạo căn bản',
    teacherName: 'TS. Vũ Phương Thảo',
    room: 'B201',
    building: 'Tòa B',
    color: 'purple'
  },
  {
    id: 'sch-3',
    day: 'Thứ Ba',
    session: 'Sáng (1-3)',
    classCode: 'SE1623.1',
    subjectName: 'Lập trình Web nâng cao',
    teacherName: 'ThS. Nguyễn Văn An',
    room: 'A402',
    building: 'Tòa A',
    color: 'blue'
  },
  {
    id: 'sch-4',
    day: 'Thứ Ba',
    session: 'Sáng (4-6)',
    classCode: 'SE1234.2',
    subjectName: 'Cơ sở dữ liệu quan hệ',
    teacherName: 'TS. Trần Thị Mai',
    room: 'A301',
    building: 'Tòa A',
    color: 'emerald'
  },
  {
    id: 'sch-5',
    day: 'Thứ Ba',
    session: 'Chiều (7-9)',
    classCode: 'SE1710.1',
    subjectName: 'Phát triển ứng dụng di động',
    teacherName: 'ThS. Lê Quang Huy',
    room: 'B201',
    building: 'Tòa B',
    color: 'amber'
  },
  {
    id: 'sch-6',
    day: 'Thứ Tư',
    session: 'Sáng (1-3)',
    classCode: 'INT2204.3',
    subjectName: 'Cơ sở dữ liệu nâng cao',
    teacherName: 'TS. Trần Thị Mai',
    room: 'A301',
    building: 'Tòa A',
    color: 'emerald'
  },
  {
    id: 'sch-7',
    day: 'Thứ Năm',
    session: 'Sáng (1-3)',
    classCode: 'SE1805.1',
    subjectName: 'Kiến trúc phần mềm',
    teacherName: 'PGS.TS. Đỗ Hoàng Long',
    room: 'A205',
    building: 'Tòa A',
    color: 'purple'
  },
  {
    id: 'sch-8',
    day: 'Thứ Sáu',
    session: 'Chiều (7-9)',
    classCode: 'BSA2001.3',
    subjectName: 'Nguyên lý kinh tế vi mô',
    teacherName: 'TS. Vũ Phương Thảo',
    room: 'C101',
    building: 'Tòa C',
    color: 'blue'
  }
]

const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const SESSIONS: Array<'Sáng (1-3)' | 'Sáng (4-6)' | 'Chiều (7-9)' | 'Chiều (10-12)'> = [
  'Sáng (1-3)',
  'Sáng (4-6)',
  'Chiều (7-9)',
  'Chiều (10-12)'
]

export const AdminScheduleView: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState('ALL')
  const [search, setSearch] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredEntries = SCHEDULE_DATA.filter(entry => {
    const matchBuilding = selectedBuilding === 'ALL' || entry.building === selectedBuilding
    const matchSearch =
      entry.classCode.toLowerCase().includes(search.toLowerCase()) ||
      entry.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      entry.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      entry.room.toLowerCase().includes(search.toLowerCase())
    return matchBuilding && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            Thời Khóa Biểu Toàn Trường & Điều Phối Phòng Học
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Quản trị thời khóa biểu các ca giảng dạy, kiểm soát trùng phòng và lên lịch học bù
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => showToast('Đang xuất thời khóa biểu toàn trường ra PDF...')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất PDF / Excel</span>
          </button>

          <button
            onClick={() => showToast('Mở biểu mẫu xếp lịch học bù hoặc đổi phòng học')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Xếp lịch học bù</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng phòng học</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">48 phòng</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Tòa A, B, C hoạt động</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Công suất sử dụng</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">84.5%</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Cao điểm lúc 08h - 11h</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Xung đột phòng học</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">0 lỗi</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">100% không trùng lịch</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tuần học hiện tại</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">Tuần 8</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">12/10 - 18/10/2026</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and week navigator */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo môn học, giảng viên, phòng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBuilding}
              onChange={e => setSelectedBuilding(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả khu giảng đường</option>
              <option value="Tòa A">Tòa A (Khu Giảng đường chính)</option>
              <option value="Tòa B">Tòa B (Khu Thực hành CNTT)</option>
              <option value="Tòa C">Tòa C (Hội trường lớn)</option>
            </select>
          </div>
        </div>

        {/* Week navigator */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-2">Tuần 8 (12/10 - 18/10/2026)</span>
          <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timetable Matrix Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-28 text-left font-bold text-slate-500 border-r border-slate-200">
                  Ca học / Tiết
                </th>
                {DAYS.map(day => (
                  <th key={day} className="py-3 px-3 text-center font-bold text-slate-700 border-r border-slate-200 last:border-r-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SESSIONS.map(session => (
                <tr key={session} className="min-h-24">
                  {/* Session label */}
                  <td className="py-4 px-3 font-bold text-slate-600 bg-slate-50/50 border-r border-slate-200 text-left align-top">
                    <div>{session}</div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {session.includes('1-3')
                        ? '08:00 - 10:30'
                        : session.includes('4-6')
                        ? '10:45 - 13:15'
                        : session.includes('7-9')
                        ? '13:30 - 16:00'
                        : '16:15 - 18:45'}
                    </span>
                  </td>

                  {/* Days cells */}
                  {DAYS.map(day => {
                    const match = filteredEntries.find(e => e.day === day && e.session === session)

                    return (
                      <td
                        key={day}
                        className="py-2 px-2 border-r border-slate-100 last:border-r-0 align-top h-24 w-1/6"
                      >
                        {match ? (
                          <div
                            onClick={() =>
                              showToast(`Lớp ${match.classCode}: ${match.subjectName} (${match.teacherName})`)
                            }
                            className={`p-2.5 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer shadow-xs ${
                              match.color === 'blue'
                                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                                : match.color === 'emerald'
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                : match.color === 'purple'
                                ? 'bg-purple-50/80 border-purple-200 text-purple-900'
                                : 'bg-amber-50/80 border-amber-200 text-amber-900'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>{match.classCode}</span>
                              <span className="px-1.5 py-0.5 rounded bg-white/70 text-slate-700">
                                {match.room}
                              </span>
                            </div>
                            <div className="font-extrabold text-[11px] mt-1 leading-snug line-clamp-2">
                              {match.subjectName}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-1.5 font-medium truncate">
                              {match.teacherName}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-xl hover:bg-slate-50/80 transition-colors">
                            <span className="text-[10px] text-slate-300 font-medium">Trống</span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
