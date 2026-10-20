import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  UserCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  MapPin,
  BookOpen,
  Search,
  Save,
  RefreshCw,
  Info,
  Calendar,
  AlertTriangle,
  UserX,
  UserMinus,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import type {
  SessionAttendanceItem,
  SessionAttendanceListResponse,
  UpdateAttendanceRequest,
  AttendanceStatus
} from '../../types'
import { getSessionAttendanceUrl } from '../../config'
import { DEMO_SESSION_ATTENDANCE } from '../../mockData'

interface SessionInfo {
  id?: string
  courseCode?: string
  courseName?: string
  sectionCode?: string
  semesterName?: string
  room?: string | null
  topic?: string | null
  startAtUtc?: string
  endAtUtc?: string
  status?: string
}

interface SessionAttendanceModalProps {
  sessionId: string
  sessionInfo?: SessionInfo
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Chuyển đổi UTC ISO thành giờ Việt Nam (UTC+7)
function parseUtcToVn(utcStr?: string) {
  if (!utcStr) return { displayStr: '', timeStr: '', dateStr: '' }
  const d = new Date(utcStr)
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000)
  const y = vnTime.getUTCFullYear()
  const m = String(vnTime.getUTCMonth() + 1).padStart(2, '0')
  const day = String(vnTime.getUTCDate()).padStart(2, '0')
  const hh = String(vnTime.getUTCHours()).padStart(2, '0')
  const mm = String(vnTime.getUTCMinutes()).padStart(2, '0')
  return {
    dateStr: `${day}/${m}/${y}`,
    timeStr: `${hh}:${mm}`,
    displayStr: `${hh}:${mm} - ${day}/${m}/${y}`
  }
}

