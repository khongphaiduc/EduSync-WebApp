import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  X,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Lock,
  LayoutGrid,
  List,
  Eye,
  Copy,
  Sparkles,
  Percent,
  Layers,
  FileText,
  FileCheck,
  Server
} from 'lucide-react'
import type {
  ApiCourseItem,
  ApiCourseListResponse,
  CreateCourseResponse,
  ApiCourseSectionItem,
  ApiCourseSectionListResponse,
  CreateGradeComponentRequest,
  CreateGradeComponentResponse,
  ApiGradeComponentItem,
  ApiGradeComponentListResponse
} from '../../types'
import {
  API_BASE_URL,
  getCourseSectionsUrl,
  getGradeComponentsUrl
} from '../../config'

// Dữ liệu mẫu dùng cho chế độ xem trước (Offline Demo Preview) khi backend chưa khởi động
const MOCK_DEMO_COURSES: ApiCourseItem[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    courseCode: 'MATH101',
    courseName: 'Toán cao cấp',
    credits: 3,
    description: 'Môn học cơ bản về giải tích và đại số tuyến tính cho sinh viên đại học.'
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    courseCode: 'INT3102',
    courseName: 'Lập trình .NET & C# nâng cao',
    credits: 3,
    description: 'Phát triển ứng dụng Web API, microservices và kiến trúc phần mềm với ASP.NET Core.'
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    courseCode: 'INT2204',
    courseName: 'Cơ sở dữ liệu quan hệ',
    credits: 4,
    description: 'Thiết kế hệ CSDL quan hệ, chuẩn hóa dữ liệu, tối ưu hóa câu lệnh SQL và quản trị dữ liệu.'
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    courseCode: 'INT3115',
    courseName: 'Phát triển ứng dụng Web Frontend',
    credits: 3,
    description: 'Xây dựng giao diện ứng dụng web hiện đại với React, TypeScript và Tailwind CSS.'
  },
  {
    id: '11111111-1111-1111-1111-111111111115',
    courseCode: 'INT3401',
    courseName: 'Trí tuệ nhân tạo căn bản',
    credits: 4,
    description: 'Các thuật toán học máy, học sâu và xử lý dữ liệu thông minh trong hệ thống AI.'
  },
  {
    id: '11111111-1111-1111-1111-111111111116',
    courseCode: 'ENG1001',
    courseName: 'Tiếng Anh học thuật 1',
    credits: 2,
    description: 'Kỹ năng đọc hiểu văn bản chuyên ngành và giao tiếp học thuật chuẩn quốc tế.'
  }
]

