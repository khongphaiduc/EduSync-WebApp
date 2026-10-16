import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building,
  Edit3,
  AlertTriangle,
  Layers,
  Filter,
  Check
} from 'lucide-react'
import type {
  ApiCourseSectionItem,
  ApiClassSessionItem,
  WeeklySlotRequest,
  GenerateSessionsRequest,
  GenerateSessionsResponse,
  ApiClassSessionListResponse,
  UpdateClassSessionRequest,
  UpdateClassSessionResponse,
  ApiCourseSectionListResponse
} from '../../types'
import {
  getCourseSectionsUrl,
  getGenerateSessionsUrl,
  getSectionSessionsUrl,
  getUpdateSessionUrl
} from '../../config'

// Các thứ trong tuần tiếng Anh tương ứng với API
type DayOfWeekEn = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

const DAYS_OF_WEEK: { key: DayOfWeekEn; labelVi: string; shortVi: string }[] = [
  { key: 'Monday', labelVi: 'Thứ Hai', shortVi: 'T2' },
  { key: 'Tuesday', labelVi: 'Thứ Ba', shortVi: 'T3' },
  { key: 'Wednesday', labelVi: 'Thứ Tư', shortVi: 'T4' },
  { key: 'Thursday', labelVi: 'Thứ Năm', shortVi: 'T5' },
  { key: 'Friday', labelVi: 'Thứ Sáu', shortVi: 'T6' },
  { key: 'Saturday', labelVi: 'Thứ Bảy', shortVi: 'T7' },
  { key: 'Sunday', labelVi: 'Chủ Nhật', shortVi: 'CN' }
]

// Hàm tiện ích: Lấy ngày Thứ Hai của tuần chứa ngày d
function getMondayOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

// Format ngày thành YYYY-MM-DD
function formatDateYMD(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format ngày hiển thị tiếng Việt DD/MM/YYYY
function formatDateDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Chuyển đổi chuỗi UTC ISO thành thông tin ngày/giờ theo giờ Việt Nam (UTC+7)
function parseUtcToVn(utcStr: string): {
  dateStr: string
  timeStr: string
  displayStr: string
  dayOfWeekEn: DayOfWeekEn
  hour: number
  minute: number
} {
  const d = new Date(utcStr)
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

  const dayMap: DayOfWeekEn[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]
  const dayOfWeekEn = dayMap[vnTime.getUTCDay()]

  const displayStr = `${hh}:${mm} - ${day}/${m}/${y}`
  return { dateStr, timeStr, displayStr, dayOfWeekEn, hour, minute }
}

// Chuyển đổi ngày (YYYY-MM-DD) và giờ (HH:mm hoặc HH:mm:ss) theo giờ VN sang chuỗi UTC ISO (có hậu tố Z)
function localVnToUtcIso(dateStr: string, timeStr: string): string {
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1] || '0', 10)
  const seconds = parseInt(parts[2] || '0', 10)

  const [year, month, day] = dateStr.split('-').map(Number)
  // Giờ Việt Nam là UTC+7, nên giờ UTC = hours - 7
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 7, minutes, seconds))
  return utcDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// Chuyển đổi mã trạng thái sang hiển thị tiếng Việt