export const SessionAttendanceModal: React.FC<SessionAttendanceModalProps> = ({
  sessionId,
  sessionInfo,
  isOpen,
  onClose,
  onSuccess
}) => {
  // Danh sách sinh viên và trạng thái điểm danh
  const [students, setStudents] = useState<SessionAttendanceItem[]>([])
  const [initialAttendanceMap, setInitialAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus | null; note: string | null }>
  >({})

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [isUsingDemo, setIsUsingDemo] = useState<boolean>(false)

  // Bộ lọc & tìm kiếm
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceStatus | 'Unmarked'>('ALL')
  const [showInspector, setShowInspector] = useState(false)

  // Lấy token đăng nhập
  const getAuthToken = () => localStorage.getItem('accessToken')

  // Kiểm tra ca học đã bị hủy chưa
  const isCancelled = sessionInfo?.status === 'Cancelled'

  // 1. Gọi GET /api/class-sessions/{sessionId}/attendance
  const fetchAttendance = useCallback(
    async (forceDemo = false) => {
      setIsLoading(true)
      setErrorMessage(null)

      if (forceDemo) {
        setIsUsingDemo(true)
        const demoList = DEMO_SESSION_ATTENDANCE.map(s => ({
          ...s,
          attendanceStatus: s.attendanceStatus || s.status || null,
          status: s.status || s.attendanceStatus || null
        }))
        setStudents(demoList)
        const initMap: Record<string, { status: AttendanceStatus | null; note: string | null }> = {}
        demoList.forEach(st => {
          initMap[st.enrollmentId] = {
            status: (st.status || st.attendanceStatus) ?? null,
            note: st.note ?? null
          }
        })
        setInitialAttendanceMap(initMap)
        setIsLoading(false)
        return
      }

      const token = getAuthToken()
      if (!token) {
        setErrorMessage(
          'Chưa tìm thấy Access Token của Giảng viên. Đang sử dụng danh sách mẫu demo của lớp.'
        )
        setIsUsingDemo(true)
        setStudents(DEMO_SESSION_ATTENDANCE)
        const initMap: Record<string, { status: AttendanceStatus | null; note: string | null }> = {}
        DEMO_SESSION_ATTENDANCE.forEach(st => {
          initMap[st.enrollmentId] = {
            status: (st.status || st.attendanceStatus) ?? null,
            note: st.note ?? null
          }
        })
        setInitialAttendanceMap(initMap)
        setIsLoading(false)
        return
      }

      try {
        const url = getSessionAttendanceUrl(sessionId)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (response.ok) {
          const json: SessionAttendanceListResponse = await response.json()
          let list: SessionAttendanceItem[] = []
          if (
            json.data &&
            typeof json.data === 'object' &&
            'students' in json.data &&
            Array.isArray(json.data.students)
          ) {
            list = json.data.students
          } else if (Array.isArray(json.data)) {
            list = json.data
          } else if (Array.isArray((json as unknown as { items: SessionAttendanceItem[] }).items)) {
            list = (json as unknown as { items: SessionAttendanceItem[] }).items
          } else if (Array.isArray(json)) {
            list = json as unknown as SessionAttendanceItem[]
          }

          // Chuẩn hóa trạng thái: sinh viên chưa điểm danh có attendanceStatus: null
          const normalized: SessionAttendanceItem[] = list.map(item => ({
            ...item,
            enrollmentStatus: item.enrollmentStatus || 'Registered',
            attendanceStatus:
              item.attendanceStatus !== undefined ? item.attendanceStatus : item.status ?? null,
            status: item.status !== undefined ? item.status : item.attendanceStatus ?? null,
            note: item.note ?? null,
            recordedAtUtc: item.recordedAtUtc ?? null
          }))

          // Danh sách luôn được sắp theo studentCode
          normalized.sort((a, b) => (a.studentCode || '').localeCompare(b.studentCode || ''))

          setStudents(normalized)
          const initMap: Record<string, { status: AttendanceStatus | null; note: string | null }> = {}
          normalized.forEach(st => {
            initMap[st.enrollmentId] = {
              status: (st.status || st.attendanceStatus) ?? null,
              note: st.note ?? null
            }
          })
          setInitialAttendanceMap(initMap)
          setIsUsingDemo(false)
        } else if (response.status === 403) {
          setErrorMessage(
            'Quyền truy cập bị từ chối (403): API chỉ cho phép giảng viên phụ trách slot thao tác.'
          )
          setIsUsingDemo(true)
          setStudents(DEMO_SESSION_ATTENDANCE)
        } else if (response.status === 401) {
          setErrorMessage('Phiên đăng nhập hết hạn hoặc không hợp lệ (401). Đang dùng dữ liệu demo.')
          setIsUsingDemo(true)
          setStudents(DEMO_SESSION_ATTENDANCE)
        } else {
          const errData = await response.json().catch(() => null)
          setErrorMessage(
            errData?.message ||
              `Không thể tải danh sách điểm danh từ máy chủ (HTTP ${response.status}). Đang dùng dữ liệu demo.`
          )
          setIsUsingDemo(true)
          setStudents(DEMO_SESSION_ATTENDANCE)
        }
      } catch {
        setErrorMessage(
          'Không thể kết nối máy chủ backend. Chuyển sang chế độ xem và điểm danh mẫu demo.'
        )
        setIsUsingDemo(true)
        setStudents(DEMO_SESSION_ATTENDANCE)
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId]
  )

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchAttendance()
    }
  }, [isOpen, sessionId, fetchAttendance])

  // Cập nhật trạng thái điểm danh cho 1 sinh viên
  const handleSetStudentStatus = (enrollmentId: string, status: AttendanceStatus | null) => {
    if (isCancelled) return
    setStudents(prev =>
      prev.map(s => {
        if (s.enrollmentId === enrollmentId) {
          return { ...s, status, attendanceStatus: status }
        }
        return s
      })
    )
  }

  // Cập nhật ghi chú cho 1 sinh viên
  const handleSetStudentNote = (enrollmentId: string, note: string) => {
    if (isCancelled) return
    setStudents(prev =>
      prev.map(s => {
        if (s.enrollmentId === enrollmentId) {
          return { ...s, note }
        }
        return s
      })
    )
  }

  // Thao tác nhanh: Đánh dấu tất cả có mặt (Present)
  const handleMarkAllPresent = () => {
    if (isCancelled) return
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        status: 'Present',
        attendanceStatus: 'Present'
      }))
    )
  }

  // Thao tác nhanh: Xóa toàn bộ điểm danh (Đặt lại null)
  const handleResetAll = () => {
    if (isCancelled) return
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        status: null,
        attendanceStatus: null,
        note: null
      }))
    )
  }

  // Lọc danh sách sinh viên
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      // 1. Tìm kiếm tên, mã SV, email
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = st.fullName?.toLowerCase().includes(q)
        const matchCode = st.studentCode?.toLowerCase().includes(q)
        const matchEmail = st.email?.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchEmail) return false
      }

      // 2. Lọc theo trạng thái
      const currentSt = st.status || st.attendanceStatus || null
      if (statusFilter === 'Unmarked') {
        if (currentSt !== null) return false
      } else if (statusFilter !== 'ALL') {
        if (currentSt !== statusFilter) return false
      }

      return true
    })
  }, [students, searchQuery, statusFilter])

  // Thống kê số lượng theo trạng thái
  const stats = useMemo(() => {
    const total = students.length
    let present = 0
    let absent = 0
    let late = 0
    let excused = 0
    let unmarked = 0

    students.forEach(st => {
      const s = st.status || st.attendanceStatus || null
      if (s === 'Present') present++
      else if (s === 'Absent') absent++
      else if (s === 'Late') late++
      else if (s === 'Excused') excused++
      else unmarked++
    })

    const attended = present + late
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0

    return { total, present, absent, late, excused, unmarked, attendanceRate }
  }, [students])

  // Chuẩn bị payload PUT
  const payloadToSubmit: UpdateAttendanceRequest = useMemo(() => {
    // Có thể gửi một phần danh sách hoặc toàn bộ sinh viên đã được chọn trạng thái
    const items = students
      .filter(s => (s.status || s.attendanceStatus) !== null)
      .map(s => ({
        enrollmentId: s.enrollmentId,
        status: (s.status || s.attendanceStatus) as AttendanceStatus,
        note: s.note ? s.note.trim() : null
      }))
    return { items }
  }, [students])

  // Kiểm tra có thay đổi so với dữ liệu ban đầu không
  const hasChanges = useMemo(() => {
    for (const s of students) {
      const curStatus = s.status || s.attendanceStatus || null
      const curNote = s.note ? s.note.trim() : null
      const init = initialAttendanceMap[s.enrollmentId]
      if (!init) return true
      if (curStatus !== init.status) return true
      if (curNote !== (init.note ? init.note.trim() : null)) return true
    }
    return false
  }, [students, initialAttendanceMap])

  // 2. Gửi PUT /api/class-sessions/{sessionId}/attendance
  const handleSaveAttendance = async () => {
    if (isCancelled) {
      alert('Không thể lưu điểm danh vì ca học này đã bị hủy!')
      return
    }

    if (payloadToSubmit.items.length === 0) {
      alert('Vui lòng chọn trạng thái điểm danh cho ít nhất 1 sinh viên!')
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    const token = getAuthToken()
    if (!token || isUsingDemo) {
      // Demo mode fallback
      setTimeout(() => {
        setIsSaving(false)
        setSuccessToast(
          `Đã lưu điểm danh cho ${payloadToSubmit.items.length} sinh viên thành công (Chế độ mô phỏng)!`
        )
        const newInit: Record<string, { status: AttendanceStatus | null; note: string | null }> = {}
        students.forEach(st => {
          newInit[st.enrollmentId] = {
            status: (st.status || st.attendanceStatus) ?? null,
            note: st.note ?? null
          }
        })
        setInitialAttendanceMap(newInit)
        if (onSuccess) onSuccess()
        setTimeout(() => setSuccessToast(null), 3000)
      }, 600)
      return
    }

    try {
      const url = getSessionAttendanceUrl(sessionId)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payloadToSubmit)
      })

      if (response.ok) {
        setSuccessToast(`Đã lưu điểm danh cho ${payloadToSubmit.items.length} sinh viên thành công!`)
        const newInit: Record<string, { status: AttendanceStatus | null; note: string | null }> = {}
        students.forEach(st => {
          newInit[st.enrollmentId] = {
            status: (st.status || st.attendanceStatus) ?? null,
            note: st.note ?? null
          }
        })
        setInitialAttendanceMap(newInit)
        if (onSuccess) onSuccess()
        setTimeout(() => setSuccessToast(null), 3500)
      } else if (response.status === 403) {
        setErrorMessage(
          'Từ chối quyền thao tác (403): API chỉ cho phép giảng viên phụ trách slot này thao tác.'
        )
      } else if (response.status === 400) {
        const errData = await response.json().catch(() => null)
        setErrorMessage(
          errData?.message ||
            'Dữ liệu điểm danh không hợp lệ (Hệ thống từ chối sinh viên thuộc lớp khác hoặc slot đã hủy).'
        )
      } else {
        const errData = await response.json().catch(() => null)
        setErrorMessage(errData?.message || `Lỗi khi lưu điểm danh (Mã lỗi: ${response.status}).`)
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ để lưu điểm danh.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  const startVn = parseUtcToVn(sessionInfo?.startAtUtc)
  const endVn = parseUtcToVn(sessionInfo?.endAtUtc)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 1. Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                  Điểm Danh Ca Học
                </h3>
                {sessionInfo?.status && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      sessionInfo.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : sessionInfo.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {sessionInfo.status === 'Cancelled'
                      ? 'Đã hủy'
                      : sessionInfo.status === 'Completed'
                      ? 'Đã hoàn thành'
                      : 'Đã lên lịch'}
                  </span>
                )}
                {isUsingDemo && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Dữ liệu mẫu demo
                  </span>
                )}
              </div>

              {/* Course & Section Info */}
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-600">
                <span className="font-bold text-slate-800">
                  {sessionInfo?.courseName || 'Học phần'}
                </span>
                {sessionInfo?.courseCode && (
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold text-[11px]">
                    {sessionInfo.courseCode}
                  </span>
                )}
                {sessionInfo?.sectionCode && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[11px]">
                    Lớp: {sessionInfo.sectionCode}
                  </span>
                )}
              </div>

              {/* Date, Time, Room, Topic Subtitle */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-slate-500">
                {startVn.dateStr && (
                  <span className="flex items-center gap-1 font-mono text-slate-700 font-semibold">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    {startVn.dateStr}
                  </span>
                )}
                {startVn.timeStr && endVn.timeStr && (
                  <span className="flex items-center gap-1 font-mono text-slate-700 font-semibold">
                    <Clock className="w-3 h-3 text-blue-600" />
                    {startVn.timeStr} - {endVn.timeStr}
                  </span>
                )}
                {sessionInfo?.room && (
                  <span className="flex items-center gap-1 text-slate-600 font-semibold">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Phòng {sessionInfo.room}
                  </span>
                )}
                {sessionInfo?.topic && (
                  <span className="flex items-center gap-1 text-slate-600 truncate max-w-xs italic">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    {sessionInfo.topic}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowInspector(!showInspector)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Xem thông tin API & Payload JSON"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cancelled Warning Notice */}
        {isCancelled && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-3 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Ca học này đã bị hủy (Cancelled).</strong> Theo quy định học vụ, API không cho
              phép thực hiện điểm danh cho ca học đã hủy.
            </span>
          </div>
        )}

        {/* Error / Success Toast Banner */}
        {errorMessage && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 text-xs text-amber-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchAttendance(false)}
              className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[11px] hover:bg-amber-300"
            >
              Thử lại
            </button>
          </div>
        )}

        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* API Inspector Drawer */}
        {showInspector && (
          <div className="bg-slate-900 text-slate-100 p-4 border-b border-slate-800 text-xs font-mono space-y-2 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold uppercase text-[10px]">
                API Endpoints Specification:
              </span>
              <button
                onClick={() => setShowInspector(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[11px] text-slate-300">
              GET /api/class-sessions/{sessionId}/attendance
              <br />
              PUT /api/class-sessions/{sessionId}/attendance
            </div>
            <div className="text-[10px] text-slate-400">
              Payload PUT chuẩn bị gửi ({payloadToSubmit.items.length} mục):
            </div>
            <pre className="text-[10.5px] text-emerald-400 overflow-x-auto bg-slate-950 p-2 rounded">
              {JSON.stringify(payloadToSubmit, null, 2)}
            </pre>
          </div>
        )}

        {/* 2. Stats & Quick Actions Toolbar */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Counters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-700 mr-1">
                Sĩ số: {stats.total}
              </span>

              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Có mặt: {stats.present}
              </span>

              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Muộn: {stats.late}
              </span>

              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Có phép: {stats.excused}
              </span>

              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Vắng: {stats.absent}
              </span>

              {stats.unmarked > 0 && (
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  Chưa điểm danh: {stats.unmarked}
                </span>
              )}

              <span className="px-2 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                Tỉ lệ: {stats.attendanceRate}%
              </span>
            </div>

            {/* Quick Bulk Buttons */}
            {!isCancelled && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllPresent}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
                  title="Đặt tất cả sinh viên thành Có mặt"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tất cả có mặt</span>
                </button>

                <button
                  onClick={handleResetAll}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  title="Xóa lựa chọn điểm danh để chọn lại"
                >
                  <span>Đặt lại</span>
                </button>
              </div>
            )}
          </div>

          {/* Search & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm sinh viên theo tên, mã SV, email..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
              {(
                [
                  { key: 'ALL', label: `Tất cả (${stats.total})` },
                  { key: 'Present', label: `Có mặt (${stats.present})` },
                  { key: 'Absent', label: `Vắng (${stats.absent})` },
                  { key: 'Late', label: `Muộn (${stats.late})` },
                  { key: 'Excused', label: `Có phép (${stats.excused})` },
                  { key: 'Unmarked', label: `Chưa điểm danh (${stats.unmarked})` }
                ] as const
              ).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Student List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/40">
          {isLoading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Đang tải danh sách sinh viên...</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                GET /api/class-sessions/{sessionId}/attendance
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <UserX className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Không tìm thấy sinh viên nào</p>
              <p className="text-[11px] mt-0.5">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
            </div>
          ) : (
            filteredStudents.map((st, index) => {
              const currentStatus = st.status || st.attendanceStatus || null

              return (
                <div
                  key={st.enrollmentId}
                  className={`p-3.5 rounded-xl bg-white border transition-all ${
                    currentStatus === 'Present'
                      ? 'border-emerald-200/90 shadow-2xs'
                      : currentStatus === 'Absent'
                      ? 'border-rose-200/90 shadow-2xs'
                      : currentStatus === 'Late'
                      ? 'border-amber-200/90 shadow-2xs'
                      : currentStatus === 'Excused'
                      ? 'border-purple-200/90 shadow-2xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Student Info */}
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-xs shrink-0">
                        {st.fullName ? st.fullName.split(' ').slice(-1)[0][0] : index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-800 text-xs truncate">
                            {st.fullName}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {st.studentCode}
                          </span>
                          {st.enrollmentStatus && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                              {st.enrollmentStatus === 'Registered' ? 'Đã đăng ký' : st.enrollmentStatus}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                          {st.email && <span className="truncate">{st.email}</span>}
                          {st.recordedAtUtc && (
                            <span className="text-slate-500 font-mono text-[10.5px]">
                              • Ghi nhận: {parseUtcToVn(st.recordedAtUtc).displayStr}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Action Buttons (Present, Late, Excused, Absent) */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Present (Có mặt) */}
                      <button
                        onClick={() => handleSetStudentStatus(st.enrollmentId, 'Present')}
                        disabled={isCancelled}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                        } ${isCancelled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Có mặt</span>
                      </button>

                      {/* Late (Đi muộn) */}
                      <button
                        onClick={() => handleSetStudentStatus(st.enrollmentId, 'Late')}
                        disabled={isCancelled}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          currentStatus === 'Late'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
                        } ${isCancelled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Đi muộn</span>
                      </button>

                      {/* Excused (Có phép) */}
                      <button
                        onClick={() => handleSetStudentStatus(st.enrollmentId, 'Excused')}
                        disabled={isCancelled}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          currentStatus === 'Excused'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
                        } ${isCancelled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Có phép</span>
                      </button>

                      {/* Absent (Vắng) */}
                      <button
                        onClick={() => handleSetStudentStatus(st.enrollmentId, 'Absent')}
                        disabled={isCancelled}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          currentStatus === 'Absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                        } ${isCancelled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Vắng mặt</span>
                      </button>

                      {/* Clear button if marked */}
                      {currentStatus !== null && !isCancelled && (
                        <button
                          onClick={() => handleSetStudentStatus(st.enrollmentId, null)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-1"
                          title="Bỏ đánh dấu (Chưa điểm danh)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note Input Field */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                      Ghi chú:
                    </span>
                    <input
                      type="text"
                      disabled={isCancelled}
                      value={st.note || ''}
                      onChange={e => handleSetStudentNote(st.enrollmentId, e.target.value)}
                      placeholder={
                        currentStatus === 'Absent'
                          ? 'Ví dụ: Báo nghỉ, Ốm, Bận việc gia đình...'
                          : currentStatus === 'Late'
                          ? 'Ví dụ: Đến muộn 15 phút, Hỏng xe...'
                          : 'Ghi chú cho sinh viên này (không bắt buộc)...'
                      }
                      className="flex-1 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    />

                    {/* Quick Note Suggestions for Absent or Late */}
                    {!isCancelled && (
                      <div className="hidden sm:flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetStudentNote(st.enrollmentId, 'Báo nghỉ')}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          Báo nghỉ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStudentNote(st.enrollmentId, 'Trễ 15p')}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          Trễ 15p
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 4. Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              Đã chọn điểm danh:{' '}
              <strong className="text-blue-600 font-bold">
                {payloadToSubmit.items.length}/{students.length}
              </strong>{' '}
              sinh viên
            </span>
            {hasChanges && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                Có thay đổi chưa lưu
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={handleSaveAttendance}
              disabled={isSaving || isCancelled || payloadToSubmit.items.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Điểm Danh ({payloadToSubmit.items.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