export const AdminSubjectsView: React.FC = () => {
  // Trạng thái dữ liệu danh sách môn học từ API
  const [courses, setCourses] = useState<ApiCourseItem[]>([])
  const [limit, setLimit] = useState<number>(20)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Trạng thái HTTP & Lỗi
  const [httpStatus, setHttpStatus] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  // Cấu hình Base URL API
  const [baseUrl] = useState<string>(API_BASE_URL || 'https://localhost:7248')

  // Tìm kiếm client
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // Modal xem chi tiết và thêm mới
  const [selectedCourse, setSelectedCourse] = useState<ApiCourseItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form thêm môn học mới
  const [newCourse, setNewCourse] = useState({
    courseCode: '',
    courseName: '',
    credits: 3,
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Modal tạo điểm thành phần cho lớp học phần (POST /api/course-sections/{sectionId}/grade-components)
  const [gradeComponentCourse, setGradeComponentCourse] = useState<ApiCourseItem | null>(null)
  const [courseSections, setCourseSections] = useState<ApiCourseSectionItem[]>([])
  const [isLoadingSections, setIsLoadingSections] = useState<boolean>(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  const [customSectionId, setCustomSectionId] = useState<string>('')
  const [useCustomSectionId, setUseCustomSectionId] = useState<boolean>(false)
  const [componentName, setComponentName] = useState<string>('Giữa kỳ')
  const [componentWeight, setComponentWeight] = useState<number | string>(30)
  const [componentMaxScore, setComponentMaxScore] = useState<number | string>(10)
  const [isSubmittingComponent, setIsSubmittingComponent] = useState<boolean>(false)
  const [componentError, setComponentError] = useState<string | null>(null)
  const [existingComponents, setExistingComponents] = useState<ApiGradeComponentItem[]>([])
  const [isLoadingComponents, setIsLoadingComponents] = useState<boolean>(false)

  // Gọi GET /api/course-sections/{sectionId}/grade-components
  const fetchExistingComponents = useCallback(async (sectionId: string) => {
    if (!sectionId) {
      setExistingComponents([])
      return
    }
    setIsLoadingComponents(true)
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoadingComponents(false)
      return
    }
    try {
      const response = await fetch(getGradeComponentsUrl(sectionId), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      if (response.ok) {
        const json: ApiGradeComponentListResponse = await response.json()
        if (json.success && Array.isArray(json.data)) {
          setExistingComponents(json.data)
        } else {
          setExistingComponents([])
        }
      } else {
        setExistingComponents([])
      }
    } catch {
      setExistingComponents([])
    } finally {
      setIsLoadingComponents(false)
    }
  }, [])

  // Tự động tải danh sách loại điểm khi chọn lớp học phần
  useEffect(() => {
    const secId = useCustomSectionId ? customSectionId.trim() : selectedSectionId
    if (gradeComponentCourse && secId) {
      fetchExistingComponents(secId)
    } else {
      setExistingComponents([])
    }
  }, [selectedSectionId, customSectionId, useCustomSectionId, gradeComponentCourse, fetchExistingComponents])

  // Mở modal tạo điểm thành phần và tải danh sách lớp học phần
  const handleOpenGradeComponentModal = async (course: ApiCourseItem) => {
    setGradeComponentCourse(course)
    setComponentName('Giữa kỳ')
    setComponentWeight(30)
    setComponentMaxScore(10)
    setComponentError(null)
    setExistingComponents([])
    setSelectedSectionId('')
    setCustomSectionId('')
    setUseCustomSectionId(false)
    setIsLoadingSections(true)

    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const response = await fetch(getCourseSectionsUrl(1, 100), {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const json: ApiCourseSectionListResponse = await response.json()
          if (json.success && json.data?.items) {
            // Lọc các lớp học phần thuộc môn học này
            const matched = json.data.items.filter(s => s.courseId === course.id)
            setCourseSections(matched.length > 0 ? matched : json.data.items)
            if (matched.length > 0) {
              setSelectedSectionId(matched[0].id)
            } else if (json.data.items.length > 0) {
              setSelectedSectionId(json.data.items[0].id)
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoadingSections(false)
      }
    } else {
      setIsLoadingSections(false)
    }
  }

  // Submit tạo điểm thành phần (POST /api/course-sections/{sectionId}/grade-components)
  const handleSubmitGradeComponent = async (e: React.FormEvent) => {
    e.preventDefault()
    setComponentError(null)

    const targetSectionId = useCustomSectionId ? customSectionId.trim() : selectedSectionId
    if (!targetSectionId) {
      setComponentError('Vui lòng chọn hoặc nhập mã định danh (ID) lớp học phần áp dụng.')
      return
    }

    if (!componentName.trim()) {
      setComponentError('Vui lòng nhập tên thành phần điểm (VD: Giữa kỳ, Cuối kỳ...).')
      return
    }

    const weightNum = Number(componentWeight)
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 100) {
      setComponentError('Trọng số điểm phải là số từ 1% đến 100%.')
      return
    }

    const maxScoreNum = Number(componentMaxScore)
    if (isNaN(maxScoreNum) || maxScoreNum <= 0) {
      setComponentError('Điểm tối đa phải lớn hơn 0.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setComponentError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.')
      return
    }

    setIsSubmittingComponent(true)

    try {
      const payload: CreateGradeComponentRequest = {
        name: componentName.trim(),
        weight: weightNum,
        maxScore: maxScoreNum
      }

      const response = await fetch(getGradeComponentsUrl(targetSectionId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json: CreateGradeComponentResponse = await response.json().catch(() => ({
        success: false,
        message: 'Lỗi không xác định từ máy chủ.'
      }))

      if (response.status === 201 || (response.ok && json.success)) {
        showToast(`Đã tạo thành phần điểm "${payload.name}" (${payload.weight}%) thành công!`)
        // Tải lại danh sách điểm thành phần từ GET /api/course-sections/{sectionId}/grade-components
        fetchExistingComponents(targetSectionId)
        // Gợi ý thành phần tiếp theo
        if (payload.name === 'Giữa kỳ') {
          setComponentName('Cuối kỳ')
          setComponentWeight(50)
        } else if (payload.name === 'Chuyên cần') {
          setComponentName('Giữa kỳ')
          setComponentWeight(30)
        } else {
          setComponentName('')
          setComponentWeight(20)
        }
      } else if (response.status === 404) {
        setComponentError('Không tìm thấy lớp học phần này (404 Not Found). Vui lòng kiểm tra lại lớp học phần.')
      } else if (response.status === 400) {
        setComponentError(json.message || 'Dữ liệu thành phần điểm không hợp lệ (tổng trọng số vượt 100% hoặc trùng tên).')
      } else {
        setComponentError(json.message || 'Không thể tạo thành phần điểm. Vui lòng thử lại.')
      }
    } catch {
      setComponentError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.')
    } finally {
      setIsSubmittingComponent(false)
    }
  }

  // Hàm gọi API GET /api/courses?limit=20
  const fetchCourses = useCallback(
    async (targetLimit = limit) => {
      setIsLoading(true)
      setErrorMessage(null)
      setHttpStatus(null)

      const token = localStorage.getItem('accessToken')

      // Kiểm tra có token hay không
      if (!token) {
        setIsLoading(false)
        setHttpStatus(401)
        setErrorMessage('Thiếu token xác thực (401 Unauthorized). Vui lòng đăng nhập với tài khoản Quản trị viên để truy cập danh sách môn học.')
        return
      }

      try {
        const cleanBase = baseUrl.replace(/\/+$/, '')
        const endpoint = `${cleanBase}/api/courses?limit=${targetLimit}`

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        setHttpStatus(response.status)

        // 401: Thiếu hoặc sai token
        if (response.status === 401) {
          setErrorMessage('Thiếu hoặc sai token xác thực (401 Unauthorized). Phiên làm việc đã hết hạn.')
          setCourses([])
          setIsDemoMode(false)
          return
        }

        // 403: Không có quyền Admin
        if (response.status === 403) {
          setErrorMessage('Không có quyền truy cập (403 Forbidden). Bạn cần quyền Quản trị viên để xem danh sách môn học.')
          setCourses([])
          setIsDemoMode(false)
          return
        }

        if (!response.ok) {
          let errDetail = `Lỗi máy chủ HTTP ${response.status} (${response.statusText})`
          try {
            const errJson = await response.json()
            if (errJson.message) errDetail = errJson.message
          } catch {
            // bỏ qua parse lỗi
          }
          setErrorMessage(errDetail)
          return
        }

        const resData: ApiCourseListResponse = await response.json()

        if (resData.success && Array.isArray(resData.data)) {
          setCourses(resData.data)
          setIsDemoMode(false)
        } else {
          setErrorMessage(resData.message || 'Không thể lấy danh sách môn học từ API.')
        }
      } catch (err: unknown) {
        console.error('Lỗi khi gọi API courses:', err)
        setHttpStatus(0)
        setErrorMessage(
          `Không thể kết nối đến máy chủ API (${baseUrl}). Vui lòng kiểm tra backend ASP.NET Core đang chạy hoặc bật chế độ xem trước dữ liệu mẫu.`
        )
      } finally {
        setIsLoading(false)
      }
    },
    [limit, baseUrl]
  )

  // Gọi API lần đầu khi component mount
  useEffect(() => {
    fetchCourses(limit)
  }, [fetchCourses, limit])

  // Kích hoạt chế độ demo preview khi backend chưa chạy
  const handleEnableDemoMode = () => {
    setIsDemoMode(true)
    setCourses(MOCK_DEMO_COURSES)
    setErrorMessage(null)
    setHttpStatus(200)
    showToast('Đã tải danh sách môn học mẫu (Chế độ xem trước)')
  }

  // Danh sách môn học sau khi lọc tìm kiếm
  const filteredCourses = useMemo(() => {
    return courses.filter(item => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        item.courseName.toLowerCase().includes(q) ||
        item.courseCode.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      )
    })
  }, [courses, search])

  // Xử lý thêm môn học mới - Gọi API POST /api/courses
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!newCourse.courseCode.trim() || !newCourse.courseName.trim()) {
      setFormError('Vui lòng điền đầy đủ mã môn học và tên môn học.')
      return
    }

    const token = localStorage.getItem('accessToken')

    // Chế độ demo hoặc chưa có token
    if (isDemoMode || !token) {
      const created: ApiCourseItem = {
        id: `11111111-1111-1111-1111-${Date.now().toString().slice(-12)}`,
        courseCode: newCourse.courseCode.trim().toUpperCase(),
        courseName: newCourse.courseName.trim(),
        credits: Number(newCourse.credits) || 3,
        description: newCourse.description.trim() || 'Môn học trong chương trình đào tạo.'
      }

      setCourses(prev => [created, ...prev])
      setIsModalOpen(false)
      showToast(`Đã thêm môn học [${created.courseCode}] ${created.courseName} thành công! (Dữ liệu thử nghiệm)`)
      setNewCourse({
        courseCode: '',
        courseName: '',
        credits: 3,
        description: ''
      })
      return
    }

    setIsSubmitting(true)

    try {
      const cleanBase = baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBase}/api/courses`

      const payload = {
        courseCode: newCourse.courseCode.trim().toUpperCase(),
        courseName: newCourse.courseName.trim(),
        credits: Number(newCourse.credits) || 3,
        description: newCourse.description.trim() || 'Programming fundamentals'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      // 409 Conflict: Mã môn học đã tồn tại
      if (response.status === 409) {
        let errDetail = 'Mã môn học đã tồn tại trong hệ thống (409 Conflict).'
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setFormError(errDetail)
        return
      }

      // 400 Bad Request
      if (response.status === 400) {
        let errDetail = 'Dữ liệu không hợp lệ (400 Bad Request).'
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
        setFormError('Phiên làm việc đã hết hạn hoặc không có quyền truy cập (401 Unauthorized).')
        return
      }

      // 403 Forbidden
      if (response.status === 403) {
        setFormError('Tài khoản không có quyền tạo môn học (403 Forbidden).')
        return
      }

      if (!response.ok) {
        let errDetail = `Lỗi yêu cầu HTTP ${response.status} (${response.statusText})`
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setFormError(errDetail)
        return
      }

      // 201 Created hoặc 200 OK
      const resData: CreateCourseResponse = await response.json()

      if (resData.success && resData.data) {
        setCourses(prev => [resData.data!, ...prev])
        setIsModalOpen(false)
        showToast(`Đã tạo môn học [${resData.data.courseCode}] ${resData.data.courseName} thành công!`)
        setNewCourse({
          courseCode: '',
          courseName: '',
          credits: 3,
          description: ''
        })
      } else {
        setFormError(resData.message || 'Không thể tạo môn học.')
      }
    } catch (err: unknown) {
      console.error('Lỗi khi gọi API POST /api/courses:', err)
      setFormError(`Không thể kết nối đến máy chủ API (${baseUrl}). Vui lòng kiểm tra backend hoặc thử lại.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text)
    showToast(`Đã sao chép ${label}`)
  }

  // Thống kê nhanh
  const totalCourses = courses.length
  const withDescCount = courses.filter(c => !!c.description && c.description.trim().length > 0).length

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              Danh Mục Môn Học Đào Tạo
            </h1>
            {isDemoMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                Dữ liệu mẫu (Demo)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Quản lý danh mục các môn học đào tạo, số tín chỉ và thiết lập thành phần điểm đánh giá
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchCourses(limit)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>

          <button
            onClick={() => {
              setFormError(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm môn học mới</span>
          </button>
        </div>
      </div>

      {/* Thông báo lỗi / Auth Alert nếu có */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-800 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            {httpStatus === 401 ? (
              <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : httpStatus === 403 ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-rose-900">
                {httpStatus === 401
                  ? 'Chưa đăng nhập / Phiên làm việc hết hạn (401)'
                  : httpStatus === 403
                  ? 'Không đủ quyền hạn (403 Forbidden)'
                  : 'Lỗi khi gọi API môn học'}
              </p>
              <p className="text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => fetchCourses(limit)}
              className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              Thử lại
            </button>
            {!isDemoMode && (
              <button
                onClick={handleEnableDemoMode}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-800 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                Xem dữ liệu mẫu
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng môn học</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">
              {isLoading ? '...' : totalCourses}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đã lưu trong khung đào tạo</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang mở đào tạo</span>
            <span className="text-2xl font-black text-blue-600 leading-tight">
              {isLoading ? '...' : totalCourses}
            </span>
            <span className="text-[10px] text-blue-600 font-medium block mt-1">Sẵn sàng phân công lớp</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Có mô tả chi tiết</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">
              {isLoading ? '...' : withDescCount}
            </span>
            <span className="text-[10px] text-purple-600 font-medium block mt-1">Đầy đủ chuẩn đầu ra</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Giới hạn tải trang</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">
              {limit} môn
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Tham số limit trên API</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã môn, tên môn học, mô tả..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">Giới hạn:</span>
            <select
              value={limit}
              onChange={e => {
                const val = Number(e.target.value)
                setLimit(val)
                fetchCourses(val)
              }}
              className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="10">10 môn</option>
              <option value="20">20 môn</option>
              <option value="50">50 môn</option>
              <option value="100">100 môn</option>
            </select>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng bảng chi tiết"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng lưới thẻ"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Đang tải danh sách môn học...</p>
          <p className="text-[11px] text-slate-400">Đang đồng bộ dữ liệu đào tạo từ máy chủ</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy môn học nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Không có kết quả phù hợp với bộ lọc tìm kiếm.' : 'Hệ thống chưa có danh mục môn học nào hoặc chưa kết nối được dữ liệu.'}
          </p>
          {!isDemoMode && courses.length === 0 && (
            <button
              onClick={handleEnableDemoMode}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Bật chế độ dữ liệu mẫu</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Mã môn</th>
                  <th className="py-3.5 px-4 font-bold">Tên môn học</th>
                  <th className="py-3.5 px-4 font-bold">Mô tả học phần</th>
                  <th className="py-3.5 px-4 font-bold text-slate-400">Mã định danh</th>
                  <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono text-[11px] font-bold">
                        {course.courseCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-xs">{course.courseName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <p className="truncate text-[11px] text-slate-500" title={course.description}>
                        {course.description || 'Chưa cập nhật mô tả'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      <span className="truncate max-w-[130px] inline-block" title={course.id}>
                        {course.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenGradeComponentModal(course)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Tạo điểm thành phần cho lớp học phần"
                        >
                          <Percent className="w-3.5 h-3.5" />
                          <span>Tạo điểm thành phần</span>
                        </button>
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-emerald-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                      {course.courseCode}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mt-3 group-hover:text-emerald-700 transition-colors">
                  {course.courseName}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {course.description || 'Chưa cập nhật mô tả chi tiết cho học phần này.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    handleOpenGradeComponentModal(course)
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Tạo điểm thành phần"
                >
                  <Percent className="w-3 h-3" />
                  <span>Điểm thành phần</span>
                </button>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>
            Hiển thị <b>{filteredCourses.length}</b> / <b>{courses.length}</b> môn học
          </span>
          <span className="text-slate-300 mx-2">•</span>
          <span>
            API limit: <b>{limit}</b> môn
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Dữ liệu môn học đồng bộ trực tiếp từ hệ thống Đào tạo</span>
        </div>
      </div>

      {/* Modal Chi tiết môn học */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Hồ sơ môn học</h3>
                  <p className="text-[11px] text-slate-400">Chi tiết thông tin môn học từ API</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                    {selectedCourse.courseCode}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-base mt-2">{selectedCourse.courseName}</h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Mô tả học phần:</span>
                  <p className="text-slate-800 leading-relaxed font-normal">
                    {selectedCourse.description || 'Không có mô tả chi tiết.'}
                  </p>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Course ID (GUID):</span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-700 break-all">
                    <span>{selectedCourse.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedCourse.id, 'Course ID')}
                      className="text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0 ml-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Mã môn học:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                    <span>{selectedCourse.courseCode}</span>
                    <button
                      onClick={() => copyToClipboard(selectedCourse.courseCode, 'mã môn học')}
                      className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCourse
                    setSelectedCourse(null)
                    handleOpenGradeComponentModal(c)
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Tạo điểm thành phần</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm môn học */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Thêm môn học mới</h3>
                  <p className="text-[11px] text-slate-400">Nhập thông tin môn học đào tạo mới vào hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setFormError(null)
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-rose-900">Không thể tạo môn học</p>
                    <p className="text-rose-700 mt-0.5 leading-relaxed">{formError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã môn học *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CS101"
                    value={newCourse.courseCode}
                    onChange={e => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên môn học *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Introduction to Programming"
                    value={newCourse.courseName}
                    onChange={e => setNewCourse({ ...newCourse, courseName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Mô tả học phần</label>
                <textarea
                  rows={3}
                  placeholder="VD: Programming fundamentals"
                  value={newCourse.description}
                  onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsModalOpen(false)
                    setFormError(null)
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Đang tạo...' : 'Lưu môn học'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tạo Điểm Thành Phần Cho Lớp Học Phần (POST /api/course-sections/{sectionId}/grade-components) */}
      {gradeComponentCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Tạo Điểm Thành Phần</h3>
                  <p className="text-[11px] text-slate-500">
                    Môn: <strong className="text-slate-700">{gradeComponentCourse.courseName}</strong> ({gradeComponentCourse.courseCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGradeComponentCourse(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form & Content */}
            <form onSubmit={handleSubmitGradeComponent} className="p-6 space-y-4 text-xs">
              {componentError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{componentError}</div>
                </div>
              )}

              {/* Chọn lớp học phần */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">
                    Lớp học phần áp dụng <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomSectionId(!useCustomSectionId)}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    {useCustomSectionId ? 'Chọn từ danh sách' : 'Nhập mã ID thủ công'}
                  </button>
                </div>

                {isLoadingSections ? (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Đang tải danh sách lớp học phần của môn này...</span>
                  </div>
                ) : useCustomSectionId ? (
                  <input
                    type="text"
                    required
                    placeholder="Dán mã ID lớp học phần (GUID)..."
                    value={customSectionId}
                    onChange={e => setCustomSectionId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                ) : courseSections.length > 0 ? (
                  <select
                    value={selectedSectionId}
                    onChange={e => setSelectedSectionId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="">-- Chọn lớp học phần --</option>
                    {courseSections.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.sectionCode} - {s.courseName || gradeComponentCourse.courseName} ({s.semesterName || 'Học kỳ'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] space-y-1">
                    <p className="font-bold">Môn học này chưa có lớp học phần nào được mở.</p>
                    <p className="text-amber-700">
                      Bạn có thể nhập trực tiếp ID lớp học phần bằng cách nhấn "Nhập mã ID thủ công" ở trên, hoặc mở lớp học phần trước trong mục "Lớp học phần".
                    </p>
                  </div>
                )}
              </div>

              {/* Tên thành phần điểm */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên thành phần điểm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chuyên cần, Giữa kỳ, Cuối kỳ, Thực hành..."
                  value={componentName}
                  onChange={e => setComponentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />

                {/* Quick preset chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold">Gợi ý nhanh:</span>
                  {[
                    { name: 'Chuyên cần', weight: 10 },
                    { name: 'Giữa kỳ', weight: 30 },
                    { name: 'Thực hành', weight: 20 },
                    { name: 'Cuối kỳ', weight: 40 },
                    { name: 'Đồ án', weight: 50 }
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setComponentName(preset.name)
                        setComponentWeight(preset.weight)
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[10px] font-semibold text-slate-600 border border-slate-200 cursor-pointer transition-colors"
                    >
                      {preset.name} ({preset.weight}%)
                    </button>
                  ))}
                </div>
              </div>

              {/* Trọng số & Thang điểm tối đa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Trọng số (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={componentWeight}
                      onChange={e => setComponentWeight(e.target.value)}
                      className="w-full px-3 py-2 pr-7 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-bold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Thang điểm tối đa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={componentMaxScore}
                    onChange={e => setComponentMaxScore(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* Danh sách các loại điểm đã có của lớp học phần (GET /api/course-sections/{sectionId}/grade-components) */}
              <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-blue-600" />
                    <span>Các loại điểm hiện có của lớp:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {isLoadingComponents ? (
                      <span className="text-slate-400 font-normal flex items-center gap-1 text-[10px]">
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> Đang tải...
                      </span>
                    ) : (
                      (() => {
                        const totalW = existingComponents.reduce((sum, c) => sum + (c.weight || 0), 0)
                        return (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              totalW === 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : totalW > 100
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Tổng trọng số: {totalW}% {totalW === 100 ? '✓' : totalW < 100 ? `(Thiếu ${100 - totalW}%)` : `(Thừa ${totalW - 100}%)`}
                          </span>
                        )
                      })()
                    )}
                  </div>
                </div>

                {isLoadingComponents ? (
                  <div className="py-4 text-center text-slate-400 text-[11px]">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-blue-600" />
                    <span>Đang kết nối GET /api/course-sections/{useCustomSectionId ? customSectionId.trim() : selectedSectionId}/grade-components...</span>
                  </div>
                ) : existingComponents.length === 0 ? (
                  <div className="py-3 text-center text-slate-400 text-[11px]">
                    Lớp học phần này chưa được cấu hình loại điểm nào. Hãy tạo thành phần điểm đầu tiên bên dưới.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {existingComponents.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-bold text-slate-800">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            {c.weight}%
                          </span>
                          <span className="text-slate-500 font-medium">Thang {c.maxScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmittingComponent}
                  onClick={() => setGradeComponentCourse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComponent}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingComponent && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingComponent ? 'Đang tạo...' : 'Tạo điểm thành phần'}</span>
                </button>
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
