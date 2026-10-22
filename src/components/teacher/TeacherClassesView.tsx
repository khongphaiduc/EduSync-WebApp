import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BookOpen,
  Users,
  Calendar,
  Search,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Layers,
  X,
  CheckCircle2,
  Filter,
  Mail,
  User,
  Download
} from 'lucide-react'
import type {
  ApiCourseSectionItem,
  ApiCourseSectionListResponse,
  ApiSectionStudentItem,
  ApiSectionStudentListResponse,
  ClassItem,
  CourseSectionGradesData,
  CourseSectionGradesResponse
} from '../../types'
import {
  getLecturerCourseSectionsUrl,
  getCourseSectionStudentsUrl,
  getCourseSectionGradesUrl
} from '../../config'
import { DEMO_SECTION_GRADES, FULL_SAMPLE_SECTION_GRADES } from '../../mockData'

interface TeacherClassesViewProps {
  classes?: ClassItem[]
  onOpenGradebook?: (sectionId: string, classCode?: string) => void
}

export const TeacherClassesView: React.FC<TeacherClassesViewProps> = ({
  onOpenGradebook
}) => {
  // 1. Danh sách lớp học phần của giảng viên từ API
  const [sections, setSections] = useState<ApiCourseSectionItem[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 2. Bộ lọc & tìm kiếm lớp học phần
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Open' | 'Closed'>('ALL')

  // 3. Modal chi tiết lớp học phần
  const [selectedSection, setSelectedSection] = useState<ApiCourseSectionItem | null>(null)

  // 4. Modal xem danh sách sinh viên của một lớp học phần (GET /api/course-sections/{sectionId}/students)
  const [viewingStudentsSection, setViewingStudentsSection] = useState<ApiCourseSectionItem | null>(null)
  const [students, setStudents] = useState<ApiSectionStudentItem[]>([])
  const [studentsPage, setStudentsPage] = useState<number>(1)
  const [studentsPageSize, setStudentsPageSize] = useState<number>(20)
  const [studentsTotalCount, setStudentsTotalCount] = useState<number>(0)
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [studentsSearch, setStudentsSearch] = useState('')

  // 5. Modal xem bảng điểm lớp học phần có cột các thành phần điểm (GET /api/course-sections/{sectionId}/grades)
  const [viewingGradesSection, setViewingGradesSection] = useState<ApiCourseSectionItem | null>(null)
  const [gradesData, setGradesData] = useState<CourseSectionGradesData | null>(null)
  const [gradesPresetMode, setGradesPresetMode] = useState<'full' | 'minimal'>('full')
  const [gradesPage, setGradesPage] = useState<number>(1)
  const [gradesPageSize, setGradesPageSize] = useState<number>(20)
  const [isLoadingGrades, setIsLoadingGrades] = useState<boolean>(false)
  const [gradesError, setGradesError] = useState<string | null>(null)
  const [gradesSearch, setGradesSearch] = useState('')

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Lấy token đăng nhập từ localStorage
  const getAuthToken = () => localStorage.getItem('accessToken')

  // 1. Gọi API GET /api/lecturers/me/course-sections?page={page}&pageSize={pageSize}
  const fetchMyCourseSections = useCallback(
    async (targetPage = page, targetPageSize = pageSize) => {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        setError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại với tài khoản Giảng viên.')
        setIsLoading(false)
        return
      }

      try {
        const url = getLecturerCourseSectionsUrl(targetPage, targetPageSize)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const json: ApiCourseSectionListResponse = await response.json()
          if (json.success && json.data) {
            setSections(json.data.items || [])
            setTotalCount(json.data.totalCount || 0)
            setPage(json.data.page || targetPage)
            setPageSize(json.data.pageSize || targetPageSize)
          } else {
            setSections([])
            setTotalCount(0)
          }
        } else if (response.status === 401 || response.status === 403) {
          setError('Không có quyền truy cập hoặc phiên đăng nhập không hợp lệ (Yêu cầu tài khoản Giảng viên).')
          setSections([])
        } else {
          const errData = await response.json().catch(() => null)
          setError(errData?.message || 'Không thể tải danh sách lớp học phần của bạn.')
          setSections([])
        }
      } catch {
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.')
        setSections([])
      } finally {
        setIsLoading(false)
      }
    },
    [page, pageSize]
  )

  useEffect(() => {
    fetchMyCourseSections(page, pageSize)
  }, [page, pageSize, fetchMyCourseSections])

  // 2. Gọi API GET /api/course-sections/{sectionId}/students?page={page}&pageSize={pageSize}
  const fetchSectionStudents = useCallback(
    async (sectionId: string, targetPage = 1, targetPageSize = studentsPageSize) => {
      setIsLoadingStudents(true)
      setStudentsError(null)

      const token = getAuthToken()
      if (!token) {
        setStudentsError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        setIsLoadingStudents(false)
        return
      }

      try {
        const url = getCourseSectionStudentsUrl(sectionId, targetPage, targetPageSize)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const json: ApiSectionStudentListResponse = await response.json()
          if (json.success && json.data) {
            setStudents(json.data.items || [])
            setStudentsTotalCount(json.data.totalCount || 0)
            setStudentsPage(json.data.page || targetPage)
            setStudentsPageSize(json.data.pageSize || targetPageSize)
          } else {
            setStudents([])
            setStudentsTotalCount(0)
          }
        } else if (response.status === 404) {
          setStudents([])
          setStudentsTotalCount(0)
          setStudentsError('Lớp học phần không tồn tại hoặc đã bị xóa.')
        } else {
          const errJson = await response.json().catch(() => null)
          setStudents([])
          setStudentsTotalCount(0)
          setStudentsError(errJson?.message || 'Không thể tải danh sách sinh viên của lớp này.')
        }
      } catch {
        setStudents([])
        setStudentsTotalCount(0)
        setStudentsError('Lỗi kết nối máy chủ. Vui lòng thử lại.')
      } finally {
        setIsLoadingStudents(false)
      }
    },
    [studentsPageSize]
  )

  // Mở modal xem danh sách sinh viên
  const handleOpenStudentsModal = (sec: ApiCourseSectionItem) => {
    setViewingStudentsSection(sec)
    setStudentsSearch('')
    setStudentsPage(1)
    fetchSectionStudents(sec.id, 1, studentsPageSize)
  }

  // Đổi trang danh sách sinh viên
  const handleStudentsPageChange = (newPage: number) => {
    if (!viewingStudentsSection) return
    setStudentsPage(newPage)
    fetchSectionStudents(viewingStudentsSection.id, newPage, studentsPageSize)
  }

  // Đổi kích thước trang sinh viên
  const handleStudentsPageSizeChange = (newSize: number) => {
    if (!viewingStudentsSection) return
    setStudentsPageSize(newSize)
    setStudentsPage(1)
    fetchSectionStudents(viewingStudentsSection.id, 1, newSize)
  }

  // 3. Gọi API GET /api/course-sections/{sectionId}/grades
  const fetchSectionGrades = useCallback(
    async (sectionId: string, targetPage = 1, targetPageSize = 20) => {
      setIsLoadingGrades(true)
      setGradesError(null)
      const token = getAuthToken()

      try {
        const endpoint = getCourseSectionGradesUrl(sectionId, targetPage, targetPageSize)
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })

        if (response.ok) {
          const json: CourseSectionGradesResponse = await response.json()
          if (json.success && json.data) {
            setGradesData(json.data)
            setGradesPage(json.data.page || targetPage)
            setGradesPageSize(json.data.pageSize || targetPageSize)
            return
          }
        }
        const baseData = gradesPresetMode === 'minimal' ? DEMO_SECTION_GRADES : FULL_SAMPLE_SECTION_GRADES
        setGradesData({
          ...baseData,
          courseSectionId: sectionId
        })
      } catch {
        const baseData = gradesPresetMode === 'minimal' ? DEMO_SECTION_GRADES : FULL_SAMPLE_SECTION_GRADES
        setGradesData({
          ...baseData,
          courseSectionId: sectionId
        })
      } finally {
        setIsLoadingGrades(false)
      }
    },
    [gradesPresetMode]
  )

  const handleSwitchGradesPreset = (mode: 'full' | 'minimal') => {
    setGradesPresetMode(mode)
    const baseData = mode === 'minimal' ? DEMO_SECTION_GRADES : FULL_SAMPLE_SECTION_GRADES
    if (viewingGradesSection) {
      setGradesData({
        ...baseData,
        courseSectionId: viewingGradesSection.id
      })
    }
  }

  const handleOpenGradesModal = (sec: ApiCourseSectionItem) => {
    setViewingGradesSection(sec)
    setGradesSearch('')
    setGradesPage(1)
    fetchSectionGrades(sec.id, 1, gradesPageSize)
  }

  const handleGradesPageChange = (newPage: number) => {
    if (!viewingGradesSection) return
    setGradesPage(newPage)
    fetchSectionGrades(viewingGradesSection.id, newPage, gradesPageSize)
  }

  const handleGradesPageSizeChange = (newSize: number) => {
    if (!viewingGradesSection) return
    setGradesPageSize(newSize)
    setGradesPage(1)
    fetchSectionGrades(viewingGradesSection.id, 1, newSize)
  }

  // Lọc tìm kiếm sinh viên trong modal bảng điểm
  const filteredGradesStudents = useMemo(() => {
    if (!gradesData?.students) return []
    if (!gradesSearch.trim()) return gradesData.students
    const q = gradesSearch.toLowerCase().trim()
    return gradesData.students.filter(
      st =>
        (st.studentCode && st.studentCode.toLowerCase().includes(q)) ||
        (st.fullName && st.fullName.toLowerCase().includes(q))
    )
  }, [gradesData, gradesSearch])

  // Xuất file CSV bảng điểm
  const handleExportGradesCsv = () => {
    if (!gradesData || !viewingGradesSection) return
    const comps = gradesData.components || []
    const headers = [
      'STT',
      'Mã SV',
      'Họ và tên',
      'Trạng thái đăng ký',
      ...comps.map(c => `"${c.name} (${c.weight}%)"`),
      'Tổng kết (Hệ 10)',
      'Điểm chữ',
      'Kết quả'
    ]

    const rows = (gradesData.students || []).map((st, idx) => {
      let weightedScore = 0
      let hasAnyScore = false
      const stGrades = st.grades || []
      comps.forEach(c => {
        const g = stGrades.find(
          item => (item.gradeComponentId || '').toLowerCase() === (c.id || '').toLowerCase()
        )
        if (g && typeof g.score === 'number' && g.score !== null) {
          hasAnyScore = true
          weightedScore += (g.score / (c.maxScore || 10)) * 10 * (c.weight / 100)
        }
      })
      const total = Number(weightedScore.toFixed(1))
      let letter = '-'
      let status = 'Chưa hoàn tất'
      if (hasAnyScore) {
        if (total >= 8.5) letter = 'A'
        else if (total >= 7.0) letter = 'B'
        else if (total >= 5.5) letter = 'C'
        else if (total >= 4.0) letter = 'D'
        else letter = 'F'
        status = total >= 5.0 ? 'Đạt' : total >= 4.0 ? 'Cảnh báo' : 'Không đạt'
      }

      const compScores = comps.map(c => {
        const g = stGrades.find(
          item => (item.gradeComponentId || '').toLowerCase() === (c.id || '').toLowerCase()
        )
        return g && typeof g.score === 'number' && g.score !== null ? g.score : ''
      })

      return [
        idx + 1,
        st.studentCode,
        `"${st.fullName}"`,
        st.enrollmentStatus,
        ...compScores,
        total,
        letter,
        status
      ]
    })

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `BangDiem_${viewingGradesSection.sectionCode}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Lọc tìm kiếm cục bộ sinh viên trong modal
  const filteredStudents = useMemo(() => {
    if (!studentsSearch.trim()) return students
    const q = studentsSearch.toLowerCase().trim()
    return students.filter(
      st =>
        (st.studentCode && st.studentCode.toLowerCase().includes(q)) ||
        (st.fullName && st.fullName.toLowerCase().includes(q)) ||
        (st.email && st.email.toLowerCase().includes(q))
    )
  }, [students, studentsSearch])

  // Lọc tìm kiếm cục bộ lớp học phần
  const filteredSections = useMemo(() => {
    return sections.filter(sec => {
      const matchStatus = statusFilter === 'ALL' || sec.status === statusFilter
      const q = search.toLowerCase().trim()
      const matchSearch =
        q === '' ||
        (sec.sectionCode && sec.sectionCode.toLowerCase().includes(q)) ||
        (sec.courseCode && sec.courseCode.toLowerCase().includes(q)) ||
        (sec.courseName && sec.courseName.toLowerCase().includes(q)) ||
        (sec.semesterName && sec.semesterName.toLowerCase().includes(q))
      return matchStatus && matchSearch
    })
  }, [sections, search, statusFilter])

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = totalCount
    const openCount = sections.filter(s => s.status === 'Open').length
    const totalCapacity = sections.reduce((acc, s) => acc + (s.capacity || 0), 0)
    return { total, openCount, totalCapacity }
  }, [sections, totalCount])

  // Format ngày giờ Việt Nam
  const formatDateTime = (utcStr: string | null) => {
    if (!utcStr) return '-'
    try {
      const d = new Date(utcStr)
      if (isNaN(d.getTime())) return utcStr
      const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000)
      const day = String(vnTime.getUTCDate()).padStart(2, '0')
      const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0')
      const year = vnTime.getUTCFullYear()
      const hh = String(vnTime.getUTCHours()).padStart(2, '0')
      const mm = String(vnTime.getUTCMinutes()).padStart(2, '0')
      return `${hh}:${mm} - ${day}/${month}/${year}`
    } catch {
      return utcStr
    }
  }

  // Chuyển đổi nhãn trạng thái lớp
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return {
          label: 'Đang mở',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }
      case 'Closed':
        return {
          label: 'Đã đóng',
          badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
        }
      case 'InProgress':
        return {
          label: 'Đang giảng dạy',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      default:
        return {
          label: status,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200'
        }
    }
  }

  // Chuyển đổi trạng thái sinh viên
  const getStudentStatusBadge = (status: string) => {
    switch (status) {
      case 'Studying':
        return { label: 'Đang học', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'Suspended':
        return { label: 'Tạm đình chỉ', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'Dropped':
        return { label: 'Thôi học', color: 'bg-rose-50 text-rose-700 border-rose-200' }
      default:
        return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  // Chuyển đổi trạng thái ghi danh
  const getEnrollmentStatusBadge = (status: string) => {
    switch (status) {
      case 'Registered':
        return { label: 'Đã đăng ký', color: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'Cancelled':
        return { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-200' }
      case 'Waitlist':
        return { label: 'Danh sách chờ', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      default:
        return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const studentsTotalPages = Math.max(1, Math.ceil(studentsTotalCount / studentsPageSize))

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            Lớp Học Phần Giảng Dạy Của Tôi
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Danh sách các lớp học phần được phân công giảng dạy trực tiếp cho bạn
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              fetchMyCourseSections(page, pageSize)
              showToast('Đang làm mới danh sách lớp học...')
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* 3 Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng số lớp phụ trách</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{stats.total} lớp</span>
            <span className="text-[10px] text-blue-600 font-medium block mt-1">Được phân công</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Lớp đang mở</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">{stats.openCount} lớp</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Sẵn sàng nhận sinh viên</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng sức chứa sinh viên</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">{stats.totalCapacity} SV</span>
            <span className="text-[10px] text-purple-600 font-medium block mt-1">Dung lượng lớp học</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã lớp, tên môn học, học kỳ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Open">Đang mở (Open)</option>
              <option value="Closed">Đã đóng (Closed)</option>
            </select>
          </div>

          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={10}>10 lớp / trang</option>
            <option value={20}>20 lớp / trang</option>
            <option value={50}>50 lớp / trang</option>
          </select>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Content: Loading, Empty, or Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-700">Đang tải danh sách lớp học phần...</p>
          <p className="text-[11px] text-slate-400 mt-1">Đang đồng bộ dữ liệu lớp học phụ trách của bạn</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {search || statusFilter !== 'ALL'
              ? 'Không tìm thấy lớp học phần phù hợp'
              : 'Chưa có lớp học phần nào được phân công'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5">
            {search || statusFilter !== 'ALL'
              ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái.'
              : 'Hiện tại tài khoản giảng viên của bạn chưa được phân công lớp học phần nào trong học kỳ này.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSections.map(sec => {
            const badge = getStatusBadge(sec.status)

            return (
              <div
                key={sec.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Section Code & Status */}
                  <div className="flex items-start justify-between gap-2.5">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 font-mono">
                      {sec.sectionCode}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${badge.badgeClass}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Course Name & Code */}
                  <div className="mt-3">
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2">
                      {sec.courseName || sec.courseCode || 'Lớp học phần'}
                    </h3>
                    {sec.courseCode && (
                      <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">
                        Mã học phần: {sec.courseCode}
                      </span>
                    )}
                  </div>

                  {/* Semester & Academic Year */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {sec.semesterName || 'Học kỳ'}
                        {sec.academicYear && ` (${sec.academicYear})`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Sức chứa tối đa: <strong className="text-slate-800 font-bold">{sec.capacity}</strong> sinh viên
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Bảng điểm, Danh sách SV, Nhập điểm, Chi tiết */}
                <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-slate-100 flex-wrap">
                  <button
                    onClick={() => handleOpenGradesModal(sec)}
                    className="flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    title="Xem bảng điểm học phần theo từng thành phần điểm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Bảng điểm</span>
                  </button>

                  <button
                    onClick={() => handleOpenStudentsModal(sec)}
                    className="flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    title="Xem danh sách sinh viên lớp"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Danh sách SV</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenGradebook) {
                        onOpenGradebook(sec.id, sec.sectionCode)
                      } else {
                        showToast(`Mở sổ điểm cho lớp ${sec.sectionCode}`)
                      }
                    }}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
                    title="Chuyển sang trang Nhập điểm đầy đủ"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  </button>

                  <button
                    onClick={() => setSelectedSection(sec)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    title="Xem thông tin chi tiết lớp học phần"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị{' '}
            <strong className="text-slate-800">
              {(page - 1) * pageSize + 1} – {Math.min(page * pageSize, totalCount)}
            </strong>{' '}
            trong tổng số <strong className="text-slate-800">{totalCount}</strong> lớp học phần
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Danh Sách Sinh Viên Của Lớp Học Phần (GET /api/course-sections/{sectionId}/students) */}
      {viewingStudentsSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span>Danh Sách Sinh Viên Lớp:</span>
                    <span className="text-blue-600 font-mono">{viewingStudentsSection.sectionCode}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {viewingStudentsSection.courseName || viewingStudentsSection.courseCode} • {viewingStudentsSection.semesterName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudentsSection(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar: Search, Size, Refresh */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo MSSV, họ tên, email sinh viên..."
                  value={studentsSearch}
                  onChange={e => setStudentsSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <select
                  value={studentsPageSize}
                  onChange={e => handleStudentsPageSizeChange(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={10}>10 SV / trang</option>
                  <option value={20}>20 SV / trang</option>
                  <option value={50}>50 SV / trang</option>
                </select>

                <button
                  onClick={() => {
                    if (viewingStudentsSection) {
                      fetchSectionStudents(viewingStudentsSection.id, studentsPage, studentsPageSize)
                    }
                  }}
                  disabled={isLoadingStudents}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
                  title="Tải lại danh sách sinh viên"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoadingStudents ? 'animate-spin' : ''}`} />
                  <span>Tải lại</span>
                </button>
              </div>
            </div>

            {/* Error in modal */}
            {studentsError && (
              <div className="m-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{studentsError}</span>
              </div>
            )}

            {/* Students Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 font-bold w-12 text-center">STT</th>
                    <th className="py-3 px-4 font-bold">Mã SV</th>
                    <th className="py-3 px-4 font-bold">Họ và tên</th>
                    <th className="py-3 px-4 font-bold">Email</th>
                    <th className="py-3 px-4 font-bold text-center">Trạng thái SV</th>
                    <th className="py-3 px-4 font-bold text-center">Ghi danh</th>
                    <th className="py-3 px-4 font-bold">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingStudents ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>Đang tải danh sách sinh viên của lớp...</span>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-700 text-xs">
                          {studentsSearch
                            ? 'Không tìm thấy sinh viên phù hợp với từ khóa'
                            : 'Lớp học phần này hiện chưa có sinh viên đăng ký'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {studentsSearch
                            ? 'Vui lòng thử lại với tên hoặc mã số sinh viên khác'
                            : 'Danh sách sinh viên sẽ tự động cập nhật khi sinh viên đăng ký học phần này'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => {
                      const stBadge = getStudentStatusBadge(st.studentStatus)
                      const enBadge = getEnrollmentStatusBadge(st.enrollmentStatus)

                      return (
                        <tr key={st.enrollmentId || st.studentId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-400 text-[11px]">
                            {(studentsPage - 1) * studentsPageSize + idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            {st.studentCode}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {st.fullName ? st.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                              </div>
                              <span className="font-bold text-slate-800">{st.fullName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{st.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${stBadge.color}`}>
                              {stBadge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${enBadge.color}`}>
                              {enBadge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {formatDateTime(st.enrolledAt)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer & Pagination */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
              <div>
                Tổng số:{' '}
                <strong className="text-slate-800">{studentsTotalCount}</strong> sinh viên đã ghi danh
              </div>

              {studentsTotalCount > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStudentsPageChange(Math.max(1, studentsPage - 1))}
                    disabled={studentsPage <= 1 || isLoadingStudents}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800">
                    {studentsPage} / {studentsTotalPages}
                  </span>
                  <button
                    onClick={() => handleStudentsPageChange(Math.min(studentsTotalPages, studentsPage + 1))}
                    disabled={studentsPage >= studentsTotalPages || isLoadingStudents}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setViewingStudentsSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Chi tiết Lớp học phần */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    Thông Tin Lớp Học Phần
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Mã lớp: {selectedSection.sectionCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSection(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3.5 text-xs">
              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <span className="text-[11px] text-blue-600 font-bold block mb-1">Học phần:</span>
                <div className="font-bold text-slate-800 text-sm">
                  {selectedSection.courseName || selectedSection.courseCode}
                </div>
                {selectedSection.courseCode && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Mã môn: <strong className="text-slate-700">{selectedSection.courseCode}</strong>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-1">Mã lớp:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedSection.sectionCode}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-1">Trạng thái:</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                      getStatusBadge(selectedSection.status).badgeClass
                    }`}
                  >
                    {getStatusBadge(selectedSection.status).label}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block mb-1">Học kỳ & Niên khóa:</span>
                <span className="font-semibold text-slate-800">
                  {selectedSection.semesterName || 'Học kỳ'}
                  {selectedSection.academicYear && ` - Năm học ${selectedSection.academicYear}`}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block mb-1">Quy mô sức chứa:</span>
                <span className="font-bold text-slate-800">
                  {selectedSection.capacity} sinh viên
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetSec = selectedSection
                  setSelectedSection(null)
                  handleOpenStudentsModal(targetSec)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Xem danh sách SV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Bảng Điểm Lớp Học Phần Có Cột Các Thành Phần Điểm (GET /api/course-sections/{sectionId}/grades) */}
      {viewingGradesSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                      Bảng Điểm Lớp Học Phần: <span className="text-blue-600 font-mono">{viewingGradesSection.sectionCode}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                      GET /api/course-sections/{'{id}'}/grades
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {viewingGradesSection.courseName || viewingGradesSection.courseCode} • {viewingGradesSection.semesterName || 'Học kỳ 1'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchSectionGrades(viewingGradesSection.id, gradesPage, gradesPageSize)}
                  disabled={isLoadingGrades}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Tải lại bảng điểm từ API"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGrades ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Tải lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportGradesCsv}
                  disabled={!gradesData || !gradesData.students.length}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Xuất bảng điểm ra Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingGradesSection(null)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Toolbar: Search & PageSize */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo MSSV hoặc họ tên sinh viên..."
                  value={gradesSearch}
                  onChange={e => setGradesSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Bộ chọn Chế độ hiển thị cột điểm */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleSwitchGradesPreset('full')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    gradesPresetMode === 'full'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Hiện đầy đủ tất cả 4 thành phần điểm (Chuyên cần 10%, Thực hành 20%, Giữa kỳ 30%, Cuối kỳ 40% = 100%)"
                >
                  Đầy đủ 4 cột (100%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchGradesPreset('minimal')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    gradesPresetMode === 'minimal'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Hiện mẫu API 1 cột Giữa kỳ (30%)"
                >
                  Mẫu API 1 cột (30%)
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Số dòng:</span>
                <select
                  value={gradesPageSize}
                  onChange={e => handleGradesPageSizeChange(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 SV / trang</option>
                  <option value={20}>20 SV / trang</option>
                  <option value={50}>50 SV / trang</option>
                </select>
              </div>
            </div>

            {/* Modal Body: Table with Columns for Each Grade Component of Each Student */}
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingGrades ? (
                <div className="py-16 text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Đang tải bảng điểm học phần...</p>
                </div>
              ) : gradesError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{gradesError}</span>
                </div>
              ) : !gradesData?.students || gradesData.students.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-xs text-slate-600">Chưa có dữ liệu sinh viên hoặc điểm số</p>
                </div>
              ) : (
                <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        {/* Dòng 1: Header nhóm */}
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
                          <th rowSpan={2} className="py-3 px-3 w-12 text-center border-r border-slate-200">
                            STT
                          </th>
                          <th rowSpan={2} className="py-3 px-4 w-28 text-left border-r border-slate-200">
                            Mã SV
                          </th>
                          <th rowSpan={2} className="py-3 px-4 min-w-[190px] text-left border-r border-slate-200">
                            Họ và tên sinh viên
                          </th>
                          <th rowSpan={2} className="py-3 px-3 w-28 text-center border-r border-slate-200">
                            Trạng thái
                          </th>

                          {/* Nhóm Cột Các Thành Phần Điểm */}
                          <th
                            colSpan={gradesData.components?.length || 1}
                            className="py-2.5 px-3 bg-blue-100 text-blue-950 font-black uppercase tracking-wider text-[11px] border-r border-blue-200 text-center"
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-blue-700" />
                              <span>CÁC THÀNH PHẦN ĐIỂM HỌC PHẦN ({gradesData.components?.length || 0} cột)</span>
                            </div>
                          </th>

                          {/* Nhóm Cột Đánh Giá Tổng Kết */}
                          <th
                            colSpan={3}
                            className="py-2.5 px-3 bg-emerald-100 text-emerald-950 font-black uppercase tracking-wider text-[11px] text-center"
                          >
                            <span>KẾT QUẢ ĐÁNH GIÁ TỔNG KẾT</span>
                          </th>
                        </tr>

                        {/* Dòng 2: Chi tiết từng cột thành phần điểm */}
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs">
                          {(gradesData.components || []).map((comp, cIdx) => (
                            <th
                              key={comp.id}
                              className="py-2.5 px-3 font-bold text-center min-w-[130px] border-r border-slate-200 bg-blue-50/50"
                            >
                              <div className="text-slate-900 font-extrabold flex items-center justify-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                                  {cIdx + 1}
                                </span>
                                <span>{comp.name}</span>
                              </div>
                              <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                                {comp.weight}% • Thang {comp.maxScore}
                              </div>
                            </th>
                          ))}

                          <th className="py-2.5 px-3 font-bold text-center w-24 border-r border-slate-200 bg-slate-100/70">
                            <div>Tổng kết</div>
                            <div className="text-[10px] text-slate-500 font-normal">Hệ 10</div>
                          </th>
                          <th className="py-2.5 px-3 font-bold text-center w-20 border-r border-slate-200 bg-slate-100/70">
                            <div>Điểm chữ</div>
                            <div className="text-[10px] text-slate-500 font-normal">Quy đổi</div>
                          </th>
                          <th className="py-2.5 px-3 font-bold text-center w-24 bg-slate-100/70">
                            <div>Kết quả</div>
                            <div className="text-[10px] text-slate-500 font-normal">Xếp loại</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredGradesStudents.map((st, idx) => {
                          const comps = gradesData.components || []
                          let weightedScore = 0
                          let gradedCount = 0
                          const totalWeight = comps.reduce((acc, c) => acc + (c.weight || 0), 0)
                          const stGrades = st.grades || []

                          comps.forEach(c => {
                            const g = stGrades.find(
                              item =>
                                (item.gradeComponentId || '').toLowerCase() ===
                                (c.id || '').toLowerCase()
                            )
                            if (g && typeof g.score === 'number' && g.score !== null) {
                              gradedCount++
                              weightedScore += (g.score / (c.maxScore || 10)) * 10 * (c.weight / 100)
                            }
                          })

                          const total = Number(weightedScore.toFixed(1))
                          const normalized = totalWeight > 0 ? Number(((weightedScore / totalWeight) * 10).toFixed(1)) : total
                          let letter = '-'
                          let resultText = totalWeight < 100 ? `Chưa hoàn tất (${totalWeight}%)` : 'Chưa hoàn tất'
                          let resultBadge = 'bg-blue-50 text-blue-700 border-blue-200'

                          if (gradedCount > 0) {
                            const evalScore = totalWeight === 100 ? total : normalized
                            if (evalScore >= 8.5) letter = 'A'
                            else if (evalScore >= 7.0) letter = 'B'
                            else if (evalScore >= 5.5) letter = 'C'
                            else if (evalScore >= 4.0) letter = 'D'
                            else letter = 'F'

                            if (gradedCount === comps.length && totalWeight === 100) {
                              if (evalScore >= 5.0) {
                                resultText = 'Đạt'
                                resultBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              } else if (evalScore >= 4.0) {
                                resultText = 'Cảnh báo'
                                resultBadge = 'bg-amber-50 text-amber-700 border-amber-200'
                              } else {
                                resultText = 'Không đạt'
                                resultBadge = 'bg-rose-50 text-rose-700 border-rose-200'
                              }
                            }
                          }

                          return (
                            <tr key={st.enrollmentId || st.studentId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3 text-center text-slate-400 font-bold border-r border-slate-100">
                                {(gradesPage - 1) * gradesPageSize + idx + 1}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-700 border-r border-slate-100">
                                {st.studentCode}
                              </td>
                              <td className="py-3 px-4 border-r border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    {st.fullName ? st.fullName.charAt(0) : '?'}
                                  </div>
                                  <span className="font-bold text-slate-800">{st.fullName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center border-r border-slate-100">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {st.enrollmentStatus === 'Registered' ? 'Đã đăng ký' : st.enrollmentStatus}
                                </span>
                              </td>

                              {/* Từng cột thành phần điểm của sinh viên này */}
                              {comps.map(comp => {
                                const g = stGrades.find(
                                  item =>
                                    (item.gradeComponentId || '').toLowerCase() ===
                                    (comp.id || '').toLowerCase()
                                )
                                const hasScore = g && typeof g.score === 'number' && g.score !== null

                                return (
                                  <td
                                    key={comp.id}
                                    className="py-3 px-3 text-center border-r border-slate-100 bg-blue-50/10"
                                  >
                                    {hasScore ? (
                                      <div className="inline-flex flex-col items-center">
                                        <span
                                          className="inline-block px-2.5 py-1 rounded-lg font-black text-xs bg-blue-50 border border-blue-200 text-blue-900 shadow-xs"
                                          title={g?.gradedAtUtc ? `Chấm lúc: ${new Date(g.gradedAtUtc).toLocaleString('vi-VN')}` : undefined}
                                        >
                                          {g.score}
                                        </span>
                                        <span className="text-[9px] text-blue-600 font-semibold mt-0.5">
                                          Thang {comp.maxScore}
                                        </span>
                                      </div>
                                    ) : (
                                      <span
                                        className="inline-block px-2 py-0.5 rounded text-[10px] font-mono italic text-amber-700 bg-amber-50 border border-amber-200/80"
                                        title="Chưa có điểm (score: null, gradeId: null)"
                                      >
                                        null
                                      </span>
                                    )}
                                  </td>
                                )
                              })}

                              {/* Tổng kết */}
                              <td className="py-3 px-3 text-center font-extrabold border-r border-slate-200 bg-slate-50/50">
                                {gradedCount > 0 ? (
                                  <div className="inline-flex flex-col items-center">
                                    <span className="text-sm font-black text-slate-800">
                                      {totalWeight === 100 ? total : normalized}
                                    </span>
                                    {totalWeight < 100 && (
                                      <span className="text-[9px] text-slate-500 font-medium">
                                        Hệ số {total}/{(totalWeight / 10).toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-mono italic">-</span>
                                )}
                              </td>

                              {/* Điểm chữ */}
                              <td className="py-3 px-2 text-center border-r border-slate-200">
                                <span className="font-extrabold text-xs text-slate-700">
                                  {letter}
                                </span>
                              </td>

                              {/* Kết quả */}
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${resultBadge}`}>
                                  {resultText}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Hiển thị <strong>{filteredGradesStudents.length}</strong> sinh viên với <strong>{gradesData?.components?.length || 0} cột thành phần điểm</strong>
                </span>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleGradesPageChange(Math.max(1, gradesPage - 1))}
                    disabled={gradesPage <= 1 || isLoadingGrades}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-slate-800 text-[11px]">
                    Trang {gradesPage}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGradesPageChange(gradesPage + 1)}
                    disabled={isLoadingGrades || (gradesData?.totalCount ? gradesPage * gradesPageSize >= gradesData.totalCount : true)}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 cursor-pointer"
                    title="Trang sau"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sec = viewingGradesSection
                    setViewingGradesSection(null)
                    if (onOpenGradebook) {
                      onOpenGradebook(sec.id, sec.sectionCode)
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Mở trang Nhập điểm đầy đủ
                </button>
                <button
                  type="button"
                  onClick={() => setViewingGradesSection(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