function getStatusBadge(status: string) {
  switch (status) {
    case 'Scheduled':
      return {
        text: 'Đã lên lịch',
        bg: 'bg-blue-50 text-blue-700 border-blue-200'
      }
    case 'Completed':
      return {
        text: 'Đã hoàn thành',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    case 'Cancelled':
      return {
        text: 'Đã hủy',
        bg: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    default:
      return {
        text: status,
        bg: 'bg-slate-50 text-slate-700 border-slate-200'
      }
  }
}

export const AdminScheduleView: React.FC = () => {
  // 1. Danh sách lớp học phần để chọn
  const [sections, setSections] = useState<ApiCourseSectionItem[]>([])
  const [isLoadingSections, setIsLoadingSections] = useState<boolean>(true)
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')

  // 2. Thời gian tuần đang chọn (bắt đầu từ Thứ Hai)
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfWeek(new Date()))

  // 3. Danh sách các buổi học của lớp học phần được chọn
  const [sessions, setSessions] = useState<ApiClassSessionItem[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  // 4. Tìm kiếm & bộ lọc
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Scheduled' | 'Completed' | 'Cancelled'>('ALL')
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar')

  // 5. Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // 6. Modal Lập lịch học hằng tuần
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [conflictErrors, setConflictErrors] = useState<string[]>([])
  const [generateForm, setGenerateForm] = useState<{
    sectionId: string
    fromDate: string
    toDate: string
    timeZoneId: string
    weeklySlots: WeeklySlotRequest[]
    excludeDateInput: string
    excludeDates: string[]
  }>({
    sectionId: '',
    fromDate: '',
    toDate: '',
    timeZoneId: 'Asia/Ho_Chi_Minh',
    weeklySlots: [
      {
        dayOfWeek: 'Monday',
        startTime: '07:30',
        endTime: '10:00',
        room: 'A101'
      }
    ],
    excludeDateInput: '',
    excludeDates: []
  })

  // 7. Modal Chỉnh sửa một buổi học (PATCH)
  const [editingSession, setEditingSession] = useState<ApiClassSessionItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    dateStr: string
    startTime: string
    endTime: string
    room: string
    clearRoom: boolean
    topic: string
    clearTopic: boolean
    status: 'Scheduled' | 'Completed' | 'Cancelled' | string
  }>({
    dateStr: '',
    startTime: '07:30',
    endTime: '10:00',
    room: '',
    clearRoom: false,
    topic: '',
    clearTopic: false,
    status: 'Scheduled'
  })

  // Tính ngày Chủ Nhật của tuần hiện tại
  const currentSunday = useMemo(() => {
    const sun = new Date(currentMonday)
    sun.setDate(sun.getDate() + 6)
    return sun
  }, [currentMonday])

  // Lấy token đăng nhập
  const getAuthToken = () => localStorage.getItem('accessToken')

  // Lấy danh sách lớp học phần
  const fetchSections = useCallback(async () => {
    setIsLoadingSections(true)
    const token = getAuthToken()
    if (!token) {
      setIsLoadingSections(false)
      return
    }

    try {
      const response = await fetch(getCourseSectionsUrl(1, 100), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const json: ApiCourseSectionListResponse = await response.json()
        if (json.success && json.data?.items) {
          setSections(json.data.items)
          // Tự động chọn lớp đầu tiên nếu chưa chọn
          if (json.data.items.length > 0 && !selectedSectionId) {
            setSelectedSectionId(json.data.items[0].id)
          }
        }
      }
    } catch {
      // Bỏ qua lỗi kết nối ban đầu
    } finally {
      setIsLoadingSections(false)
    }
  }, [selectedSectionId])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  // Gọi API lấy lịch của lớp học phần được chọn trong khoảng tuần đang xem
  const fetchSessions = useCallback(async () => {
    if (!selectedSectionId) {
      setSessions([])
      return
    }

    setIsLoadingSessions(true)
    setSessionsError(null)

    const token = getAuthToken()
    if (!token) {
      setSessionsError('Vui lòng đăng nhập với tài khoản Quản trị viên.')
      setIsLoadingSessions(false)
      return
    }

    const fromStr = formatDateYMD(currentMonday)
    const toStr = formatDateYMD(currentSunday)

    try {
      const url = getSectionSessionsUrl(selectedSectionId, fromStr, toStr, 'Asia/Ho_Chi_Minh')
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const json: ApiClassSessionListResponse = await response.json()
        if (json.success && Array.isArray(json.data)) {
          setSessions(json.data)
        } else {
          setSessions([])
        }
      } else if (response.status === 404) {
        setSessions([])
        setSessionsError('Lớp học phần không tồn tại hoặc đã bị xóa.')
      } else {
        const errorJson = await response.json().catch(() => null)
        setSessions([])
        setSessionsError(errorJson?.message || 'Không thể tải lịch học.')
      }
    } catch {
      setSessions([])
      setSessionsError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.')
    } finally {
      setIsLoadingSessions(false)
    }
  }, [selectedSectionId, currentMonday, currentSunday])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Điều hướng tuần
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday)
    prev.setDate(prev.getDate() - 7)
    setCurrentMonday(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(currentMonday)
    next.setDate(next.getDate() + 7)
    setCurrentMonday(next)
  }

  const handleThisWeek = () => {
    setCurrentMonday(getMondayOfWeek(new Date()))
  }

  // Mở modal tạo lịch học hằng tuần
  const handleOpenGenerateModal = () => {
    setGenerateError(null)
    setConflictErrors([])
    const fromStr = formatDateYMD(currentMonday)
    const toDate = new Date(currentMonday)
    toDate.setDate(toDate.getDate() + 69) // Mặc định 10 tuần
    const toStr = formatDateYMD(toDate)

    setGenerateForm({
      sectionId: selectedSectionId || (sections[0]?.id ?? ''),
      fromDate: fromStr,
      toDate: toStr,
      timeZoneId: 'Asia/Ho_Chi_Minh',
      weeklySlots: [
        {
          dayOfWeek: 'Monday',
          startTime: '07:30',
          endTime: '10:00',
          room: 'A101'
        }
      ],
      excludeDateInput: '',
      excludeDates: []
    })
    setIsGenerateModalOpen(true)
  }

  // Thêm khung giờ trong tuần
  const handleAddSlot = () => {
    setGenerateForm(prev => ({
      ...prev,
      weeklySlots: [
        ...prev.weeklySlots,
        {
          dayOfWeek: 'Thursday',
          startTime: '13:00',
          endTime: '15:30',
          room: ''
        }
      ]
    }))
  }

  // Xóa khung giờ
  const handleRemoveSlot = (index: number) => {
    if (generateForm.weeklySlots.length <= 1) return
    setGenerateForm(prev => ({
      ...prev,
      weeklySlots: prev.weeklySlots.filter((_, i) => i !== index)
    }))
  }

  // Thêm ngày loại trừ (nghỉ lễ)
  const handleAddExcludeDate = () => {
    const date = generateForm.excludeDateInput.trim()
    if (!date) return
    if (!generateForm.excludeDates.includes(date)) {
      setGenerateForm(prev => ({
        ...prev,
        excludeDates: [...prev.excludeDates, date].sort(),
        excludeDateInput: ''
      }))
    }
  }

  // Xóa ngày loại trừ
  const handleRemoveExcludeDate = (dateToRemove: string) => {
    setGenerateForm(prev => ({
      ...prev,
      excludeDates: prev.excludeDates.filter(d => d !== dateToRemove)
    }))
  }

  // Submit tạo lịch học hằng tuần
  const handleSubmitGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerateError(null)
    setConflictErrors([])

    if (!generateForm.sectionId) {
      setGenerateError('Vui lòng chọn lớp học phần cần lập lịch.')
      return
    }
    if (!generateForm.fromDate || !generateForm.toDate) {
      setGenerateError('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.')
      return
    }
    if (generateForm.fromDate > generateForm.toDate) {
      setGenerateError('Ngày bắt đầu không được lớn hơn ngày kết thúc.')
      return
    }
    if (generateForm.weeklySlots.length === 0) {
      setGenerateError('Vui lòng thêm ít nhất một khung giờ học trong tuần.')
      return
    }

    const token = getAuthToken()
    if (!token) {
      setGenerateError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      return
    }

    setIsGenerating(true)

    try {
      // Định dạng lại startTime và endTime thành HH:mm:ss
      const formattedSlots: WeeklySlotRequest[] = generateForm.weeklySlots.map(slot => {
        const start = slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime
        const end = slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime
        const res: WeeklySlotRequest = {
          dayOfWeek: slot.dayOfWeek,
          startTime: start,
          endTime: end
        }
        if (slot.room && slot.room.trim()) {
          res.room = slot.room.trim()
        }
        return res
      })

      const payload: GenerateSessionsRequest = {
        fromDate: generateForm.fromDate,
        toDate: generateForm.toDate,
        timeZoneId: generateForm.timeZoneId || 'Asia/Ho_Chi_Minh',
        weeklySlots: formattedSlots
      }

      if (generateForm.excludeDates.length > 0) {
        payload.excludeDates = generateForm.excludeDates
      }

      const response = await fetch(getGenerateSessionsUrl(generateForm.sectionId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json: GenerateSessionsResponse = await response.json().catch(() => ({
        success: false,
        message: 'Lỗi không xác định từ máy chủ.'
      }))

      if (response.status === 201 || (response.ok && json.success)) {
        const count = json.data?.createdCount ?? 0
        showToast(`Đã tạo thành công ${count} buổi học cho lớp học phần!`)
        setIsGenerateModalOpen(false)
        // Nếu lớp được tạo lịch trùng với lớp đang xem, tải lại danh sách buổi học
        if (generateForm.sectionId === selectedSectionId) {
          fetchSessions()
        } else {
          setSelectedSectionId(generateForm.sectionId)
        }
      } else if (response.status === 409) {
        // Xung đột lịch học
        const parsedConflicts: string[] = []
        if (json.errors) {
          Object.values(json.errors).forEach(errList => {
            if (Array.isArray(errList)) {
              errList.forEach(rawMsg => {
                const match = rawMsg.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z):\s*(.*)$/)
                if (match) {
                  const utcTime = match[1]
                  const desc = match[2]
                  const { displayStr } = parseUtcToVn(utcTime)
                  let viDesc = desc
                  if (desc.includes('Lecturer already has a class')) {
                    viDesc = 'Giảng viên đã có lịch giảng dạy trùng khung giờ này.'
                  } else if (desc.includes('is occupied')) {
                    viDesc = desc.replace(
                      /Room (.*) is occupied at this time\./,
                      'Phòng $1 đã có lớp khác sử dụng vào thời điểm này.'
                    )
                  }
                  parsedConflicts.push(`${displayStr} — ${viDesc}`)
                } else {
                  parsedConflicts.push(rawMsg)
                }
              })
            }
          })
        }

        setConflictErrors(parsedConflicts)
        setGenerateError(
          json.message === 'Schedule conflict.'
            ? 'Phát hiện xung đột lịch học. Vui lòng kiểm tra chi tiết các buổi bị trùng bên dưới.'
            : json.message || 'Trùng lịch học hoặc phòng học.'
        )
      } else if (response.status === 404) {
        setGenerateError('Không tìm thấy lớp học phần này trên hệ thống.')
      } else {
        setGenerateError(json.message || 'Không thể tạo lịch học. Vui lòng kiểm tra lại thông tin.')
      }
    } catch {
      setGenerateError('Lỗi kết nối máy chủ khi tạo lịch học. Vui lòng thử lại.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Mở modal chỉnh sửa một buổi học
  const handleOpenEditModal = (session: ApiClassSessionItem) => {
    setEditingSession(session)
    setEditError(null)

    const parsedStart = parseUtcToVn(session.startAtUtc)
    const parsedEnd = parseUtcToVn(session.endAtUtc)

    setEditForm({
      dateStr: parsedStart.dateStr,
      startTime: parsedStart.timeStr,
      endTime: parsedEnd.timeStr,
      room: session.room || '',
      clearRoom: false,
      topic: session.topic || '',
      clearTopic: false,
      status: session.status || 'Scheduled'
    })

    setIsEditModalOpen(true)
  }

  // Submit cập nhật buổi học (PATCH)
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession) return

    setEditError(null)
    const token = getAuthToken()
    if (!token) {
      setEditError('Phiên đăng nhập đã hết hạn.')
      return
    }

    if (!editForm.dateStr || !editForm.startTime || !editForm.endTime) {
      setEditError('Vui lòng điền đầy đủ ngày học và thời gian bắt đầu, kết thúc.')
      return
    }

    setIsSavingEdit(true)

    try {
      // Chuyển đổi giờ địa phương Việt Nam sang UTC ISO string (có hậu tố Z)
      const startAtUtc = localVnToUtcIso(editForm.dateStr, editForm.startTime)
      const endAtUtc = localVnToUtcIso(editForm.dateStr, editForm.endTime)

      const payload: UpdateClassSessionRequest = {
        startAtUtc,
        endAtUtc,
        status: editForm.status,
        timeZoneId: 'Asia/Ho_Chi_Minh'
      }

      if (editForm.clearRoom) {
        payload.clearRoom = true
      } else if (editForm.room.trim()) {
        payload.room = editForm.room.trim()
      }

      if (editForm.clearTopic) {
        payload.clearTopic = true
      } else if (editForm.topic.trim()) {
        payload.topic = editForm.topic.trim()
      }

      const response = await fetch(getUpdateSessionUrl(editingSession.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json: UpdateClassSessionResponse = await response.json().catch(() => ({
        success: false,
        message: 'Lỗi không xác định.'
      }))

      if (response.ok && json.success) {
        showToast('Đã cập nhật thông tin buổi học thành công!')
        setIsEditModalOpen(false)
        fetchSessions()
      } else if (response.status === 409) {
        setEditError('Xung đột lịch học: Giảng viên hoặc phòng học đã có lịch trong khung giờ này.')
      } else if (response.status === 404) {
        setEditError('Buổi học không tồn tại hoặc đã bị xóa.')
      } else {
        setEditError(json.message || 'Không thể cập nhật buổi học.')
      }
    } catch {
      setEditError('Không thể kết nối đến máy chủ. Vui lòng thử lại.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Hủy nhanh buổi học (status = 'Cancelled')
  const handleQuickCancelSession = async () => {
    if (!editingSession) return
    const token = getAuthToken()
    if (!token) return

    if (!window.confirm('Bạn có chắc chắn muốn hủy buổi học này?')) return

    setIsSavingEdit(true)
    try {
      const payload: UpdateClassSessionRequest = {
        status: 'Cancelled'
      }

      const response = await fetch(getUpdateSessionUrl(editingSession.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        showToast('Đã hủy buổi học thành công.')
        setIsEditModalOpen(false)
        fetchSessions()
      } else {
        const json = await response.json().catch(() => null)
        setEditError(json?.message || 'Không thể hủy buổi học.')
      }
    } catch {
      setEditError('Lỗi kết nối khi gửi yêu cầu hủy buổi học.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Lọc danh sách buổi học
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchStatus = statusFilter === 'ALL' || session.status === statusFilter
      const matchSearch =
        search === '' ||
        (session.room && session.room.toLowerCase().includes(search.toLowerCase())) ||
        (session.topic && session.topic.toLowerCase().includes(search.toLowerCase())) ||
        (session.status && session.status.toLowerCase().includes(search.toLowerCase()))
      return matchStatus && matchSearch
    })
  }, [sessions, statusFilter, search])

  // Lấy thông tin lớp học phần hiện tại
  const currentSection = useMemo(() => {
    return sections.find(s => s.id === selectedSectionId)
  }, [sections, selectedSectionId])

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = sessions.length
    const scheduled = sessions.filter(s => s.status === 'Scheduled').length
    const completed = sessions.filter(s => s.status === 'Completed').length
    const cancelled = sessions.filter(s => s.status === 'Cancelled').length
    return { total, scheduled, completed, cancelled }
  }, [sessions])

  // Tạo cấu trúc ngày trong tuần hiện tại (7 ngày từ T2 đến CN)
  const weekDays = useMemo(() => {
    return DAYS_OF_WEEK.map((dayInfo, idx) => {
      const d = new Date(currentMonday)
      d.setDate(d.getDate() + idx)
      const dateYmd = formatDateYMD(d)
      const daySessions = filteredSessions.filter(s => {
        const parsed = parseUtcToVn(s.startAtUtc)
        return parsed.dateStr === dateYmd
      })
      return {
        ...dayInfo,
        date: d,
        dateYmd,
        sessions: daySessions
      }
    })
  }, [currentMonday, filteredSessions])

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            Quản Lý Thời Khóa Biểu & Lịch Học
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Lập lịch học tự động theo tuần, kiểm soát xung đột phòng/giảng viên và điều chỉnh từng buổi học
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchSessions()}
            disabled={isLoadingSessions}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới lịch học"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoadingSessions ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>

          <button
            onClick={handleOpenGenerateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập lịch tự động</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng buổi học tuần này</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{stats.total}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Trong khoảng 7 ngày</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã lên lịch</span>
            <span className="text-2xl font-black text-blue-600 leading-tight">{stats.scheduled}</span>
            <span className="text-[10px] text-blue-600 font-medium block mt-1">Sắp diễn ra</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã hoàn thành</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">{stats.completed}</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đã điểm danh/giảng dạy</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã hủy / Tạm hoãn</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">{stats.cancelled}</span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">Cần bố trí dạy bù</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control bar: Section selection, Week navigator, and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Lớp học phần Selector */}
          <div className="flex-1 max-w-xl">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Chọn lớp học phần xem lịch:
            </label>
            <div className="relative">
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                disabled={isLoadingSections || sections.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
              >
                {isLoadingSections ? (
                  <option value="">Đang tải danh sách lớp học phần...</option>
                ) : sections.length === 0 ? (
                  <option value="">Chưa có lớp học phần nào trên hệ thống</option>
                ) : (
                  sections.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.sectionCode} - {s.courseName || s.courseCode} ({s.lecturerName || 'Chưa gán giảng viên'}) - {s.semesterName}
                    </option>
                  ))
                )}
              </select>
            </div>
            {currentSection && (
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                <span>
                  Môn học: <strong className="text-slate-700">{currentSection.courseName}</strong> ({currentSection.courseCode})
                </span>
                <span>•</span>
                <span>
                  Giảng viên: <strong className="text-slate-700">{currentSection.lecturerName || 'Chưa phân công'}</strong>
                </span>
                <span>•</span>
                <span>
                  Học kỳ: <strong className="text-slate-700">{currentSection.semesterName}</strong> ({currentSection.academicYear})
                </span>
              </div>
            )}
          </div>

          {/* Week navigator */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={handlePrevWeek}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleThisWeek}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-xs font-bold text-slate-800">
                {formatDateDisplay(currentMonday)} – {formatDateDisplay(currentSunday)}
              </div>
            </div>
            <button
              onClick={handleNextWeek}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar: Search, Status, View mode */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo phòng, chủ đề buổi học..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Scheduled">Đã lên lịch</option>
                <option value="Completed">Đã hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thời khóa biểu tuần
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Error display if any */}
      {sessionsError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{sessionsError}</span>
        </div>
      )}

      {/* Content View: Calendar Grid or Table View */}
      {isLoadingSessions ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-700">Đang tải lịch học...</p>
          <p className="text-[11px] text-slate-400 mt-1">Đang đồng bộ dữ liệu thời khóa biểu từ máy chủ</p>
        </div>
      ) : filteredSessions.length === 0 && !sessionsError ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Không có buổi học nào trong tuần này</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 mb-5">
            Lớp học phần chưa có lịch học trong khoảng thời gian từ {formatDateDisplay(currentMonday)} đến{' '}
            {formatDateDisplay(currentSunday)}. Bạn có thể lập lịch tự động hoặc chuyển sang tuần khác.
          </p>
          <button
            onClick={handleOpenGenerateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập lịch học tự động</span>
          </button>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Weekly Calendar Columns View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map(dayCol => (
            <div
              key={dayCol.key}
              className={`bg-white rounded-2xl border p-3.5 shadow-xs flex flex-col min-h-[380px] ${
                formatDateYMD(new Date()) === dayCol.dateYmd
                  ? 'border-blue-400 ring-2 ring-blue-500/10'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Day header */}
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{dayCol.labelVi}</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {formatDateDisplay(dayCol.date)}
                  </div>
                </div>
                {formatDateYMD(new Date()) === dayCol.dateYmd && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold">
                    Hôm nay
                  </span>
                )}
              </div>

              {/* Sessions list in this day */}
              <div className="pt-3 space-y-2.5 flex-1">
                {dayCol.sessions.length === 0 ? (
                  <div className="h-full min-h-32 flex flex-col items-center justify-center text-slate-300 text-[11px] font-medium border-2 border-dashed border-slate-100 rounded-xl p-3">
                    <span>Không có lịch</span>
                  </div>
                ) : (
                  dayCol.sessions.map(s => {
                    const parsedStart = parseUtcToVn(s.startAtUtc)
                    const parsedEnd = parseUtcToVn(s.endAtUtc)
                    const badge = getStatusBadge(s.status)

                    return (
                      <div
                        key={s.id}
                        onClick={() => handleOpenEditModal(s)}
                        className={`p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer group ${
                          s.status === 'Cancelled'
                            ? 'bg-rose-50/40 border-rose-200/80 opacity-75'
                            : s.status === 'Completed'
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : 'bg-blue-50/50 border-blue-200/80 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {parsedStart.timeStr} - {parsedEnd.timeStr}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${badge.bg}`}
                          >
                            {badge.text}
                          </span>
                        </div>

                        {s.room && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>Phòng: {s.room}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-1">
                          {s.topic ? s.topic : <span className="text-slate-400 italic">Chưa có chủ đề</span>}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-blue-600 font-semibold group-hover:underline">
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-2.5 h-2.5" /> Chỉnh sửa
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed Table List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ngày học</th>
                  <th className="py-3 px-4">Khung giờ</th>
                  <th className="py-3 px-4">Phòng học</th>
                  <th className="py-3 px-4">Chủ đề bài giảng</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map(s => {
                  const parsedStart = parseUtcToVn(s.startAtUtc)
                  const parsedEnd = parseUtcToVn(s.endAtUtc)
                  const badge = getStatusBadge(s.status)
                  const dayObj = DAYS_OF_WEEK.find(d => d.key === parsedStart.dayOfWeekEn)

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div>{dayObj?.labelVi || parsedStart.dayOfWeekEn}</div>
                        <div className="text-[10px] text-slate-400">{parsedStart.displayStr.split(' - ')[1]}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {parsedStart.timeStr} – {parsedEnd.timeStr}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {s.room ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {s.room}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Chưa chỉ định</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                        {s.topic || <span className="text-slate-400 italic">Chưa cập nhật chủ đề</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Lập lịch học hằng tuần (Generate Sessions) */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Lập Lịch Học Tự Động Hàng Tuần</h3>
                  <p className="text-[11px] text-slate-400">
                    Tạo danh sách các buổi học định kỳ cho lớp học phần trong khoảng thời gian chỉ định
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGenerate} className="pt-4 space-y-4.5">
              {/* Alert lỗi chung */}
              {generateError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">{generateError}</div>
                    {conflictErrors.length > 0 && (
                      <ul className="list-disc list-inside mt-2 space-y-1 text-[11px]">
                        {conflictErrors.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Chọn lớp học phần */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Lớp học phần cần xếp lịch <span className="text-rose-500">*</span>
                </label>
                <select
                  value={generateForm.sectionId}
                  onChange={e => setGenerateForm({ ...generateForm, sectionId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn lớp học phần --</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.sectionCode} - {s.courseName || s.courseCode} ({s.lecturerName || 'Chưa gán GV'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Khoảng ngày học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Từ ngày <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={generateForm.fromDate}
                    onChange={e => setGenerateForm({ ...generateForm, fromDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Đến ngày <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={generateForm.toDate}
                    onChange={e => setGenerateForm({ ...generateForm, toDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Khung giờ hàng tuần */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Khung giờ học trong tuần <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm khung giờ
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {generateForm.weeklySlots.map((slot, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs"
                    >
                      <div className="w-full sm:w-36">
                        <select
                          value={slot.dayOfWeek}
                          onChange={e => {
                            const newSlots = [...generateForm.weeklySlots]
                            newSlots[index].dayOfWeek = e.target.value as DayOfWeekEn
                            setGenerateForm({ ...generateForm, weeklySlots: newSlots })
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold focus:outline-none focus:border-blue-500"
                        >
                          {DAYS_OF_WEEK.map(d => (
                            <option key={d.key} value={d.key}>
                              {d.labelVi}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={e => {
                            const newSlots = [...generateForm.weeklySlots]
                            newSlots[index].startTime = e.target.value
                            setGenerateForm({ ...generateForm, weeklySlots: newSlots })
                          }}
                          required
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400 font-bold">-</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={e => {
                            const newSlots = [...generateForm.weeklySlots]
                            newSlots[index].endTime = e.target.value
                            setGenerateForm({ ...generateForm, weeklySlots: newSlots })
                          }}
                          required
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="w-full sm:w-28">
                        <input
                          type="text"
                          placeholder="Phòng (VD: A101)"
                          value={slot.room || ''}
                          onChange={e => {
                            const newSlots = [...generateForm.weeklySlots]
                            newSlots[index].room = e.target.value
                            setGenerateForm({ ...generateForm, weeklySlots: newSlots })
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {generateForm.weeklySlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(index)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer self-end sm:self-center"
                          title="Xóa khung giờ này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ngày nghỉ / ngày loại trừ */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Các ngày nghỉ / không xếp lịch (Tùy chọn)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={generateForm.excludeDateInput}
                    onChange={e => setGenerateForm({ ...generateForm, excludeDateInput: e.target.value })}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddExcludeDate}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    + Thêm ngày nghỉ
                  </button>
                </div>

                {generateForm.excludeDates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {generateForm.excludeDates.map(d => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() => handleRemoveExcludeDate(d)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  disabled={isGenerating}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xếp lịch...</span>
                    </>
                  ) : (
                    <span>Tạo lịch học hàng tuần</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Chi tiết & Điều chỉnh một buổi học (PATCH) */}
      {isEditModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Điều Chỉnh Buổi Học</h3>
                  <p className="text-[11px] text-slate-400">
                    Cập nhật thời gian, phòng học, chủ đề hoặc trạng thái buổi học
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="pt-4 space-y-4">
              {/* Alert lỗi */}
              {editError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Thông tin lớp học phần */}
              {currentSection && (
                <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-800">
                    {currentSection.sectionCode} - {currentSection.courseName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Giảng viên: <strong className="text-slate-700">{currentSection.lecturerName || 'Chưa phân công'}</strong>
                  </div>
                </div>
              )}

              {/* Ngày học */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ngày diễn ra <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={editForm.dateStr}
                  onChange={e => setEditForm({ ...editForm, dateStr: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Giờ học */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giờ bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giờ kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={e => setEditForm({ ...editForm, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Phòng học */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">Phòng học</label>
                  <label className="text-[11px] text-slate-500 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.clearRoom}
                      onChange={e => setEditForm({ ...editForm, clearRoom: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Để trống phòng học</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: A101, B204"
                  disabled={editForm.clearRoom}
                  value={editForm.clearRoom ? '' : editForm.room}
                  onChange={e => setEditForm({ ...editForm, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* Chủ đề bài học */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">Chủ đề bài giảng</label>
                  <label className="text-[11px] text-slate-500 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.clearTopic}
                      onChange={e => setEditForm({ ...editForm, clearTopic: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Để trống chủ đề</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Ví dụ: Giới thiệu lập trình TypeScript, Kiểm thử phần mềm..."
                  disabled={editForm.clearTopic}
                  value={editForm.clearTopic ? '' : editForm.topic}
                  onChange={e => setEditForm({ ...editForm, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* Trạng thái buổi học */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Trạng thái buổi học</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Scheduled">Đã lên lịch (Scheduled)</option>
                  <option value="Completed">Đã hoàn thành (Completed)</option>
                  <option value="Cancelled">Đã hủy (Cancelled)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleQuickCancelSession}
                  disabled={isSavingEdit || editForm.status === 'Cancelled'}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  Hủy buổi học này
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSavingEdit}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>Lưu thay đổi</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
