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
  User,
  Percent,
  Award,
  FileSpreadsheet,
  Download,
  Save,
  Edit3,
  UserPlus
} from 'lucide-react'
import { AddStudentToSectionModal } from './AddStudentToSectionModal'
import type {
  ApiCourseItem,
  ApiSemesterItem,
  ApiLecturerItem,
  ApiCourseSectionItem,
  ApiCourseSectionListResponse,
  CreateCourseSectionRequest,
  CreateCourseSectionResponse,
  ApiSectionStudentItem,
  ApiSectionStudentListResponse,
  ApiGradeComponentItem,
  ApiGradeComponentListResponse,
  CreateGradeComponentRequest,
  CreateGradeComponentResponse,
  CourseSectionGradesData,
  CourseSectionGradesResponse,
  UpdateGradeItemRequest,
  BatchUpdateSectionGradesRequest,
  BatchUpdateSectionGradesResponse
} from '../../types'
import {
  API_BASE_URL,
  getCourseSectionStudentsUrl,
  getGradeComponentsUrl,
  getCourseSectionGradesUrl,
  getUpdateCourseSectionGradesUrl
} from '../../config'

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
  const [baseUrl] = useState<string>(API_BASE_URL || 'https://localhost:7249')

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

  // Modal thêm sinh viên vào lớp học phần (POST /api/course-sections/{sectionId}/students)
  const [enrollingSection, setEnrollingSection] = useState<ApiCourseSectionItem | null>(null)

  // Modal danh sách loại điểm của một học phần (GET /api/course-sections/{sectionId}/grade-components)
  const [viewingGradeComponentsSection, setViewingGradeComponentsSection] = useState<ApiCourseSectionItem | null>(null)
  const [gradeComponents, setGradeComponents] = useState<ApiGradeComponentItem[]>([])
  const [isLoadingGradeComponents, setIsLoadingGradeComponents] = useState<boolean>(false)
  const [gradeComponentsError, setGradeComponentsError] = useState<string | null>(null)

  // Form tạo loại điểm thành phần mới (POST /api/course-sections/{sectionId}/grade-components)
  const [newCompName, setNewCompName] = useState('Giữa kỳ')
  const [newCompWeight, setNewCompWeight] = useState<number | string>(30)
  const [newCompMaxScore, setNewCompMaxScore] = useState<number | string>(10)
  const [isCreatingComp, setIsCreatingComp] = useState<boolean>(false)
  const [createCompError, setCreateCompError] = useState<string | null>(null)

  // Modal xem bảng điểm lớp học phần (GET /api/course-sections/{sectionId}/grades)
  const [viewingGradesSection, setViewingGradesSection] = useState<ApiCourseSectionItem | null>(null)
  const [gradesData, setGradesData] = useState<CourseSectionGradesData | null>(null)
  const [gradesPage, setGradesPage] = useState<number>(1)
  const [gradesPageSize, setGradesPageSize] = useState<number>(20)
  const [isLoadingGrades, setIsLoadingGrades] = useState<boolean>(false)
  const [gradesError, setGradesError] = useState<string | null>(null)
  const [gradesSearch, setGradesSearch] = useState<string>('')

  // Quản lý nhập/chỉnh sửa điểm trực tiếp bằng PUT /api/course-sections/{sectionId}/grades
  const [isAdminGradesEditing, setIsAdminGradesEditing] = useState<boolean>(false)
  const [isSavingAdminGrades, setIsSavingAdminGrades] = useState<boolean>(false)
  const [adminGradesHasChanges, setAdminGradesHasChanges] = useState<boolean>(false)

  // Gọi API GET /api/course-sections/{sectionId}/grade-components
  const fetchSectionGradeComponents = useCallback(async (sectionId: string) => {
    setIsLoadingGradeComponents(true)
    setGradeComponentsError(null)

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setGradeComponentsError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      setIsLoadingGradeComponents(false)
      return
    }

    try {
      const url = getGradeComponentsUrl(sectionId)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })

      if (response.ok) {
        const json: ApiGradeComponentListResponse = await response.json()
        if (json.success && Array.isArray(json.data)) {
          setGradeComponents(json.data)
        } else {
          setGradeComponents([])
        }
      } else {
        const errJson = await response.json().catch(() => null)
        setGradeComponentsError(errJson?.message || 'Không thể tải danh sách loại điểm của học phần này.')
        setGradeComponents([])
      }
    } catch {
      setGradeComponentsError('Lỗi kết nối máy chủ khi tải danh sách loại điểm.')
      setGradeComponents([])
    } finally {
      setIsLoadingGradeComponents(false)
    }
  }, [])

  const handleOpenGradeComponentsModal = (sec: ApiCourseSectionItem) => {
    setViewingGradeComponentsSection(sec)
    setCreateCompError(null)
    setNewCompName('Giữa kỳ')
    setNewCompWeight(30)
    setNewCompMaxScore(10)
    fetchSectionGradeComponents(sec.id)
  }

  const handleCreateGradeComponent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!viewingGradeComponentsSection) return
    setCreateCompError(null)

    if (!newCompName.trim()) {
      setCreateCompError('Vui lòng nhập tên loại điểm (VD: Giữa kỳ, Cuối kỳ...).')
      return
    }

    const weightNum = Number(newCompWeight)
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 100) {
      setCreateCompError('Trọng số điểm phải từ 1% đến 100%.')
      return
    }

    const maxScoreNum = Number(newCompMaxScore)
    if (isNaN(maxScoreNum) || maxScoreNum <= 0) {
      setCreateCompError('Điểm tối đa phải lớn hơn 0.')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setCreateCompError('Phiên đăng nhập đã hết hạn.')
      return
    }

    setIsCreatingComp(true)
    try {
      const payload: CreateGradeComponentRequest = {
        name: newCompName.trim(),
        weight: weightNum,
        maxScore: maxScoreNum
      }

      const response = await fetch(getGradeComponentsUrl(viewingGradeComponentsSection.id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const json: CreateGradeComponentResponse = await response.json().catch(() => ({
        success: false,
        message: 'Lỗi không xác định từ máy chủ.'
      }))

      if (response.status === 201 || (response.ok && json.success)) {
        showToast(`Đã thêm loại điểm "${payload.name}" (${payload.weight}%) thành công!`)
        if (payload.name === 'Giữa kỳ') {
          setNewCompName('Cuối kỳ')
          setNewCompWeight(50)
        } else if (payload.name === 'Chuyên cần') {
          setNewCompName('Giữa kỳ')
          setNewCompWeight(30)
        } else {
          setNewCompName('')
          setNewCompWeight(20)
        }
        await fetchSectionGradeComponents(viewingGradeComponentsSection.id)
      } else {
        setCreateCompError(json.message || 'Không thể tạo loại điểm cho học phần này.')
      }
    } catch {
      setCreateCompError('Lỗi kết nối máy chủ.')
    } finally {
      setIsCreatingComp(false)
    }
  }

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

  // Gọi API GET /api/course-sections/{sectionId}/grades?page={page}&pageSize={pageSize}
  const fetchSectionGrades = useCallback(
    async (sectionId: string, targetPage = 1, targetPageSize = 20) => {
      setIsLoadingGrades(true)
      setGradesError(null)
      const token = localStorage.getItem('accessToken')

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
        } else {
          // Xử lý các lỗi thường gặp theo đặc tả API:
          // 400: Tham số không hợp lệ
          // 401: Thiếu hoặc sai token
          // 403: Không có quyền hoặc giảng viên không được phân công
          // 404: Lớp học phần không tồn tại
          const errJson = await response.json().catch(() => null)
          let errorMsg = ''
          if (response.status === 400) {
            errorMsg = errJson?.message || 'Lỗi 400 (Bad Request): Tham số truy vấn không hợp lệ.'
          } else if (response.status === 401) {
            errorMsg = errJson?.message || 'Lỗi 401 (Unauthorized): Thiếu hoặc sai Access Token.'
          } else if (response.status === 403) {
            errorMsg = errJson?.message || 'Lỗi 403 (Forbidden): Bạn không có quyền truy cập bảng điểm lớp này.'
          } else if (response.status === 404) {
            errorMsg = errJson?.message || `Lỗi 404 (Not Found): Lớp học phần với ID "${sectionId}" không tồn tại.`
          } else {
            errorMsg = errJson?.message || `Lỗi máy chủ (${response.status}): Không thể tải bảng điểm.`
          }
          setGradesError(errorMsg)
        }

        setGradesData({
          courseSectionId: sectionId,
          components: [],
          students: [],
          page: targetPage,
          pageSize: targetPageSize,
          totalCount: 0
        })
      } catch {
        setGradesError('Không thể kết nối đến máy chủ để tải bảng điểm. Vui lòng kiểm tra kết nối mạng.')
        setGradesData({
          courseSectionId: sectionId,
          components: [],
          students: [],
          page: targetPage,
          pageSize: targetPageSize,
          totalCount: 0
        })
      } finally {
        setIsLoadingGrades(false)
      }
    },
    []
  )

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

  // Theo đặc tả API: Cột điểm sắp theo name
  const sortedAdminComponents = useMemo(() => {
    return [...(gradesData?.components || [])].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'vi')
    )
  }, [gradesData?.components])

  // Lọc và sắp xếp sinh viên theo studentCode theo đặc tả API
  const sortedAdminGradesStudents = useMemo(() => {
    if (!gradesData?.students) return []
    const list = !gradesSearch.trim()
      ? gradesData.students
      : gradesData.students.filter(
          st =>
            (st.studentCode && st.studentCode.toLowerCase().includes(gradesSearch.toLowerCase().trim())) ||
            (st.fullName && st.fullName.toLowerCase().includes(gradesSearch.toLowerCase().trim()))
        )
    return [...list].sort((a, b) => (a.studentCode || '').localeCompare(b.studentCode || ''))
  }, [gradesData?.students, gradesSearch])

  // Thống kê điểm học phần
  const gradesStats = useMemo(() => {
    if (!gradesData || !gradesData.students.length) {
      return { totalStudents: 0, avgScore: '0.00', passRate: 0, passedCount: 0 }
    }
    const comps = sortedAdminComponents
    let totalScoreSum = 0
    let gradedCount = 0
    let passedCount = 0

    gradesData.students.forEach(st => {
      let stScore = 0
      let hasScore = false
      const stGrades = st.grades || []
      comps.forEach(c => {
        const g = stGrades.find(
          item => (item.gradeComponentId || '').toLowerCase() === (c.id || '').toLowerCase()
        )
        if (g && typeof g.score === 'number' && g.score !== null) {
          hasScore = true
          stScore += (g.score / (c.maxScore || 10)) * 10 * (c.weight / 100)
        }
      })
      if (hasScore) {
        gradedCount++
        totalScoreSum += stScore
        if (stScore >= 5.0) {
          passedCount++
        }
      }
    })

    const avg = gradedCount > 0 ? (totalScoreSum / gradedCount).toFixed(2) : '0.00'
    const passRate = gradedCount > 0 ? Math.round((passedCount / gradedCount) * 100) : 0

    return {
      totalStudents: gradesData.totalCount || gradesData.students.length,
      avgScore: avg,
      passRate,
      passedCount
    }
  }, [gradesData, sortedAdminComponents])

  // Xử lý thay đổi điểm số của sinh viên khi Admin nhập/sửa điểm
  const handleAdminScoreChange = (enrollmentId: string, gradeComponentId: string, val: string) => {
    let numVal: number | null = parseFloat(val)
    if (isNaN(numVal) || val === '') {
      numVal = null
    } else {
      if (numVal < 0) numVal = 0
      if (numVal > 10) numVal = 10
    }

    const now = new Date().toISOString()
    setGradesData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        students: prev.students.map(st => {
          if (st.enrollmentId !== enrollmentId) return st
          const curGrades = st.grades || []
          const exists = curGrades.find(
            g => (g.gradeComponentId || '').toLowerCase() === (gradeComponentId || '').toLowerCase()
          )
          let newGrades = [...curGrades]
          if (exists) {
            newGrades = newGrades.map(g => {
              if ((g.gradeComponentId || '').toLowerCase() === (gradeComponentId || '').toLowerCase()) {
                return {
                  ...g,
                  score: numVal,
                  gradeId: numVal === null ? null : (g.gradeId || `grade-${Date.now()}`),
                  gradedAtUtc: numVal === null ? null : (g.gradedAtUtc || now),
                  updatedAtUtc: numVal === null ? null : now
                }
              }
              return g
            })
          } else {
            newGrades.push({
              gradeComponentId,
              gradeId: numVal === null ? null : `grade-${Date.now()}`,
              score: numVal,
              gradedAtUtc: numVal === null ? null : now,
              updatedAtUtc: null
            })
          }
          return { ...st, grades: newGrades }
        })
      }
    })
    setAdminGradesHasChanges(true)
  }

  // Gọi API PUT /api/course-sections/{sectionId}/grades để nhập/cập nhật điểm nhiều sinh viên trong một request
  const handleSaveAdminGrades = async () => {
    if (!gradesData || !viewingGradesSection) return

    const items: UpdateGradeItemRequest[] = []
    gradesData.students.forEach(st => {
      ;(st.grades || []).forEach(g => {
        if (typeof g.score === 'number' && !isNaN(g.score)) {
          items.push({
            enrollmentId: st.enrollmentId,
            gradeComponentId: g.gradeComponentId,
            score: g.score
          })
        }
      })
    })

    setIsSavingAdminGrades(true)
    const token = localStorage.getItem('accessToken')
    const url = getUpdateCourseSectionGradesUrl(viewingGradesSection.id)
    const payload: BatchUpdateSectionGradesRequest = { items }

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setAdminGradesHasChanges(false)
        showToast(`Đã lưu và cập nhật thành công ${items.length} đầu điểm qua PUT API!`)
      } else {
        const err: BatchUpdateSectionGradesResponse | null = await res.json().catch(() => null)
        showToast(err?.message || `Lỗi ${res.status}: Không thể lưu bảng điểm qua API PUT.`)
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ để lưu bảng điểm qua API PUT.')
    } finally {
      setIsSavingAdminGrades(false)
    }
  }

  // Xuất file CSV bảng điểm
  const handleExportGradesCsv = () => {
    if (!gradesData || !viewingGradesSection) return
    const comps = gradesData.components || []
    const headers = [
      'STT',
      'Mã SV',
      'Họ và tên',
      'Trạng thái',
      ...comps.map(c => `"${c.name} (${c.weight}%)"`),
      'Tổng kết (Hệ 10)',
      'Điểm chữ',
      'Kết quả'
    ]

    const rows = gradesData.students.map((st, idx) => {
      let total = 0
      const stGrades = st.grades || []
      const compScores = comps.map(c => {
        const g = stGrades.find(
          item => (item.gradeComponentId || '').toLowerCase() === (c.id || '').toLowerCase()
        )
        if (g && typeof g.score === 'number' && g.score !== null) {
          total += (g.score / (c.maxScore || 10)) * 10 * (c.weight / 100)
          return g.score
        }
        return ''
      })
      const totalRounded = Number(total.toFixed(1))
      let letter = 'F'
      if (totalRounded >= 9.0) letter = 'A+'
      else if (totalRounded >= 8.5) letter = 'A'
      else if (totalRounded >= 8.0) letter = 'B+'
      else if (totalRounded >= 7.0) letter = 'B'
      else if (totalRounded >= 6.5) letter = 'C+'
      else if (totalRounded >= 5.5) letter = 'C'
      else if (totalRounded >= 5.0) letter = 'D+'
      else if (totalRounded >= 4.0) letter = 'D'

      const status = totalRounded >= 5.0 ? 'Đạt' : totalRounded >= 4.0 ? 'Cảnh báo' : 'Không đạt'

      return [
        idx + 1,
        st.studentCode,
        `"${st.fullName}"`,
        st.enrollmentStatus,
        ...compScores,
        totalRounded,
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
    showToast(`Đã xuất bảng điểm lớp ${viewingGradesSection.sectionCode} thành công!`)
  }

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
                            onClick={() => handleOpenGradeComponentsModal(sec)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Xem danh sách các loại điểm của học phần"
                          >
                            <Percent className="w-3.5 h-3.5" />
                            <span>Loại điểm</span>
                          </button>
                          <button
                            onClick={() => handleOpenGradesModal(sec)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Xem bảng điểm học phần (GET /api/course-sections/{id}/grades)"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Bảng điểm</span>
                          </button>
                          <button
                            onClick={() => handleOpenStudentsModal(sec)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Xem danh sách sinh viên lớp học phần"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Danh sách SV</span>
                          </button>
                          <button
                            onClick={() => setEnrollingSection(sec)}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-blue-200/60"
                            title="Thêm sinh viên vào lớp học phần này (POST /api/course-sections/{id}/students)"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Thêm SV</span>
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
              <div className="flex items-center gap-2">
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
                  type="button"
                  onClick={() => {
                    const sec = selectedSection
                    setSelectedSection(null)
                    handleOpenGradesModal(sec)
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Xem bảng điểm</span>
                </button>
              </div>

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
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                    <span>Danh Sách Sinh Viên Lớp:</span>
                    <span className="text-blue-600 font-mono">{viewingStudentsSection.sectionCode}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                      GET /api/course-sections/students
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                      POST API
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                    <span>{viewingStudentsSection.courseName || viewingStudentsSection.courseCode} • {viewingStudentsSection.semesterName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-slate-700">
                      Sĩ số: {studentsTotalCount} / {viewingStudentsSection.capacity} SV
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        viewingStudentsSection.status === 'Open'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {viewingStudentsSection.status === 'Open' ? 'Đang mở đăng ký' : viewingStudentsSection.status || 'Mở'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingStudentsSection(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Toolbar: Search, Size, Refresh & Add Student Button */}
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

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
                <button
                  type="button"
                  onClick={() => setEnrollingSection(viewingStudentsSection)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Thêm sinh viên mới vào lớp học phần này (POST /api/course-sections/{sectionId}/students)"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm sinh viên vào lớp</span>
                </button>

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

      {/* Modal Xem & Quản Lý Các Loại Điểm Của Học Phần (GET & POST /api/course-sections/{sectionId}/grade-components) */}
      {viewingGradeComponentsSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Các Loại Điểm Của Học Phần
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-800">
                      Lớp: {viewingGradeComponentsSection.sectionCode}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">
                      {viewingGradeComponentsSection.courseName || 'Môn học'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingGradeComponentsSection(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* API Info Badge */}
              <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-xl font-mono text-[11px] text-slate-600">
                <span>
                  <strong className="text-purple-600">GET</strong> /api/course-sections/
                  <span className="text-slate-800 font-bold">{viewingGradeComponentsSection.id}</span>
                  /grade-components
                </span>
                <button
                  onClick={() => fetchSectionGradeComponents(viewingGradeComponentsSection.id)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                  title="Tải lại danh sách"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingGradeComponents ? 'animate-spin text-purple-600' : ''}`}
                  />
                </button>
              </div>

              {/* Total Weight Summary */}
              {(() => {
                const totalW = gradeComponents.reduce((sum, c) => sum + (c.weight || 0), 0)
                return (
                  <div className="p-3.5 rounded-2xl border bg-slate-50/60 border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">Cơ cấu trọng số học phần:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          totalW === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : totalW > 100
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {totalW}% / 100% {totalW === 100 ? '✓ Hoàn chỉnh' : totalW < 100 ? `(Thiếu ${100 - totalW}%)` : `(Vượt ${totalW - 100}%)`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                      {gradeComponents.map((c, i) => {
                        const colors = [
                          'bg-blue-500',
                          'bg-purple-500',
                          'bg-emerald-500',
                          'bg-amber-500',
                          'bg-cyan-500'
                        ]
                        return (
                          <div
                            key={c.id || i}
                            style={{ width: `${Math.min(100, c.weight)}%` }}
                            className={`${colors[i % colors.length]} h-full transition-all`}
                            title={`${c.name}: ${c.weight}%`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Error Alert */}
              {gradeComponentsError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{gradeComponentsError}</span>
                </div>
              )}

              {/* Table / List of Existing Grade Components */}
              <div>
                <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                  Danh sách loại điểm ({gradeComponents.length}):
                </span>

                {isLoadingGradeComponents ? (
                  <div className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
                    <span>Đang tải danh sách các loại điểm...</span>
                  </div>
                ) : gradeComponents.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-400">
                    <Percent className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">Lớp học phần này chưa có loại điểm nào</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sử dụng form bên dưới để thiết lập các loại điểm (Giữa kỳ, Cuối kỳ...)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {gradeComponents.map((c, i) => (
                      <div
                        key={c.id || i}
                        className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-purple-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-extrabold flex items-center justify-center text-xs">
                            {i + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {c.id}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100">
                            {c.weight}%
                          </span>
                          <span className="text-slate-500 font-medium text-[11px]">
                            Thang {c.maxScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inline Form Thêm Loại Điểm Mới (POST) */}
              <div className="pt-3 border-t border-slate-100">
                <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                  Thêm loại điểm mới cho lớp:
                </span>

                <form onSubmit={handleCreateGradeComponent} className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                  {createCompError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {createCompError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-1">
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        Tên loại điểm *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Giữa kỳ..."
                        value={newCompName}
                        onChange={e => setNewCompName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        Trọng số (%) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={newCompWeight}
                        onChange={e => setNewCompWeight(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                        Điểm tối đa *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={newCompMaxScore}
                        onChange={e => setNewCompMaxScore(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Preset Quick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold">Gợi ý:</span>
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
                          setNewCompName(preset.name)
                          setNewCompWeight(preset.weight)
                        }}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-purple-100 hover:text-purple-700 text-[10px] font-semibold text-slate-600 border border-slate-200 cursor-pointer transition-colors"
                      >
                        {preset.name} ({preset.weight}%)
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isCreatingComp}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isCreatingComp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isCreatingComp ? 'Đang thêm...' : 'Thêm loại điểm'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">
                Tổng cộng: <strong className="text-slate-700">{gradeComponents.length}</strong> loại điểm
              </span>
              <button
                type="button"
                onClick={() => setViewingGradeComponentsSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Bảng Điểm Lớp Học Phần (GET /api/course-sections/{sectionId}/grades) */}
      {viewingGradesSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                    <span>Bảng Điểm Lớp Học Phần:</span>
                    <span className="text-emerald-600 font-mono">{viewingGradesSection.sectionCode}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {viewingGradesSection.courseName || viewingGradesSection.courseCode} • {viewingGradesSection.semesterName || 'Học kỳ'} • GV: {viewingGradesSection.lecturerName || 'Chưa phân công'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingGradesSection(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* API Info & Action Buttons */}
            <div className="px-6 py-3 bg-emerald-50/60 border-b border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-[10px]">
                  GET
                </span>
                <span className="font-mono text-emerald-950 font-medium text-[11px]">
                  /api/course-sections/
                  <span className="text-slate-800 font-bold">{viewingGradesSection.id}</span>
                  /grades
                </span>

                <span className="text-slate-400">•</span>

                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-[10px]">
                  PUT
                </span>
                <span className="font-mono text-blue-950 font-medium text-[11px]">
                  /api/course-sections/{viewingGradesSection.id}/grades
                </span>

                <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                  Bearer &lt;admin / GV phụ trách&gt;
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">

                <button
                  type="button"
                  onClick={() => setIsAdminGradesEditing(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isAdminGradesEditing
                      ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Bật/Tắt chế độ nhập và sửa điểm trực tiếp cho sinh viên"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isAdminGradesEditing ? 'Đang sửa điểm' : 'Nhập điểm'}</span>
                </button>

                {isAdminGradesEditing && (
                  <button
                    type="button"
                    onClick={handleSaveAdminGrades}
                    disabled={!adminGradesHasChanges || isSavingAdminGrades}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      adminGradesHasChanges && !isSavingAdminGrades
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                    title="Lưu các đầu điểm đã nhập qua API PUT /api/course-sections/{sectionId}/grades"
                  >
                    {isSavingAdminGrades ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu điểm (PUT API)</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fetchSectionGrades(viewingGradesSection.id, gradesPage, gradesPageSize)}
                  disabled={isLoadingGrades}
                  className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-100/60 text-emerald-700 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Tải lại dữ liệu điểm mới nhất"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGrades ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportGradesCsv}
                  disabled={!gradesData || !gradesData.students.length}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Xuất bảng điểm ra file Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="p-6 border-b border-slate-100 bg-white shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Sĩ số sinh viên
                  </span>
                  <div className="text-2xl font-black text-slate-800">
                    {gradesStats.totalStudents}
                  </div>
                  <span className="text-[11px] text-slate-500">Sinh viên chính quy</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block mb-1">
                    Điểm trung bình
                  </span>
                  <div className="text-2xl font-black text-blue-700">
                    {gradesStats.avgScore} <span className="text-xs font-normal text-blue-500">/ 10</span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">Hệ số tích lũy</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                    Tỷ lệ qua môn
                  </span>
                  <div className="text-2xl font-black text-emerald-700">
                    {gradesStats.passRate}%
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {gradesStats.passedCount}/{gradesStats.totalStudents} sinh viên đạt
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                    Cấu trúc điểm ({gradesData?.components.length || 0} cột)
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gradesData?.components && gradesData.components.length > 0 ? (
                      gradesData.components.map(c => (
                        <span
                          key={c.id}
                          className="px-1.5 py-0.5 rounded-md bg-white border border-purple-200 text-purple-700 text-[10px] font-bold"
                        >
                          {c.name}: {c.weight}%
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-purple-500 italic">Chưa tạo loại điểm</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Search & PageSize controls */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã SV hoặc họ tên..."
                    value={gradesSearch}
                    onChange={e => setGradesSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
                  <span>Số dòng:</span>
                  <select
                    value={gradesPageSize}
                    onChange={e => handleGradesPageSizeChange(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10 / trang</option>
                    <option value={20}>20 / trang</option>
                    <option value={50}>50 / trang</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gradebook Table */}
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingGrades ? (
                <div className="py-16 text-center">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Đang tải bảng điểm học phần...</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    GET /api/course-sections/{viewingGradesSection.id}/grades
                  </p>
                </div>
              ) : gradesError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{gradesError}</span>
                </div>
              ) : !gradesData?.students || gradesData.students.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-xs text-slate-600">Chưa có dữ liệu sinh viên hoặc điểm số</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Lớp học phần này chưa có sinh viên đăng ký.</p>
                </div>
              ) : (
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200">
                          <th className="py-3 px-3 font-bold text-center w-12">STT</th>
                          <th className="py-3 px-4 font-bold w-28">Mã SV</th>
                          <th className="py-3 px-4 font-bold min-w-[170px]">Họ và tên</th>
                          <th className="py-3 px-3 font-bold text-center w-28">Trạng thái</th>

                          {/* Dynamic Grade Components Columns (sorted by name) */}
                          {sortedAdminComponents.length > 0 ? (
                            sortedAdminComponents.map(comp => (
                              <th
                                key={comp.id}
                                className="py-3 px-3 font-bold text-center min-w-[105px] border-l border-slate-200/60 bg-emerald-50/20"
                              >
                                <div className="text-slate-800">{comp.name}</div>
                                <div className="text-[10px] text-emerald-700 font-semibold">
                                  {comp.weight}% • Tối đa {comp.maxScore}
                                </div>
                              </th>
                            ))
                          ) : (
                            <th className="py-3 px-3 font-semibold text-center text-slate-400 italic bg-slate-50 border-l border-slate-200">
                              Chưa có cột điểm nào (components: [])
                            </th>
                          )}

                          <th className="py-3 px-3 font-bold text-center w-28 border-l border-slate-200 bg-slate-100/60">
                            <div>Tổng kết</div>
                            <div className="text-[10px] text-slate-500 font-normal">Hệ 10</div>
                          </th>
                          <th className="py-3 px-2 font-bold text-center w-20">Điểm chữ</th>
                          <th className="py-3 px-3 font-bold text-center w-24">Kết quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedAdminGradesStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4 + (sortedAdminComponents.length > 0 ? sortedAdminComponents.length : 1) + 3}
                              className="py-12 px-4 text-center text-slate-400 bg-slate-50/50"
                            >
                              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                              <p className="font-bold text-sm text-slate-700">Lớp học phần chưa có sinh viên</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {gradesSearch.trim()
                                  ? `Không tìm thấy sinh viên khớp với từ khóa "${gradesSearch}".`
                                  : 'Danh sách sinh viên đang rỗng (students: []). Chưa có sinh viên đăng ký.'}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          sortedAdminGradesStudents.map((st, idx) => {
                            const comps = sortedAdminComponents
                            let weightedScore = 0
                            let hasAnyScore = false
                            const totalWeight = comps.reduce((acc, c) => acc + (c.weight || 0), 0)
                            const stGrades = st.grades || []

                            comps.forEach(c => {
                              const g = stGrades.find(
                                item =>
                                  (item.gradeComponentId || '').toLowerCase() ===
                                  (c.id || '').toLowerCase()
                              )
                              if (g && typeof g.score === 'number' && g.score !== null) {
                                hasAnyScore = true
                                weightedScore += (g.score / (c.maxScore || 10)) * 10 * (c.weight / 100)
                              }
                            })

                            const totalFinal = Number(weightedScore.toFixed(1))
                            const normalized = totalWeight > 0 ? Number(((weightedScore / totalWeight) * 10).toFixed(1)) : totalFinal
                            let letter = '-'
                            let resultText = comps.length === 0 ? 'Chưa tạo cột' : totalWeight < 100 ? `Chưa hoàn tất (${totalWeight}%)` : 'Chưa hoàn tất'
                            let resultColor = 'bg-blue-50 text-blue-700 border-blue-200'

                            if (hasAnyScore) {
                              const evalScore = totalWeight === 100 ? totalFinal : normalized
                              if (evalScore >= 9.0) letter = 'A+'
                              else if (evalScore >= 8.5) letter = 'A'
                              else if (evalScore >= 8.0) letter = 'B+'
                              else if (evalScore >= 7.0) letter = 'B'
                              else if (evalScore >= 6.5) letter = 'C+'
                              else if (evalScore >= 5.5) letter = 'C'
                              else if (evalScore >= 5.0) letter = 'D+'
                              else if (evalScore >= 4.0) letter = 'D'
                              else letter = 'F'

                              if (totalWeight === 100) {
                                if (evalScore >= 5.0) {
                                  resultText = 'Đạt'
                                  resultColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                } else if (evalScore >= 4.0) {
                                  resultText = 'Cảnh báo'
                                  resultColor = 'bg-amber-50 text-amber-700 border-amber-200'
                                } else {
                                  resultText = 'Không đạt'
                                  resultColor = 'bg-rose-50 text-rose-700 border-rose-200'
                                }
                              }
                            }

                            return (
                              <tr key={st.enrollmentId || st.studentId} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-3 text-center text-slate-400 font-semibold">
                                  {(gradesPage - 1) * gradesPageSize + idx + 1}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-slate-700">
                                  {st.studentCode}
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-800">
                                  {st.fullName}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                    {st.enrollmentStatus === 'Registered' ? 'Đã đăng ký' : st.enrollmentStatus}
                                  </span>
                                </td>

                                {/* Component Scores */}
                                {comps.length === 0 ? (
                                  <td className="py-3 px-4 text-center text-slate-400 italic border-l border-slate-100 bg-slate-50/30 text-[11px]">
                                    Chưa có cột điểm
                                  </td>
                                ) : (
                                  comps.map(comp => {
                                    const g = stGrades.find(
                                      item =>
                                        (item.gradeComponentId || '').toLowerCase() ===
                                        (comp.id || '').toLowerCase()
                                    )
                                    const score = g?.score
                                    const hasScore = score !== null && score !== undefined && typeof score === 'number'

                                    return (
                                      <td
                                        key={comp.id}
                                        className="py-3 px-3 text-center border-l border-slate-100"
                                      >
                                        {isAdminGradesEditing ? (
                                          <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max={comp.maxScore || 10}
                                            placeholder="Trống"
                                            value={score !== null && score !== undefined ? score : ''}
                                            onChange={e => handleAdminScoreChange(st.enrollmentId, comp.id, e.target.value)}
                                            className="w-16 px-1.5 py-1 text-center font-bold text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                                          />
                                        ) : hasScore ? (
                                          <span
                                            className="inline-block px-2.5 py-1 rounded-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 text-xs"
                                            title={g?.gradedAtUtc ? `Chấm lúc: ${g.gradedAtUtc}` : undefined}
                                          >
                                            {score}
                                          </span>
                                        ) : (
                                          <span
                                            className="inline-block px-2 py-0.5 rounded text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80"
                                            title="Chưa có điểm (score: null, gradeId: null)"
                                          >
                                            Chưa có điểm
                                          </span>
                                        )}
                                      </td>
                                    )
                                  })
                                )}

                              {/* Weighted Total */}
                              <td className="py-3 px-3 text-center font-extrabold border-l border-slate-200 bg-slate-50/50">
                                {hasAnyScore ? (
                                  <div className="inline-flex flex-col items-center">
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                                        (totalWeight === 100 ? totalFinal : normalized) >= 8.0
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : (totalWeight === 100 ? totalFinal : normalized) >= 5.0
                                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                                      }`}
                                    >
                                      {totalWeight === 100 ? totalFinal : normalized}
                                    </span>
                                    {totalWeight < 100 && (
                                      <span className="text-[9px] text-slate-500 font-medium mt-0.5">
                                        Hệ số {totalFinal}/{(totalWeight / 10).toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-300 font-mono italic">-</span>
                                )}
                              </td>

                              {/* Letter Grade */}
                              <td className="py-3 px-2 text-center font-black text-slate-700">
                                {letter}
                              </td>

                              {/* Result Status */}
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${resultColor}`}>
                                  {resultText}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Pagination Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-slate-500 text-xs">
                Hiển thị <strong>{sortedAdminGradesStudents.length}</strong> / <strong>{gradesData?.totalCount || sortedAdminGradesStudents.length}</strong> sinh viên
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGradesPageChange(Math.max(1, gradesPage - 1))}
                  disabled={gradesPage <= 1 || isLoadingGrades}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
                  Trang {gradesPage} / {Math.ceil((gradesData?.totalCount || 1) / gradesPageSize) || 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleGradesPageChange(
                      Math.min(Math.ceil((gradesData?.totalCount || 1) / gradesPageSize) || 1, gradesPage + 1)
                    )
                  }
                  disabled={
                    gradesPage >= (Math.ceil((gradesData?.totalCount || 1) / gradesPageSize) || 1) ||
                    isLoadingGrades
                  }
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Trang tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewingGradesSection(null)}
                  className="ml-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Sinh Viên Vào Lớp Học Phần (POST /api/course-sections/{sectionId}/students) */}
      <AddStudentToSectionModal
        isOpen={!!enrollingSection}
        section={enrollingSection}
        currentEnrolledCount={
          enrollingSection && viewingStudentsSection && enrollingSection.id === viewingStudentsSection.id
            ? studentsTotalCount
            : undefined
        }
        onClose={() => setEnrollingSection(null)}
        onSuccess={result => {
          showToast(
            `Đã ghi danh thành công sinh viên ${result.studentCode} vào lớp ${enrollingSection?.sectionCode}!`
          )
          // Nếu đang mở danh sách sinh viên của chính lớp này, nạp lại dữ liệu ngay lập tức
          if (viewingStudentsSection && enrollingSection && viewingStudentsSection.id === enrollingSection.id) {
            fetchSectionStudents(viewingStudentsSection.id, 1, studentsPageSize)
          }
          // Nạp lại danh sách lớp học phần để cập nhật sĩ số
          fetchCourseSections(page, pageSize)
        }}
        apiBaseUrl={baseUrl}
      />

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
