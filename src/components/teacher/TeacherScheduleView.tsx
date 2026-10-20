import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CalendarDays,
  Clock,
  MapPin,
  BookOpen,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Layers,
  Grid,
  List,
  Info,
  Calendar,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  UserCheck
} from 'lucide-react'
import type { LecturerScheduleItem, LecturerScheduleResponse } from '../../types'
import { getLecturerScheduleUrl } from '../../config'
import { DEMO_LECTURER_SCHEDULE } from '../../mockData'
import { SessionAttendanceModal } from './SessionAttendanceModal'

type ViewMode = 'week' | 'month' | 'agenda'
type DayOfWeekEn = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

interface DayMeta {
  key: DayOfWeekEn
  nameVi: string
  shortVi: string
  dateStr: string // YYYY-MM-DD
  displayDate: string // DD/MM
  isToday: boolean
}

// Hàm lấy ngày Thứ Hai của tuần chứa ngày d
function getMondayOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

// Format Date sang chuỗi YYYY-MM-DD
function formatDateYMD(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Chuyển đổi chuỗi UTC ISO thành thông tin ngày/giờ theo giờ Việt Nam (UTC+7)
function parseUtcToVn(utcStr: string): {
  dateStr: string
  timeStr: string
  displayStr: string
  hour: number
  minute: number
  dateObj: Date
} {
  const d = new Date(utcStr)
  // Vietnam timezone: UTC+7
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000)
  const y = vnTime.getUTCFullYear()
  const m = String(vnTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(vnTime.getUTCDate()).padStart(2, '0')
  const dateStr = `${y}-${m}-${day}`

  const hour = vnTime.getUTCHours()
  const minute = vnTime.getUTCMinutes()
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  const displayStr = `${hh}:${mm} - ${day}/${m}/${y}`

  return { dateStr, timeStr, displayStr, hour, minute, dateObj: vnTime }
}

// Tính thời lượng buổi học
function calculateDuration(startAtUtc: string, endAtUtc: string): string {
  const start = new Date(startAtUtc).getTime()
  const end = new Date(endAtUtc).getTime()
  const diffMinutes = Math.max(0, Math.round((end - start) / (1000 * 60)))
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}p`
  if (hours > 0) return `${hours} giờ`
  return `${minutes} phút`
}

// Huy hiệu trạng thái
function getStatusBadge(status: string) {
  switch (status) {
    case 'Scheduled':
      return {
        text: 'Đã lên lịch',
        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dot: 'bg-blue-500'
      }
    case 'Completed':
      return {
        text: 'Đã hoàn thành',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500'
      }
    case 'Cancelled':
      return {
        text: 'Đã hủy',
        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-500'
      }
    default:
      return {
        text: status,
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400'
      }
  }
}

// Xuất file iCalendar (.ics) tương thích Google Calendar, Apple Calendar, Outlook
function exportToIcs(sessions: LecturerScheduleItem[], filename = 'lich-giang-day.ics') {
  const pad = (n: number) => String(n).padStart(2, '0')
  const toIcsDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  }

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EduSync//Lecturer Schedule//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ]

  sessions.forEach(s => {
    icsLines.push('BEGIN:VEVENT')
    icsLines.push(`UID:${s.id}@edusync.edu.vn`)
    icsLines.push(`DTSTAMP:${toIcsDate(new Date().toISOString())}`)
    icsLines.push(`DTSTART:${toIcsDate(s.startAtUtc)}`)
    icsLines.push(`DTEND:${toIcsDate(s.endAtUtc)}`)
    icsLines.push(`SUMMARY:${s.courseCode} - ${s.courseName} (${s.sectionCode})`)
    icsLines.push(`DESCRIPTION:Học kỳ: ${s.semesterName}\\nChủ đề: ${s.topic || 'Chưa cập nhật'}\\nTrạng thái: ${s.status}`)
    if (s.room) icsLines.push(`LOCATION:${s.room}`)
    icsLines.push(`STATUS:${s.status === 'Cancelled' ? 'CANCELLED' : 'CONFIRMED'}`)
    icsLines.push('END:VEVENT')
  })

  icsLines.push('END:VCALENDAR')
  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const TeacherScheduleView: React.FC = () => {
  // Chế độ xem: Tuần | Tháng | Danh sách
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  // Thời gian tham chiếu hiện tại (mặc định hôm nay hoặc tuần mẫu)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Nếu hôm nay là năm 2026, dùng hôm nay, còn không thì dùng mốc 2026-09-07
    const now = new Date()
    return now.getFullYear() === 2026 ? now : new Date('2026-09-07T08:00:00Z')
  })

  // Dữ liệu danh sách lịch giảng dạy từ API
  const [scheduleData, setScheduleData] = useState<LecturerScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUsingDemoData, setIsUsingDemoData] = useState<boolean>(false)

  // Bộ lọc tìm kiếm & trạng thái
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Scheduled' | 'Completed' | 'Cancelled'>('ALL')
  const [slotFilter, setSlotFilter] = useState<'ALL' | 'morning' | 'afternoon' | 'evening'>('ALL')

  // Chi tiết ca học đang xem Modal
  const [selectedSession, setSelectedSession] = useState<LecturerScheduleItem | null>(null)
  const [showApiInfoModal, setShowApiInfoModal] = useState<boolean>(false)

  // Ca học đang mở Modal điểm danh
  const [attendanceSession, setAttendanceSession] = useState<LecturerScheduleItem | null>(null)

  // Lấy token đăng nhập
  const getAuthToken = () => localStorage.getItem('accessToken')

  // Tính khoảng ngày 'from' và 'to' dựa vào viewMode và currentDate
  const dateRange = useMemo(() => {
    if (viewMode === 'month') {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      return {
        from: formatDateYMD(firstDay),
        to: formatDateYMD(lastDay),
        label: `Tháng ${month + 1}/${year}`
      }
    } else {
      // Tuần (Thứ 2 đến Chủ nhật)
      const monday = getMondayOfWeek(currentDate)
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)
      const mondayStr = formatDateYMD(monday)
      const sundayStr = formatDateYMD(sunday)

      const mDay = String(monday.getDate()).padStart(2, '0')
      const mMonth = String(monday.getMonth() + 1).padStart(2, '0')
      const sDay = String(sunday.getDate()).padStart(2, '0')
      const sMonth = String(sunday.getMonth() + 1).padStart(2, '0')

      return {
        from: mondayStr,
        to: sundayStr,
        label: `${mDay}/${mMonth} - ${sDay}/${sMonth}/${sunday.getFullYear()}`
      }
    }
  }, [currentDate, viewMode])

  // Hàm gọi API GET /api/lecturers/me/schedule?from={from}&to={to}&timeZoneId=Asia/Ho_Chi_Minh
  const fetchSchedule = useCallback(
    async (from: string, to: string, forceDemo = false) => {
      setIsLoading(true)
      setErrorMessage(null)

      if (forceDemo) {
        setIsUsingDemoData(true)
        setScheduleData(DEMO_LECTURER_SCHEDULE)
        setIsLoading(false)
        return
      }

      const token = getAuthToken()
      if (!token) {
        setErrorMessage(
          'Chưa tìm thấy Access Token của Giảng viên. Đang sử dụng dữ liệu mẫu (Demo) theo đặc tả API /api/lecturers/me/schedule.'
        )
        setIsUsingDemoData(true)
        setScheduleData(DEMO_LECTURER_SCHEDULE)
        setIsLoading(false)
        return
      }

      try {
        const url = getLecturerScheduleUrl(from, to, 'Asia/Ho_Chi_Minh')
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (response.ok) {
          const json: LecturerScheduleResponse = await response.json()
          if (json.success && Array.isArray(json.data)) {
            setScheduleData(json.data)
            setIsUsingDemoData(false)
          } else {
            setScheduleData([])
            setIsUsingDemoData(false)
          }
        } else if (response.status === 401 || response.status === 403) {
          setErrorMessage(
            'Phiên đăng nhập hết hạn hoặc tài khoản không có quyền Giảng viên (401/403). Đang hiển thị dữ liệu mẫu demo.'
          )
          setIsUsingDemoData(true)
          setScheduleData(DEMO_LECTURER_SCHEDULE)
        } else {
          const errData = await response.json().catch(() => null)
          setErrorMessage(
            errData?.message ||
              `Không thể tải lịch giảng dạy từ máy chủ (HTTP ${response.status}). Đang dùng dữ liệu demo.`
          )
          setIsUsingDemoData(true)
          setScheduleData(DEMO_LECTURER_SCHEDULE)
        }
      } catch {
        setErrorMessage(
          'Không thể kết nối tới máy chủ backend. Hệ thống tự động chuyển sang chế độ Demo dữ liệu chuẩn.'
        )
        setIsUsingDemoData(true)
        setScheduleData(DEMO_LECTURER_SCHEDULE)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Gọi API mỗi khi thay đổi khoảng ngày
  useEffect(() => {
    fetchSchedule(dateRange.from, dateRange.to)
  }, [dateRange.from, dateRange.to, fetchSchedule])

  // Chuyển tuần/tháng trước
  const handlePrev = () => {
    setCurrentDate(prev => {
      const next = new Date(prev)
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() - 1)
      } else {
        next.setDate(next.getDate() - 7)
      }
      return next
    })
  }

  // Chuyển tuần/tháng sau
  const handleNext = () => {
    setCurrentDate(prev => {
      const next = new Date(prev)
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() + 1)
      } else {
        next.setDate(next.getDate() + 7)
      }
      return next
    })
  }

  // Chuyển về hôm nay
  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Chuyển nhanh tới mốc mẫu Tháng 09/2026
  const handleJumpToSampleMonth = () => {
    setCurrentDate(new Date('2026-09-07T08:00:00Z'))
  }

  // Lọc dữ liệu theo Search, Trạng thái, Buổi học
  const filteredSessions = useMemo(() => {
    return scheduleData.filter(item => {
      // 1. Tìm kiếm văn bản
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchCourse =
          item.courseName?.toLowerCase().includes(q) ||
          item.courseCode?.toLowerCase().includes(q) ||
          item.sectionCode?.toLowerCase().includes(q)
        const matchRoom = item.room?.toLowerCase().includes(q)
        const matchTopic = item.topic?.toLowerCase().includes(q)
        const matchSemester = item.semesterName?.toLowerCase().includes(q)
        if (!matchCourse && !matchRoom && !matchTopic && !matchSemester) {
          return false
        }
      }

      // 2. Lọc trạng thái
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false
      }

      // 3. Lọc buổi học (Sáng < 12h, Chiều 12h-18h, Tối >= 18h)
      if (slotFilter !== 'ALL') {
        const { hour } = parseUtcToVn(item.startAtUtc)
        if (slotFilter === 'morning' && hour >= 12) return false
        if (slotFilter === 'afternoon' && (hour < 12 || hour >= 18)) return false
        if (slotFilter === 'evening' && hour < 18) return false
      }

      return true
    })
  }, [scheduleData, searchQuery, statusFilter, slotFilter])

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = filteredSessions.length
    const scheduled = filteredSessions.filter(s => s.status === 'Scheduled').length
    const completed = filteredSessions.filter(s => s.status === 'Completed').length
    const cancelled = filteredSessions.filter(s => s.status === 'Cancelled').length

    // Tính tổng số giờ dạy
    let totalMinutes = 0
    filteredSessions.forEach(s => {
      if (s.status !== 'Cancelled') {
        const diff = new Date(s.endAtUtc).getTime() - new Date(s.startAtUtc).getTime()
        totalMinutes += Math.max(0, diff / (1000 * 60))
      }
    })
    const totalHours = (totalMinutes / 60).toFixed(1)

    return { total, scheduled, completed, cancelled, totalHours }
  }, [filteredSessions])

  // Danh sách các ngày trong tuần đang chọn
  const weekDaysMeta = useMemo<DayMeta[]>(() => {
    const monday = getMondayOfWeek(currentDate)
    const todayStr = formatDateYMD(new Date())

    const dayTemplates: { key: DayOfWeekEn; nameVi: string; shortVi: string }[] = [
      { key: 'Monday', nameVi: 'Thứ Hai', shortVi: 'T2' },
      { key: 'Tuesday', nameVi: 'Thứ Ba', shortVi: 'T3' },
      { key: 'Wednesday', nameVi: 'Thứ Tư', shortVi: 'T4' },
      { key: 'Thursday', nameVi: 'Thứ Năm', shortVi: 'T5' },
      { key: 'Friday', nameVi: 'Thứ Sáu', shortVi: 'T6' },
      { key: 'Saturday', nameVi: 'Thứ Bảy', shortVi: 'T7' },
      { key: 'Sunday', nameVi: 'Chủ Nhật', shortVi: 'CN' }
    ]

    return dayTemplates.map((t, index) => {
      const d = new Date(monday)
      d.setDate(d.getDate() + index)
      const dateStr = formatDateYMD(d)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      return {
        ...t,
        dateStr,
        displayDate: `${day}/${month}`,
        isToday: dateStr === todayStr
      }
    })
  }, [currentDate])

  // Gom các ca học theo ngày YYYY-MM-DD
  const sessionsByDate = useMemo(() => {
    const map: Record<string, LecturerScheduleItem[]> = {}
    filteredSessions.forEach(item => {
      const { dateStr } = parseUtcToVn(item.startAtUtc)
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(item)
    })

    // Sắp xếp các ca trong cùng ngày theo giờ bắt đầu
    Object.keys(map).forEach(dateKey => {
      map[dateKey].sort(
        (a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()
      )
    })
    return map
  }, [filteredSessions])

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  Lịch Giảng Dạy Của Giảng Viên
                  {isUsingDemoData && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                      Dữ liệu mẫu
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thời khóa biểu ca dạy, phòng học, học phần và bài giảng theo giờ Việt Nam (UTC+7)
                </p>
              </div>
            </div>

            {/* API Info Endpoint Badge */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() => setShowApiInfoModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-medium transition-colors cursor-pointer"
                title="Nhấn để xem chi tiết API & Payload"
              >
                <span className="font-bold text-blue-600">GET</span>
                <span>/api/lecturers/me/schedule</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <span className="text-[11px] text-slate-400">
                Khoảng ngày: <strong className="text-slate-600 font-mono">{dateRange.from}</strong> →{' '}
                <strong className="text-slate-600 font-mono">{dateRange.to}</strong>
              </span>
            </div>
          </div>

          {/* Controls: Prev/Next, Mode Switcher & Export */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Theo Tuần</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Theo Tháng</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh Sách</span>
              </button>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-semibold">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-600"
                title="Trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                Hôm nay
              </button>

              <span className="px-2.5 py-1 text-slate-700 font-bold min-w-[140px] text-center">
                {dateRange.label}
              </span>

              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-600"
                title="Sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick jump to Sample Month 09/2026 */}
            <button
              onClick={handleJumpToSampleMonth}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200/80"
              title="Chuyển tới mốc mẫu Tháng 09/2026 trong payload"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Tháng 09/2026</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={() => fetchSchedule(dateRange.from, dateRange.to)}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Export iCal / Google Calendar */}
            <button
              onClick={() => exportToIcs(filteredSessions, `lich-giang-day-${dateRange.from}.ics`)}
              disabled={filteredSessions.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Đồng bộ Calendar (.ics)</span>
            </button>
          </div>
        </div>

        {/* Warning notification banner if error or demo data */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchSchedule(dateRange.from, dateRange.to)}
              className="px-2.5 py-1 rounded bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold shrink-0 transition-colors cursor-pointer"
            >
              Thử lại API
            </button>
          </div>
        )}
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng số ca dạy</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-400">buổi</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Đã lên lịch</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{stats.scheduled}</span>
            <span className="text-xs text-slate-400">ca học</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Đã hoàn thành</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{stats.completed}</span>
            <span className="text-xs text-slate-400">ca học</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng giờ giảng dạy</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{stats.totalHours}</span>
            <span className="text-xs text-slate-400">giờ</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã môn (CS101), tên môn, mã lớp, phòng học, bài giảng..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Trạng thái:
            </span>
            {(['ALL', 'Scheduled', 'Completed', 'Cancelled'] as const).map(st => {
              const label =
                st === 'ALL'
                  ? 'Tất cả'
                  : st === 'Scheduled'
                  ? 'Đã lên lịch'
                  : st === 'Completed'
                  ? 'Hoàn thành'
                  : 'Đã hủy'
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Time Slot filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Ca:
            </span>
            {(['ALL', 'morning', 'afternoon', 'evening'] as const).map(sl => {
              const label =
                sl === 'ALL' ? 'Cả ngày' : sl === 'morning' ? 'Sáng' : sl === 'afternoon' ? 'Chiều' : 'Tối'
              return (
                <button
                  key={sl}
                  onClick={() => setSlotFilter(sl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    slotFilter === sl
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. Main Schedule Display */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 shadow-xs flex flex-col items-center justify-center text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-800">Đang tải lịch giảng dạy của giảng viên...</p>
          <p className="text-xs text-slate-400 mt-1">
            Kết nối API GET /api/lecturers/me/schedule?from={dateRange.from}&to={dateRange.to}
          </p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 shadow-xs flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">Không có ca giảng dạy nào trong khoảng thời gian này</p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Hiện không có lịch dạy nào từ {dateRange.from} đến {dateRange.to} phù hợp với bộ lọc hiện tại.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleJumpToSampleMonth}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Xem tuần có lịch (Tháng 09/2026)
            </button>
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
                setSlotFilter('ALL')
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* VIEW 1: Theo Tuần (Weekly Timetable Grid) */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Day Headers (7 Days) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 border-b border-slate-200/80 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/80">
                {weekDaysMeta.map(d => {
                  const daySessions = sessionsByDate[d.dateStr] || []
                  return (
                    <div
                      key={d.dateStr}
                      className={`p-3 text-center transition-colors ${
                        d.isToday ? 'bg-blue-50/70 border-b-2 sm:border-b-0 sm:border-t-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`text-xs font-extrabold ${
                            d.isToday ? 'text-blue-600' : 'text-slate-700'
                          }`}
                        >
                          {d.nameVi}
                        </span>
                        {d.isToday && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-bold">
                            Hôm nay
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 font-semibold ${
                          d.isToday ? 'text-blue-500' : 'text-slate-400'
                        }`}
                      >
                        {d.displayDate}
                      </div>

                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            daySessions.length > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {daySessions.length} ca
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Day Columns Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 min-h-[480px] bg-slate-50/30">
                {weekDaysMeta.map(d => {
                  const daySessions = sessionsByDate[d.dateStr] || []
                  return (
                    <div
                      key={d.dateStr}
                      className={`p-2.5 space-y-2.5 transition-colors ${
                        d.isToday ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {daySessions.length === 0 ? (
                        <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-300">
                          <span className="text-[11px] font-medium text-slate-400">Không có ca dạy</span>
                        </div>
                      ) : (
                        daySessions.map(session => {
                          const { timeStr } = parseUtcToVn(session.startAtUtc)
                          const endParsed = parseUtcToVn(session.endAtUtc)
                          const badge = getStatusBadge(session.status)
                          const duration = calculateDuration(session.startAtUtc, session.endAtUtc)

                          return (
                            <div
                              key={session.id}
                              onClick={() => setSelectedSession(session)}
                              className="group p-3 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                            >
                              {/* Left status color strip */}
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1 ${
                                  session.status === 'Completed'
                                    ? 'bg-emerald-500'
                                    : session.status === 'Cancelled'
                                    ? 'bg-rose-500'
                                    : 'bg-blue-600'
                                }`}
                              />

                              {/* Time & Status badge */}
                              <div className="flex items-center justify-between gap-1 mb-1.5 pl-1">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-blue-600" />
                                  {timeStr} - {endParsed.timeStr}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}
                                >
                                  {badge.text}
                                </span>
                              </div>

                              {/* Course Name */}
                              <div className="pl-1">
                                <h4 className="font-bold text-slate-800 text-xs line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {session.courseName}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                                    {session.courseCode}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {session.sectionCode}
                                  </span>
                                </div>
                              </div>

                              {/* Room & Topic */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] space-y-1 pl-1">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-700 truncate">
                                    Phòng {session.room || 'Chưa xếp phòng'}
                                  </span>
                                </div>

                                {session.topic && (
                                  <div className="flex items-start gap-1.5 text-slate-500 text-[10.5px]">
                                    <BookOpen className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2 italic">
                                      {session.topic}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Footer tag: Semester & Duration & Quick Attendance */}
                              <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pl-1 pt-1.5 border-t border-slate-100">
                                <span className="truncate max-w-[90px]">{session.semesterName}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-slate-500">{duration}</span>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation()
                                      setAttendanceSession(session)
                                    }}
                                    disabled={session.status === 'Cancelled'}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                      session.status === 'Cancelled'
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200/80 shadow-2xs'
                                    }`}
                                    title={
                                      session.status === 'Cancelled'
                                        ? 'Ca học đã bị hủy, không thể điểm danh'
                                        : 'Mở điểm danh ca học này'
                                    }
                                  >
                                    <UserCheck className="w-3 h-3" />
                                    <span>Điểm danh</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: Theo Tháng (Monthly Calendar View) */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <div className="text-center font-extrabold text-slate-800 text-base mb-4">
                {dateRange.label} - Tổng quan {stats.total} ca giảng dạy
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((h, i) => (
                  <div
                    key={i}
                    className="text-center font-bold text-xs text-slate-400 py-2 border-b border-slate-100"
                  >
                    {h}
                  </div>
                ))}

                {/* Days of month grid */}
                {Array.from({ length: 35 }).map((_, idx) => {
                  // Giả lập lịch tháng từ ngày 1
                  const year = currentDate.getFullYear()
                  const month = currentDate.getMonth()
                  const firstDay = new Date(year, month, 1)
                  const startDayOfWeek = (firstDay.getDay() === 0 ? 7 : firstDay.getDay()) - 1
                  const dayNum = idx - startDayOfWeek + 1
                  const targetDate = new Date(year, month, dayNum)
                  const isCurrentMonth = targetDate.getMonth() === month
                  const dateStr = formatDateYMD(targetDate)
                  const daySessions = sessionsByDate[dateStr] || []
                  const isToday = dateStr === formatDateYMD(new Date())

                  return (
                    <div
                      key={idx}
                      className={`min-h-[95px] p-2 rounded-xl border transition-all ${
                        isCurrentMonth
                          ? isToday
                            ? 'bg-blue-50/50 border-blue-400'
                            : 'bg-white border-slate-200/70 hover:border-blue-300'
                          : 'bg-slate-50/50 border-slate-100 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center'
                              : isCurrentMonth
                              ? 'text-slate-700'
                              : 'text-slate-300'
                          }`}
                        >
                          {targetDate.getDate()}
                        </span>

                        {daySessions.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold">
                            {daySessions.length}
                          </span>
                        )}
                      </div>

                      {/* Sessions mini pills in cell */}
                      <div className="mt-1.5 space-y-1">
                        {daySessions.slice(0, 2).map(s => (
                          <div
                            key={s.id}
                            onClick={() => setSelectedSession(s)}
                            className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-semibold truncate cursor-pointer transition-colors"
                            title={`${s.courseCode}: ${s.courseName} (${s.room})`}
                          >
                            {parseUtcToVn(s.startAtUtc).timeStr} {s.courseCode}
                          </div>
                        ))}
                        {daySessions.length > 2 && (
                          <div
                            onClick={() => {
                              setCurrentDate(targetDate)
                              setViewMode('week')
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer text-center"
                          >
                            +{daySessions.length - 2} ca nữa
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: Danh Sách Chi Tiết (Agenda / List View) */}
          {viewMode === 'agenda' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Danh sách {filteredSessions.length} ca giảng dạy trong khoảng thời gian
                </span>
                <span className="text-xs text-slate-400">Nhấn vào ca dạy để xem chi tiết đầy đủ</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredSessions.map(session => {
                  const startVn = parseUtcToVn(session.startAtUtc)
                  const endVn = parseUtcToVn(session.endAtUtc)
                  const badge = getStatusBadge(session.status)
                  const duration = calculateDuration(session.startAtUtc, session.endAtUtc)

                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="p-4 hover:bg-blue-50/40 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      {/* Left: Date & Time */}
                      <div className="flex items-start sm:items-center gap-4 min-w-[200px]">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-blue-500 uppercase">
                            {startVn.dateObj.toLocaleDateString('vi-VN', { weekday: 'short' })}
                          </span>
                          <span className="text-base font-black text-blue-700 leading-none mt-0.5">
                            {startVn.dateObj.getDate()}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {startVn.timeStr} - {endVn.timeStr}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {startVn.dateStr} • {duration}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Course info & Topic */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {session.courseName}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            {session.courseCode}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Lớp: {session.sectionCode}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1 text-slate-700 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Phòng {session.room || 'Chưa xếp phòng'}</span>
                          </div>

                          <div className="flex items-center gap-1 text-slate-500">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="italic">{session.topic || 'Chưa có chủ đề bài học'}</span>
                          </div>

                          <span className="text-[11px] text-slate-400 font-medium">
                            {session.semesterName}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status badge & Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.bg}`}
                        >
                          {badge.text}
                        </span>

                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setAttendanceSession(session)
                          }}
                          disabled={session.status === 'Cancelled'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            session.status === 'Cancelled'
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 shadow-2xs'
                          }`}
                          title={
                            session.status === 'Cancelled'
                              ? 'Không thể điểm danh ca học đã hủy'
                              : 'Điểm danh ca học này'
                          }
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Điểm danh</span>
                        </button>

                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedSession(session)
                          }}
                          className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 transition-all cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. Modal Chi Tiết Ca Giảng Dạy */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Chi Tiết Ca Giảng Dạy
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedSession.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Course Title Banner */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Môn học & Học phần
                </span>
                <h4 className="text-base font-black text-slate-800 mt-0.5">
                  {selectedSession.courseName}
                </h4>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">
                    {selectedSession.courseCode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
                    Lớp: {selectedSession.sectionCode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-600 font-medium border border-slate-200">
                    {selectedSession.semesterName}
                  </span>
                </div>
              </div>

              {/* Grid 2 Columns: Time, Room, Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-[10.5px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Giờ học (Giờ VN UTC+7)
                  </span>
                  <div className="text-sm font-extrabold text-slate-800 mt-1 font-mono">
                    {parseUtcToVn(selectedSession.startAtUtc).timeStr} -{' '}
                    {parseUtcToVn(selectedSession.endAtUtc).timeStr}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {parseUtcToVn(selectedSession.startAtUtc).dateStr} (
                    {calculateDuration(selectedSession.startAtUtc, selectedSession.endAtUtc)})
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <span className="text-[10.5px] font-semibold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Phòng giảng dạy
                  </span>
                  <div className="text-sm font-extrabold text-slate-800 mt-1">
                    {selectedSession.room ? `Phòng ${selectedSession.room}` : 'Chưa xếp phòng'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Khu giảng đường chính</div>
                </div>
              </div>

              {/* Topic / Bài giảng */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[10.5px] font-semibold text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Nội dung & Chủ đề bài giảng
                </span>
                <p className="text-slate-800 font-semibold text-xs mt-1">
                  {selectedSession.topic || 'Chưa cập nhật chủ đề bài học cho buổi này'}
                </p>
              </div>

              {/* Status and Raw Timestamps */}
              <div className="p-3 rounded-xl border border-slate-200 space-y-2 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Trạng thái:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded border ${
                      getStatusBadge(selectedSession.status).bg
                    }`}
                  >
                    {getStatusBadge(selectedSession.status).text}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                  <span>StartAtUtc:</span>
                  <span className="text-slate-700">{selectedSession.startAtUtc}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>EndAtUtc:</span>
                  <span className="text-slate-700">{selectedSession.endAtUtc}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>CourseSectionId:</span>
                  <span className="text-slate-700 truncate max-w-[200px]">
                    {selectedSession.courseSectionId}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() =>
                  exportToIcs(
                    [selectedSession],
                    `lich-${selectedSession.sectionCode}-${selectedSession.id.slice(0, 8)}.ics`
                  )
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Xuất file .ics</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAttendanceSession(selectedSession)
                    setSelectedSession(null)
                  }}
                  disabled={selectedSession.status === 'Cancelled'}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs transition-all cursor-pointer ${
                    selectedSession.status === 'Cancelled'
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
                  }`}
                  title={
                    selectedSession.status === 'Cancelled'
                      ? 'Ca học đã bị hủy, không thể điểm danh'
                      : 'Mở màn hình điểm danh lớp học cho ca này'
                  }
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Điểm danh ca học</span>
                </button>

                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Thông Tin API Endpoint & Payload Specification */}
      {showApiInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Đặc Tả API Lịch Giảng Dạy Giảng Viên
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Endpoint và cấu trúc JSON Response chuẩn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiInfoModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs max-h-[70vh] overflow-y-auto font-mono">
              <div>
                <span className="font-bold text-slate-700 uppercase font-sans text-[11px]">
                  HTTP Request:
                </span>
                <div className="mt-1 p-2.5 rounded-lg bg-slate-900 text-slate-100 text-[11px] overflow-x-auto">
                  <code>
                    GET /api/lecturers/me/schedule?from={dateRange.from}&to={dateRange.to}
                    &timeZoneId=Asia/Ho_Chi_Minh
                    <br />
                    Authorization: Bearer &lt;lecturerAccessToken&gt;
                    <br />
                    Accept: application/json
                  </code>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase font-sans text-[11px]">
                  Cấu trúc Response (200 OK):
                </span>
                <pre className="mt-1 p-3 rounded-lg bg-slate-900 text-emerald-400 text-[11px] overflow-x-auto">
                  {JSON.stringify(
                    {
                      success: true,
                      message: 'Success',
                      data: scheduleData.slice(0, 1)
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowApiInfoModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Điểm Danh Buổi Học / Ca Học (GET / PUT /api/class-sessions/{sessionId}/attendance) */}
      {attendanceSession && (
        <SessionAttendanceModal
          sessionId={attendanceSession.id}
          sessionInfo={{
            id: attendanceSession.id,
            courseCode: attendanceSession.courseCode,
            courseName: attendanceSession.courseName,
            sectionCode: attendanceSession.sectionCode,
            semesterName: attendanceSession.semesterName,
            room: attendanceSession.room,
            topic: attendanceSession.topic,
            startAtUtc: attendanceSession.startAtUtc,
            endAtUtc: attendanceSession.endAtUtc,
            status: attendanceSession.status
          }}
          isOpen={Boolean(attendanceSession)}
          onClose={() => setAttendanceSession(null)}
        />
      )}
    </div>
  )
}
