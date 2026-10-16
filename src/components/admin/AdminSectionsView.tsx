import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  RefreshCw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Calendar,
  Users,
  Mail,
  User
} from 'lucide-react'
import type {
  ApiCourseItem,
  ApiSemesterItem,
  ApiLecturerItem,
  ApiCourseSectionItem,
  ApiCourseSectionListResponse,
  CreateCourseSectionRequest,
  CreateCourseSectionResponse,
  ApiSectionStudentItem,
  ApiSectionStudentListResponse
} from '../../types'
import { API_BASE_URL, getCourseSectionStudentsUrl } from '../../config'

export const AdminSectionsView: React.FC = () => {
  // Danh sách lớp học phần lấy từ API GET /api/course-sections
  const [sections, setSections] = useState<ApiCourseSectionItem[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoadingSections, setIsLoadingSections] = useState<boolean>(true)
  const [sectionsError, setSectionsError] = useState<string | null>(null)

  // Danh mục tham chiếu lấy từ API backend (môn học, học kỳ, giảng viên)
  const [courses, setCourses] = useState<ApiCourseItem[]>([])
  const [semesters, setSemesters] = useState<ApiSemesterItem[]>([])
  const [lecturers, setLecturers] = useState<ApiLecturerItem[]>([])

  const [isLoadingRef, setIsLoadingRef] = useState(false)
  const [isLoadingLecturers, setIsLoadingLecturers] = useState(false)
  const [lecturersError, setLecturersError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<ApiCourseSectionItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Cấu hình Base URL API
  const [baseUrl] = useState<string>(API_BASE_URL || 'https://localhost:7248')

  // Form state tạo lớp học phần
  const [newSection, setNewSection] = useState<{
    sectionCode: string
    courseId: string
    semesterId: string
    lecturerId: string
    capacity: number | string
  }>({
    sectionCode: '',
    courseId: '',
    semesterId: '',
    lecturerId: '',
    capacity: 40
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Modal danh sách sinh viên của một lớp học phần (GET /api/course-sections/{sectionId}/students)
  const [viewingStudentsSection, setViewingStudentsSection] = useState<ApiCourseSectionItem | null>(null)
  const [students, setStudents] = useState<ApiSectionStudentItem[]>([])
  const [studentsPage, setStudentsPage] = useState<number>(1)
  const [studentsPageSize, setStudentsPageSize] = useState<number>(20)
  const [studentsTotalCount, setStudentsTotalCount] = useState<number>(0)
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [studentsSearch, setStudentsSearch] = useState('')

  const fetchSectionStudents = useCallback(
    async (sectionId: string, targetPage = 1, targetPageSize = studentsPageSize) => {
      setIsLoadingStudents(true)
      setStudentsError(null)

      const token = localStorage.getItem('accessToken')
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

  const handleOpenStudentsModal = (sec: ApiCourseSectionItem) => {
    setViewingStudentsSection(sec)
    setStudentsSearch('')
    setStudentsPage(1)
    fetchSectionStudents(sec.id, 1, studentsPageSize)
  }

  const handleStudentsPageChange = (newPage: number) => {
    if (!viewingStudentsSection) return
    setStudentsPage(newPage)
    fetchSectionStudents(viewingStudentsSection.id, newPage, studentsPageSize)
  }

  const handleStudentsPageSizeChange = (newSize: number) => {
    if (!viewingStudentsSection) return
    setStudentsPageSize(newSize)
    setStudentsPage(1)
    fetchSectionStudents(viewingStudentsSection.id, 1, newSize)
  }

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

  // 1. Gọi API GET /api/course-sections?page=1&pageSize=20
  const fetchCourseSections = useCallback(
    async (targetPage = page, targetPageSize = pageSize) => {
      setIsLoadingSections(true)
      setSectionsError(null)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        setSectionsError(
          'Thiếu phiên làm việc. Vui lòng đăng nhập với tài khoản Quản trị viên để xem danh sách lớp học phần.'
        )
        setIsLoadingSections(false)
        return
      }

      try {
        const cleanBase = baseUrl.replace(/\/+$/, '')
        const endpoint = `${cleanBase}/api/course-sections?page=${targetPage}&pageSize=${targetPageSize}`

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (response.status === 401) {
          setSectionsError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          setSections([])
          return
        }

        if (response.status === 403) {
          setSectionsError(
            'Bạn không có quyền quản trị để truy cập danh sách lớp học phần.'
          )
          setSections([])
          return
        }

        if (!response.ok) {
          let errDetail = `Lỗi tải dữ liệu (${response.status})`
          try {
            const errJson = await response.json()
            if (errJson.message) errDetail = errJson.message
          } catch {
            // ignore
          }
          setSectionsError(errDetail)
          return
        }

        const resData: ApiCourseSectionListResponse = await response.json()

        if (resData.success && resData.data) {
          setSections(resData.data.items || [])
          setPage(resData.data.page || targetPage)
          setPageSize(resData.data.pageSize || targetPageSize)
          setTotalCount(resData.data.totalCount || 0)
        } else {
          setSectionsError(resData.message || 'Không thể tải danh sách lớp học phần.')
        }
      } catch (err: unknown) {
        console.error('Lỗi khi tải danh sách lớp học phần:', err)
        setSectionsError(
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.'
        )
      } finally {
        setIsLoadingSections(false)
      }
    },
    [baseUrl, page, pageSize]
  )

  // 2. Gọi API GET /api/lecturers?page=1&pageSize=100
  const fetchLecturers = useCallback(
    async (targetPage = 1, targetPageSize = 100) => {
      setIsLoadingLecturers(true)
      setLecturersError(null)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLecturersError(
          'Thiếu phiên làm việc. Hãy đăng nhập tài khoản Quản trị viên để lấy danh sách giảng viên.'
        )
        setIsLoadingLecturers(false)
        return
      }

      try {
        const cleanBase = baseUrl.replace(/\/+$/, '')
        const endpoint = `${cleanBase}/api/lecturers?page=${targetPage}&pageSize=${targetPageSize}`

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (response.status === 401) {
          setLecturersError('Phiên đăng nhập đã hết hạn.')
          return
        }

        if (response.status === 403) {
          setLecturersError('Bạn không có quyền truy cập danh sách giảng viên.')
          return
        }

        if (!response.ok) {
          setLecturersError('Không thể tải danh sách giảng viên.')
          return
        }

        const resData = await response.json()
        if (resData.success && resData.data?.items) {
          const items: ApiLecturerItem[] = resData.data.items
          setLecturers(items)
          if (items.length > 0) {
            setNewSection(prev => (prev.lecturerId ? prev : { ...prev, lecturerId: items[0].id }))
          }
        } else {
          setLecturersError(resData.message || 'Không thể tải danh sách giảng viên.')
        }
      } catch (err: unknown) {
        console.error('Lỗi khi tải danh sách giảng viên:', err)
        setLecturersError('Không thể kết nối đến máy chủ để lấy danh sách giảng viên.')
      } finally {
        setIsLoadingLecturers(false)
      }
    },
    [baseUrl]
  )

  // 3. Tải danh mục môn học và học kỳ
  const loadReferenceData = useCallback(async () => {
    setIsLoadingRef(true)
    const cleanBase = baseUrl.replace(/\/+$/, '')
    const token = localStorage.getItem('accessToken')

    // Tải danh sách môn học
    try {
      const res = await fetch(`${cleanBase}/api/courses?limit=100`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setCourses(json.data)
          if (json.data.length > 0) {
            setNewSection(prev => (prev.courseId ? prev : { ...prev, courseId: json.data[0].id }))
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách môn học:', err)
    }

    // Tải danh sách học kỳ
    try {
      const res = await fetch(`${cleanBase}/api/semesters`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setSemesters(json.data)
          if (json.data.length > 0) {
            setNewSection(prev => (prev.semesterId ? prev : { ...prev, semesterId: json.data[0].id }))
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách học kỳ:', err)
    }

    // Tải danh sách giảng viên
    await fetchLecturers(1, 100)

    setIsLoadingRef(false)
  }, [baseUrl, fetchLecturers])

  // Khởi chạy khi component mount
  useEffect(() => {
    fetchCourseSections(1, pageSize)
    loadReferenceData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      fetchCourseSections(newPage, pageSize)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
    fetchCourseSections(1, newSize)
  }

  // Lọc danh sách lớp học phần theo ô tìm kiếm và học kỳ
  const filteredSections = useMemo(() => {
    return sections.filter(sec => {
      const q = search.trim().toLowerCase()
      const course = courses.find(c => c.id === sec.courseId)
      const lecturer = lecturers.find(l => l.id === sec.lecturerId)

      const matchesSearch =
        !q ||
        sec.sectionCode.toLowerCase().includes(q) ||
        (sec.courseCode && sec.courseCode.toLowerCase().includes(q)) ||
        (sec.courseName && sec.courseName.toLowerCase().includes(q)) ||
        (sec.lecturerName && sec.lecturerName.toLowerCase().includes(q)) ||
        (sec.semesterName && sec.semesterName.toLowerCase().includes(q)) ||
        (course && course.courseName.toLowerCase().includes(q)) ||
        (course && course.courseCode.toLowerCase().includes(q)) ||
        (lecturer && lecturer.fullName.toLowerCase().includes(q)) ||
        (lecturer && lecturer.lecturerCode.toLowerCase().includes(q))

      const matchesSemester =
        semesterFilter === 'ALL' ||
        sec.semesterId === semesterFilter ||
        sec.semesterName === semesterFilter

      return matchesSearch && matchesSemester
    })
  }, [sections, search, semesterFilter, courses, lecturers])

  // Mở modal tạo lớp
  const handleOpenModal = () => {
    setFormError(null)
    setIsModalOpen(true)
    fetchLecturers(1, 100)
  }

  // Xử lý tạo mới lớp học phần - Gọi POST /api/course-sections
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const sectionCode = newSection.sectionCode.trim()
    const courseId = newSection.courseId.trim()
    const semesterId = newSection.semesterId.trim()
    const lecturerId = newSection.lecturerId.trim()
    const capacity = Number(newSection.capacity)

    if (!sectionCode) {
      setFormError('Vui lòng nhập mã lớp học phần.')
      return
    }
    if (!courseId) {
      setFormError('Vui lòng chọn môn học.')
      return
    }
    if (!semesterId) {
      setFormError('Vui lòng chọn học kỳ.')
      return
    }
    if (!lecturerId) {
      setFormError('Vui lòng chọn giảng viên phụ trách.')
      return
    }
    if (isNaN(capacity) || capacity <= 0) {
      setFormError('Sĩ số tối đa phải là số nguyên lớn hơn 0.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setFormError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      return
    }

    setIsSubmitting(true)

    try {
      const cleanBase = baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBase}/api/course-sections`

      const payload: CreateCourseSectionRequest = {
        courseId,
        semesterId,
        lecturerId,
        sectionCode,
        capacity
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      // 409 Conflict: Trùng mã lớp trong cùng học kỳ
      if (response.status === 409) {
        let errDetail = 'Mã lớp này đã tồn tại trong học kỳ đã chọn.'
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setFormError(errDetail)
        return
      }

      // 400 Bad Request: Khóa học không tồn tại hoặc dữ liệu không hợp lệ
      if (response.status === 400) {
        let errDetail = 'Thông tin đăng ký không hợp lệ hoặc môn học không tồn tại.'
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setFormError(errDetail)
        return
      }

      // 401 Unauthorized
      if (response.status === 401) {
        setFormError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.')
        return
      }

      // 403 Forbidden
      if (response.status === 403) {
        setFormError('Bạn không có quyền tạo lớp học phần.')
        return
      }

      if (!response.ok) {
        let errDetail = `Lỗi yêu cầu (${response.status})`
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setFormError(errDetail)
        return
      }

      // 201 Created
      const resData: CreateCourseSectionResponse = await response.json()

      if (resData.success && resData.data) {
        setIsModalOpen(false)
        showToast(`Đã mở thành công lớp học phần ${newSection.sectionCode}!`)
        setNewSection(prev => ({
          ...prev,
          sectionCode: ''
        }))
        // Tải lại danh sách lớp học phần
        await fetchCourseSections(1, pageSize)
      } else {
        setFormError(resData.message || 'Không thể tạo lớp học phần.')
      }
    } catch (err: unknown) {
      console.error('Lỗi khi tạo lớp học phần:', err)
      setFormError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            Quản Lý Lớp Học Phần
          </h1>
          <p className="text-xs text-slate-500 mt-1 pl-12.5">
            Theo dõi thông tin các lớp học phần, sĩ số sinh viên và giảng viên phụ trách theo từng học kỳ.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              fetchCourseSections(page, pageSize)
              loadReferenceData()
              showToast('Đã làm mới dữ liệu')
            }}
            disabled={isLoadingSections || isLoadingRef}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới danh sách lớp học phần"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSections || isLoadingRef ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mở lớp học phần mới</span>
          </button>
        </div>
      </div>

      {/* Error Banner nếu không tải được danh sách */}
      {sectionsError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-xs text-rose-700 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Không thể tải danh sách lớp học phần:</span>
              <span>{sectionsError}</span>
            </div>
          </div>
          <button
            onClick={() => fetchCourseSections(page, pageSize)}
            className="px-3 py-1 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold shrink-0 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã lớp, môn học, giảng viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-amber-500 cursor-pointer max-w-[220px] truncate"
          >
            <option value="ALL">Tất cả học kỳ</option>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.academicYear})
              </option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={e => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
            <option value={100}>100 / trang</option>
          </select>
        </div>
      </div>

      {/* Sections Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Mã lớp học phần</th>
                <th className="py-3.5 px-4 font-bold">Môn học</th>
                <th className="py-3.5 px-4 font-bold">Học kỳ</th>
                <th className="py-3.5 px-4 font-bold">Giảng viên phụ trách</th>
                <th className="py-3.5 px-4 font-bold text-center">Sĩ số tối đa</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingSections ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                    <span>Đang tải danh sách lớp học phần...</span>
                  </td>
                </tr>
              ) : filteredSections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm text-slate-600 mb-1">
                      Không tìm thấy lớp học phần nào
                    </p>
                    <p className="text-xs text-slate-400">
                      Nhấn nút <span className="font-semibold text-amber-600">"Mở lớp học phần mới"</span> để tạo lớp học phần mới cho sinh viên đăng ký.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSections.map(sec => {
                  const course = courses.find(c => c.id === sec.courseId)
                  const semester = semesters.find(s => s.id === sec.semesterId)
                  const lecturer = lecturers.find(l => l.id === sec.lecturerId)

                  const displayCourseCode = sec.courseCode || course?.courseCode || ''
                  const displayCourseName = sec.courseName || course?.courseName || 'Môn học'
                  const displaySemester =
                    sec.semesterName ||
                    (semester ? `${semester.name} (${semester.academicYear})` : 'Học kỳ')
                  const displayLecturer =
                    sec.lecturerName || lecturer?.fullName || 'Chưa phân công'

                  return (
                    <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 text-sm">{sec.sectionCode}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{displayCourseName}</div>
                        {displayCourseCode && (
                          <div className="text-[11px] text-slate-400">
                            {displayCourseCode}
                            {course?.credits ? ` • ${course.credits} TC` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{displaySemester}</div>
                        {sec.academicYear && (
                          <div className="text-[11px] text-slate-400">{sec.academicYear}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{displayLecturer}</div>
                        {lecturer?.lecturerCode && (
                          <div className="text-[11px] text-slate-400">
                            Mã GV: {lecturer.lecturerCode}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {sec.capacity} sinh viên
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {sec.status === 'Open' ? 'Đang mở đăng ký' : sec.status || 'Đang mở'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStudentsModal(sec)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Xem danh sách sinh viên lớp học phần"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Danh sách SV</span>
                          </button>
                          <button
                            onClick={() => setSelectedSection(sec)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>
            Hiển thị <b>{filteredSections.length}</b> / <b>{totalCount}</b> lớp học phần
          </span>
          <span className="text-slate-300 mx-2">•</span>
          <span>
            Trang <b>{page}</b> / <b>{totalPages}</b>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoadingSections}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200">
            {page}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isLoadingSections}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Mở lớp học phần mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Mở lớp học phần mới</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Điền thông tin để mở lớp học phần mới cho sinh viên đăng ký
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message Box */}
            {formError && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Không thể tạo lớp học phần:</span>
                  <span>{formError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleAddSection} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mã lớp học phần <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CS101-01"
                    value={newSection.sectionCode}
                    onChange={e => setNewSection({ ...newSection, sectionCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Sĩ số tối đa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSection.capacity}
                    onChange={e => setNewSection({ ...newSection, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Môn học */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Môn học đào tạo <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newSection.courseId}
                  onChange={e => setNewSection({ ...newSection, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-white cursor-pointer"
                >
                  <option value="">-- Chọn môn học --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.courseCode}] {c.courseName} ({c.credits} TC)
                    </option>
                  ))}
                </select>
              </div>

              {/* Học kỳ */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Học kỳ áp dụng <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newSection.semesterId}
                  onChange={e => setNewSection({ ...newSection, semesterId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-white cursor-pointer"
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              {/* Giảng viên */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Giảng viên phụ trách <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fetchLecturers(1, 100)}
                    disabled={isLoadingLecturers}
                    className="text-[11px] text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingLecturers ? 'animate-spin' : ''}`} />
                    <span>Tải lại</span>
                  </button>
                </div>

                <select
                  required
                  value={newSection.lecturerId}
                  onChange={e => setNewSection({ ...newSection, lecturerId: e.target.value })}
                  disabled={isLoadingLecturers}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-white cursor-pointer font-medium disabled:bg-slate-50"
                >
                  <option value="">
                    {isLoadingLecturers
                      ? '-- Đang tải danh sách giảng viên... --'
                      : lecturers.length === 0
                      ? '-- Không có giảng viên nào hoặc chưa tải được --'
                      : '-- Chọn giảng viên giảng dạy --'}
                  </option>
                  {lecturers.map(l => (
                    <option key={l.id} value={l.id}>
                      [{l.lecturerCode}] {l.fullName} {l.email ? `• ${l.email}` : ''}
                    </option>
                  ))}
                </select>

                {lecturersError && (
                  <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{lecturersError}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu lớp học phần...</span>
                    </>
                  ) : (
                    <span>Lưu lớp học phần</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal Chi tiết lớp học phần */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Lớp: {selectedSection.sectionCode}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedSection.courseName || 'Chi tiết lớp học phần'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSection(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    Môn học
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedSection.courseName || 'Môn học'}
                  </div>
                  {selectedSection.courseCode && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Mã môn: {selectedSection.courseCode}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Học kỳ
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedSection.semesterName || 'Học kỳ'}
                  </div>
                  {selectedSection.academicYear && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Niên khóa: {selectedSection.academicYear}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    Giảng viên phụ trách
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedSection.lecturerName || 'Chưa phân công'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    Sĩ số tối đa
                  </span>
                  <div className="font-bold text-slate-800 text-sm">
                    {selectedSection.capacity} sinh viên
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Trạng thái</span>
                  <span className="font-semibold text-emerald-600 text-xs">
                    {selectedSection.status === 'Open' ? 'Đang mở đăng ký' : selectedSection.status || 'Đang mở'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mã lớp</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedSection.sectionCode}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const sec = selectedSection
                  setSelectedSection(null)
                  handleOpenStudentsModal(sec)
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Xem danh sách sinh viên</span>
              </button>

              <button
                onClick={() => setSelectedSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Danh Sách Sinh Viên Lớp Học Phần (GET /api/course-sections/{sectionId}/students) */}
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
                <X className="w-4 h-4" />
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
                    {studentsPage} / {Math.max(1, Math.ceil(studentsTotalCount / studentsPageSize))}
                  </span>
                  <button
                    onClick={() => handleStudentsPageChange(Math.min(Math.max(1, Math.ceil(studentsTotalCount / studentsPageSize)), studentsPage + 1))}
                    disabled={studentsPage >= Math.max(1, Math.ceil(studentsTotalCount / studentsPageSize)) || isLoadingStudents}
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

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
