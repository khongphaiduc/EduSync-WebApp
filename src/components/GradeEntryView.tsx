import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FileSpreadsheet,
  Save,
  Download,
  Lock,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Layers,
  Code2,
  Copy,
  Check,
  X,
  Info,
  Plus,
  Trash2
} from 'lucide-react'
import type {
  StudentGrade,
  ClassItem,
  CourseSectionGradesData,
  CourseSectionGradesResponse,
  SectionStudentGradeItem,
  ApiCourseSectionItem,
  ApiCourseSectionListResponse,
  ApiGradeComponentItem,
  UpdateGradeItemRequest,
  BatchUpdateSectionGradesRequest,
  BatchUpdateSectionGradesResponse
} from '../types'
import {
  getCourseSectionGradesUrl,
  getUpdateCourseSectionGradesUrl,
  getLecturerCourseSectionsUrl
} from '../config'
interface GradeEntryViewProps {
  classes?: ClassItem[]
  gradesData?: Record<string, StudentGrade[]>
  onSaveGrades?: (classCode: string, updatedGrades: StudentGrade[]) => void
  initialSectionId?: string
}

export const GradeEntryView: React.FC<GradeEntryViewProps> = ({
  classes = [],
  onSaveGrades,
  initialSectionId = ''
}) => {
  // Quản lý lớp học phần đang được chọn
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSectionId || (classes[0]?.id || classes[0]?.code || '')
  )
  const [isCustomSection, setIsCustomSection] = useState<boolean>(false)
  const [customSectionInput, setCustomSectionInput] = useState<string>('')

  // Danh sách các lớp học phần thực tế của giảng viên từ GET /api/lecturers/me/course-sections
  const [lecturerSections, setLecturerSections] = useState<ApiCourseSectionItem[]>([])

  // Dữ liệu bảng điểm từ API GET /api/course-sections/{sectionId}/grades
  const [sectionGrades, setSectionGrades] = useState<CourseSectionGradesData>({
    courseSectionId: '',
    components: [],
    students: [],
    page: 1,
    pageSize: 20,
    totalCount: 0
  })
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Lưu trữ raw payload response để hiển thị JSON inspector
  const [rawApiResponse, setRawApiResponse] = useState<CourseSectionGradesResponse | null>(null)
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false)
  const [copiedJson, setCopiedJson] = useState<boolean>(false)

  // Lưu trữ dữ liệu batch update PUT /api/course-sections/{sectionId}/grades
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)
  const [saveApiError, setSaveApiError] = useState<string | null>(null)
  const [lastPutPayload, setLastPutPayload] = useState<BatchUpdateSectionGradesRequest | null>(null)
  const [lastPutResponse, setLastPutResponse] = useState<BatchUpdateSectionGradesResponse | null>(null)
  const [inspectorTab, setInspectorTab] = useState<'get_response' | 'put_request' | 'put_response'>('get_response')

  // Local edited student grades list: SectionStudentGradeItem[]
  const [localStudents, setLocalStudents] = useState<SectionStudentGradeItem[]>([])
  const [searchStudent, setSearchStudent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Quản lý Modal thêm cột điểm thành phần mới
  const [showAddComponentModal, setShowAddComponentModal] = useState<boolean>(false)
  const [newCompName, setNewCompName] = useState<string>('')
  const [newCompWeight, setNewCompWeight] = useState<string>('20')
  const [newCompMaxScore, setNewCompMaxScore] = useState<string>('10')

  // Đồng bộ selectedSectionId khi initialSectionId thay đổi từ ngoài truyền vào
  useEffect(() => {
    if (initialSectionId) {
      setSelectedSectionId(initialSectionId)
      setIsCustomSection(false)
    }
  }, [initialSectionId])

  // Tải danh sách lớp học phần của giảng viên để điền vào dropdown
  useEffect(() => {
    const fetchLecturerSections = async () => {
      const token = localStorage.getItem('accessToken')
      try {
        const url = getLecturerCourseSectionsUrl(1, 100)
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
        if (res.ok) {
          const json: ApiCourseSectionListResponse = await res.json()
          if (json.success && json.data?.items) {
            const items = json.data.items
            setLecturerSections(items)
            setSelectedSectionId(prev => {
              if (!prev && items.length > 0) {
                return items[0].id
              }
              return prev
            })
          }
        }
      } catch {
        // im lặng nếu không có kết nối backend
      }
    }
    fetchLecturerSections()
  }, [])

  // Gọi API GET /api/course-sections/{sectionId}/grades?page={page}&pageSize={pageSize}
  const fetchGrades = useCallback(
    async (secId: string, targetPage = 1, targetPageSize = 20) => {
      if (!secId) {
        setSectionGrades({
          courseSectionId: '',
          components: [],
          students: [],
          page: targetPage,
          pageSize: targetPageSize,
          totalCount: 0
        })
        setLocalStudents([])
        setTotalCount(0)
        setRawApiResponse(null)
        return
      }

      setIsLoading(true)
      setApiError(null)
      const token = localStorage.getItem('accessToken')

      try {
        const url = getCourseSectionGradesUrl(secId, targetPage, targetPageSize)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })

        if (response.ok) {
          const json: CourseSectionGradesResponse = await response.json()
          if (json.success && json.data) {
            setSectionGrades(json.data)
            setLocalStudents(json.data.students || [])
            setPage(json.data.page || targetPage)
            setPageSize(json.data.pageSize || targetPageSize)
            setTotalCount(json.data.totalCount || (json.data.students ? json.data.students.length : 0))
            setRawApiResponse(json)
            setHasChanges(false)
            return
          }
        } else {
          // Xử lý các lỗi thường gặp theo tài liệu API:
          // 400: Tham số không hợp lệ
          // 401: Thiếu hoặc sai token
          // 403: Không có quyền hoặc giảng viên không được phân công
          // 404: Lớp học phần không tồn tại
          const errJson = await response.json().catch(() => null)
          let errorMsg = ''
          if (response.status === 400) {
            errorMsg = errJson?.message || 'Lỗi 400 (Bad Request): Tham số truy vấn không hợp lệ (Mã lớp học phần, page hoặc pageSize không hợp lệ).'
          } else if (response.status === 401) {
            errorMsg = errJson?.message || 'Lỗi 401 (Unauthorized): Thiếu hoặc sai Access Token. Vui lòng đăng nhập lại.'
          } else if (response.status === 403) {
            errorMsg = errJson?.message || 'Lỗi 403 (Forbidden): Bạn không có quyền truy cập hoặc giảng viên không được phân công cho lớp học phần này.'
          } else if (response.status === 404) {
            errorMsg = errJson?.message || `Lỗi 404 (Not Found): Lớp học phần với mã "${secId}" không tồn tại trên hệ thống.`
          } else {
            errorMsg = errJson?.message || `Lỗi máy chủ (${response.status}): Không thể tải bảng điểm.`
          }
          setApiError(errorMsg)
        }

        // Khi API lỗi, xóa bảng điểm
        setSectionGrades({
          courseSectionId: secId,
          components: [],
          students: [],
          page: targetPage,
          pageSize: targetPageSize,
          totalCount: 0
        })
        setLocalStudents([])
        setTotalCount(0)
        setRawApiResponse(null)
      } catch {
        setApiError('Không thể kết nối đến máy chủ để tải bảng điểm. Vui lòng kiểm tra kết nối mạng.')
        setSectionGrades({
          courseSectionId: secId,
          components: [],
          students: [],
          page: targetPage,
          pageSize: targetPageSize,
          totalCount: 0
        })
        setLocalStudents([])
        setTotalCount(0)
        setRawApiResponse(null)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchGrades(selectedSectionId, page, pageSize)
  }, [selectedSectionId, page, pageSize, fetchGrades])

  // Thay đổi lớp học phần
  const handleSelectSection = (id: string) => {
    if (id === 'CUSTOM') {
      setIsCustomSection(true)
    } else {
      setIsCustomSection(false)
      setSelectedSectionId(id)
      setPage(1)
      setHasChanges(false)
    }
  }

  const handleApplyCustomSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customSectionInput.trim()) return
    setSelectedSectionId(customSectionInput.trim())
    setPage(1)
    setHasChanges(false)
  }

  // Thêm thành phần điểm mới
  const handleAddComponentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompName.trim()) return

    const parsedWeight = parseFloat(newCompWeight) || 10
    const parsedMaxScore = parseFloat(newCompMaxScore) || 10
    const newCompId = crypto.randomUUID ? crypto.randomUUID() : `comp-${Date.now()}`

    const newComp: ApiGradeComponentItem = {
      id: newCompId,
      courseSectionId: selectedSectionId,
      name: newCompName.trim(),
      weight: parsedWeight,
      maxScore: parsedMaxScore
    }

    setSectionGrades(prev => ({
      ...prev,
      components: [...(prev.components || []), newComp]
    }))

    // Cập nhật sinh viên với điểm null cho thành phần mới
    setLocalStudents(prev =>
      prev.map(st => ({
        ...st,
        grades: [
          ...(st.grades || []),
          {
            gradeComponentId: newCompId,
            gradeId: null,
            score: null,
            gradedAtUtc: null,
            updatedAtUtc: null
          }
        ]
      }))
    )

    setHasChanges(true)
    setShowAddComponentModal(false)
    setNewCompName('')
    setNewCompWeight('20')
  }

  // Xóa một cột thành phần điểm
  const handleDeleteComponent = (compId: string, compName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa cột điểm "${compName}" không?`)) return

    setSectionGrades(prev => ({
      ...prev,
      components: (prev.components || []).filter(c => c.id !== compId)
    }))

    setLocalStudents(prev =>
      prev.map(st => ({
        ...st,
        grades: (st.grades || []).filter(
          g => (g.gradeComponentId || '').toLowerCase() !== (compId || '').toLowerCase()
        )
      }))
    )

    setHasChanges(true)
  }


  // Cập nhật điểm thành phần của một sinh viên:
  // "Nếu sinh viên chưa có điểm ở một thành phần, gradeId, score và các thời điểm chấm điểm sẽ là null."
  const handleScoreChange = (enrollmentId: string, gradeComponentId: string, value: string) => {
    let numVal: number | null = parseFloat(value)
    if (isNaN(numVal) || value === '') {
      numVal = null
    } else {
      if (numVal < 0) numVal = 0
      if (numVal > 10) numVal = 10
    }

    const now = new Date().toISOString()

    setLocalStudents(prev =>
      prev.map(st => {
        if (st.enrollmentId === enrollmentId) {
          const currentGrades = st.grades || []
          const existingGrade = currentGrades.find(
            g => (g.gradeComponentId || '').toLowerCase() === (gradeComponentId || '').toLowerCase()
          )
          let updatedGrades = [...currentGrades]
          if (existingGrade) {
            updatedGrades = updatedGrades.map(g => {
              if ((g.gradeComponentId || '').toLowerCase() === (gradeComponentId || '').toLowerCase()) {
                if (numVal === null) {
                  return {
                    ...g,
                    gradeId: null,
                    score: null,
                    gradedAtUtc: null,
                    updatedAtUtc: null
                  }
                }
                return {
                  ...g,
                  score: numVal,
                  gradedAtUtc: g.gradedAtUtc || now,
                  updatedAtUtc: g.gradedAtUtc ? now : null
                }
              }
              return g
            })
          } else {
            updatedGrades.push({
              gradeComponentId,
              gradeId: null,
              score: numVal,
              gradedAtUtc: numVal === null ? null : now,
              updatedAtUtc: null
            })
          }
          return {
            ...st,
            grades: updatedGrades
          }
        }
        return st
      })
    )
    setHasChanges(true)
  }

  // Theo đặc tả API: "Cột điểm được sắp theo name"
  const sortedComponents = useMemo(() => {
    return [...(sectionGrades.components || [])].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'vi')
    )
  }, [sectionGrades.components])

  // Theo đặc tả API: "Sinh viên được sắp theo studentCode"
  const sortedStudents = useMemo(() => {
    const list = !searchStudent.trim()
      ? localStudents
      : localStudents.filter(
          st =>
            (st.fullName && st.fullName.toLowerCase().includes(searchStudent.toLowerCase().trim())) ||
            (st.studentCode && st.studentCode.toLowerCase().includes(searchStudent.toLowerCase().trim()))
        )
    return [...list].sort((a, b) => (a.studentCode || '').localeCompare(b.studentCode || ''))
  }, [localStudents, searchStudent])

  // Tính điểm tổng kết có trọng số cho 1 sinh viên
  const calculateStudentTotal = (st: SectionStudentGradeItem) => {
    const comps = sortedComponents
    const totalWeight = comps.reduce((acc, c) => acc + (c.weight || 0), 0)
    let weightedScore = 0
    let gradedCount = 0

    comps.forEach(c => {
      const g = (st.grades || []).find(
        item => (item.gradeComponentId || '').toLowerCase() === (c.id || '').toLowerCase()
      )
      if (g && typeof g.score === 'number' && g.score !== null) {
        gradedCount++
        weightedScore += (g.score / (c.maxScore || 10)) * 10 * (c.weight / 100)
      }
    })

    const hasAnyScore = gradedCount > 0
    const allGraded = comps.length > 0 && gradedCount === comps.length

    // Điểm tổng kết hệ 10
    const total = Number(weightedScore.toFixed(1))
    // Điểm quy đổi nếu tổng trọng số chưa đạt 100%
    const normalizedScore =
      totalWeight > 0 ? Number(((weightedScore / totalWeight) * 10).toFixed(1)) : total

    let letter = '-'
    let status: 'Đạt' | 'Cảnh báo' | 'Không đạt' | 'Chưa chấm' | 'Chưa hoàn tất' | 'Chưa tạo cột' = 'Chưa chấm'

    if (comps.length === 0) {
      status = 'Chưa tạo cột'
    } else if (hasAnyScore) {
      const evalScore = totalWeight === 100 ? total : normalizedScore
      if (evalScore >= 9.0) letter = 'A+'
      else if (evalScore >= 8.5) letter = 'A'
      else if (evalScore >= 8.0) letter = 'B+'
      else if (evalScore >= 7.0) letter = 'B'
      else if (evalScore >= 6.5) letter = 'C+'
      else if (evalScore >= 5.5) letter = 'C'
      else if (evalScore >= 5.0) letter = 'D+'
      else if (evalScore >= 4.0) letter = 'D'
      else letter = 'F'

      if (allGraded && totalWeight === 100) {
        if (evalScore >= 5.0) {
          status = 'Đạt'
        } else if (evalScore >= 4.0) {
          status = 'Cảnh báo'
        } else {
          status = 'Không đạt'
        }
      } else {
        status = 'Chưa hoàn tất'
      }
    }

    return {
      total,
      normalizedScore,
      letter,
      status,
      hasAnyScore,
      allGraded,
      gradedCount,
      totalComps: comps.length,
      totalWeight
    }
  }

  // Lưu bảng điểm - Gọi API PUT /api/course-sections/{sectionId}/grades
  // Nhập điểm cho nhiều sinh viên trong một request
  const handleSave = async () => {
    // Thu thập các mục điểm hợp lệ (các điểm dạng number đã nhập)
    const items: UpdateGradeItemRequest[] = []
    localStudents.forEach(st => {
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

    const payload: BatchUpdateSectionGradesRequest = { items }
    setLastPutPayload(payload)
    setIsSaving(true)
    setSaveApiError(null)

    const token = localStorage.getItem('accessToken')
    const url = getUpdateCourseSectionGradesUrl(selectedSectionId)

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const json: BatchUpdateSectionGradesResponse = await response.json().catch(() => ({
          success: true,
          message: 'Success'
        }))
        setLastPutResponse(json)
        setHasChanges(false)
        setSaveSuccessMessage(`Đã lưu và cập nhật thành công ${items.length} đầu điểm lên hệ thống!`)
        setTimeout(() => setSaveSuccessMessage(null), 4000)

        if (onSaveGrades) {
          const legacyGrades: StudentGrade[] = localStudents.map(st => {
            const { total, letter, status } = calculateStudentTotal(st)
            const stGrades = st.grades || []
            return {
              id: st.enrollmentId,
              studentCode: st.studentCode,
              fullName: st.fullName,
              avatar: `https://images.unsplash.com/photo-1534528741775?w=150&auto=format&fit=crop&q=80`,
              attendance: 10,
              midterm: stGrades[0]?.score || 0,
              practical: 0,
              finalExam: stGrades[1]?.score || 0,
              totalScore: total,
              letterGrade: letter,
              status: status === 'Chưa chấm' ? 'Không đạt' : status === 'Chưa hoàn tất' ? 'Cảnh báo' : status === 'Chưa tạo cột' ? 'Không đạt' : status
            }
          })
          onSaveGrades(selectedSectionId, legacyGrades)
        }
      } else {
        const errJson = await response.json().catch(() => null)
        let errorMsg = ''
        if (response.status === 400) {
          errorMsg = errJson?.message || 'Lỗi 400 (Bad Request): Tham số điểm không hợp lệ (kiểm tra enrollmentId, gradeComponentId hoặc thang điểm score).'
        } else if (response.status === 401) {
          errorMsg = errJson?.message || 'Lỗi 401 (Unauthorized): Thiếu hoặc sai Access Token. Vui lòng đăng nhập lại.'
        } else if (response.status === 403) {
          errorMsg = errJson?.message || 'Lỗi 403 (Forbidden): Bạn không có quyền nhập điểm cho lớp học phần này (chỉ Admin hoặc Giảng viên phụ trách).'
        } else if (response.status === 404) {
          errorMsg = errJson?.message || `Lỗi 404 (Not Found): Lớp học phần với mã "${selectedSectionId}" không tồn tại.`
        } else {
          errorMsg = errJson?.message || `Lỗi máy chủ (${response.status}): Không thể lưu bảng điểm.`
        }
        setSaveApiError(errorMsg)
      }
    } catch {
      setSaveApiError('Không thể kết nối đến máy chủ để lưu bảng điểm. Vui lòng kiểm tra kết nối mạng.')
    } finally {
      setIsSaving(false)
    }
  }

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = totalCount || localStudents.length
    let totalScoreSum = 0
    let gradedCount = 0
    let passedCount = 0
    let warningCount = 0

    localStudents.forEach(st => {
      const res = calculateStudentTotal(st)
      if (res.hasAnyScore) {
        gradedCount++
        totalScoreSum += res.normalizedScore
        if (res.status === 'Đạt' || res.normalizedScore >= 5.0) passedCount++
        else warningCount++
      }
    })

    const avgScore = gradedCount > 0 ? (totalScoreSum / gradedCount).toFixed(2) : '0.00'
    const passRate = gradedCount > 0 ? Math.round((passedCount / gradedCount) * 100) : 0

    return {
      total,
      gradedCount,
      avgScore,
      passRate,
      passedCount,
      warningCount
    }
  }, [localStudents, totalCount, sortedComponents])

  // Xuất file CSV bảng điểm
  const handleExportCsv = () => {
    const comps = sortedComponents
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

    const rows = sortedStudents.map((st, idx) => {
      const { total, letter, status } = calculateStudentTotal(st)
      const stGrades = st.grades || []
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
    link.setAttribute('download', `BangDiem_${selectedSectionId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Payload Batch PUT /api/course-sections/{sectionId}/grades chuẩn bị gửi
  const currentPendingPutPayload: BatchUpdateSectionGradesRequest = useMemo(() => {
    const items: UpdateGradeItemRequest[] = []
    localStudents.forEach(st => {
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
    return { items }
  }, [localStudents])

  // Lấy JSON theo tab đang xem trong Inspector
  const getInspectorJson = useCallback(() => {
    if (inspectorTab === 'put_request') {
      return lastPutPayload || currentPendingPutPayload
    }
    if (inspectorTab === 'put_response') {
      return (
        lastPutResponse || {
          message: 'Chưa thực hiện request PUT hoặc chưa có kết quả phản hồi từ server.'
        }
      )
    }
    return (
      rawApiResponse || {
        success: true,
        message: 'Success',
        data: {
          ...sectionGrades,
          students: localStudents
        }
      }
    )
  }, [inspectorTab, lastPutPayload, currentPendingPutPayload, lastPutResponse, rawApiResponse, sectionGrades, localStudents])

  // Copy raw JSON to clipboard
  const handleCopyJson = () => {
    const currentPayload = getInspectorJson()
    navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2))
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 2000)
  }

  const totalPages = Math.ceil((totalCount || 1) / pageSize) || 1

  return (
    <div className="space-y-6">
      {/* Top Banner & Section Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Phân hệ Đào tạo & Quản lý Điểm số</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
            Bảng Điểm Học Phần
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mã lớp học phần: <strong className="text-blue-600 font-mono">{selectedSectionId}</strong> • Hỗ trợ cấu trúc điểm thành phần động theo từng học phần.
          </p>
        </div>

        {/* Section Selector Dropdown & Actions */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          <select
            value={isCustomSection ? 'CUSTOM' : selectedSectionId}
            onChange={e => handleSelectSection(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-w-[260px] max-w-full"
          >
            {!selectedSectionId && <option value="">-- Chọn lớp học phần --</option>}
            {lecturerSections.map(sec => (
              <option key={sec.id} value={sec.id}>
                {sec.sectionCode} - {sec.courseName || 'Lớp học phần'} ({sec.id.slice(0, 8)}...)
              </option>
            ))}
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
            <option value="CUSTOM">+ Nhập mã UUID khác...</option>
          </select>

          <button
            onClick={() => fetchGrades(selectedSectionId, page, pageSize)}
            disabled={isLoading || !selectedSectionId}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Tải lại từ API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddComponentModal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
            title="Thêm cột điểm thành phần mới vào bảng điểm"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Thêm cột điểm</span>
          </button>

          <button
            onClick={() => setShowJsonInspector(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            title="Xem Payload JSON trả về từ API"
          >
            <Code2 className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Payload JSON</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              hasChanges && !isSaving
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang lưu ({currentPendingPutPayload.items.length} điểm)...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasChanges ? `Lưu bảng điểm (PUT ${currentPendingPutPayload.items.length} mục)` : 'Đã lưu'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Custom UUID Input */}
      {isCustomSection && (
        <form
          onSubmit={handleApplyCustomSection}
          className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center gap-3 animate-in fade-in"
        >
          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Nhập mã courseSectionId (UUID)..."
              value={customSectionInput}
              onChange={e => setCustomSectionInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Tải bảng điểm
          </button>
        </form>
      )}


      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => {
              setInspectorTab('put_request')
              setShowJsonInspector(true)
            }}
            className="px-3 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer shrink-0 border border-emerald-300/70"
          >
            Xem Payload PUT vừa gửi
          </button>
        </div>
      )}

      {saveApiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveApiError}</span>
          </div>
          <button
            onClick={() => setSaveApiError(null)}
            className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {apiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Sĩ số lớp</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.total}</div>
          <span className="text-[10px] text-slate-400">Sinh viên đã đăng ký</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Điểm trung bình</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{stats.avgScore}</div>
          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Đã chấm {stats.gradedCount}/{stats.total} SV
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tỷ lệ qua môn</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.passRate}%</div>
          <span className="text-[10px] text-slate-400">{stats.passedCount}/{stats.total} sinh viên đạt</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Cấu trúc điểm ({sectionGrades.components?.length || 0} cột)
          </span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {sectionGrades.components && sectionGrades.components.length > 0 ? (
              sectionGrades.components.map(comp => (
                <span
                  key={comp.id}
                  className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200"
                >
                  {comp.name}: {comp.weight}%
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400 italic">Chưa thiết lập</span>
            )}
          </div>
        </div>
      </div>

      {/* Search & Actions toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sinh viên hoặc MSSV..."
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'Khóa sổ điểm sẽ đóng quyền chỉnh sửa và gửi lên phòng khảo thí. Bạn có chắc không?'
                )
              ) {
                alert('Đã khóa sổ điểm lớp thành công!')
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Khóa sổ điểm</span>
          </button>
        </div>
      </div>

      {/* Main Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Đang tải bảng điểm học phần...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                {/* Dòng 1: Phân nhóm cột học phần */}
                <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-center">
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
                    Trạng thái ĐK
                  </th>

                  {/* NHÓM CỘT THÀNH PHẦN ĐIỂM DÀNH CHO TỪNG SINH VIÊN */}
                  <th
                    colSpan={sortedComponents.length > 0 ? sortedComponents.length : 1}
                    className="py-2.5 px-3 bg-blue-100 text-blue-950 font-black uppercase tracking-wider text-[11px] border-r border-blue-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Layers className="w-3.5 h-3.5 text-blue-700" />
                      <span>CÁC THÀNH PHẦN ĐIỂM HỌC PHẦN ({sortedComponents.length} cột)</span>
                      <button
                        onClick={() => setShowAddComponentModal(true)}
                        className="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer ml-1 transition-colors uppercase tracking-normal"
                        title="Thêm cột thành phần điểm mới"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm cột</span>
                      </button>
                    </div>
                  </th>

                  {/* NHÓM CỘT TỔNG KẾT & KẾT QUẢ */}
                  <th
                    colSpan={3}
                    className="py-2.5 px-3 bg-emerald-100 text-emerald-950 font-black uppercase tracking-wider text-[11px] text-center"
                  >
                    <span>KẾT QUẢ ĐÁNH GIÁ TỔNG KẾT</span>
                  </th>
                </tr>

                {/* Dòng 2: Chi tiết từng cột thành phần điểm và tổng kết */}
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-xs">
                  {/* Dynamic Columns from API components (sorted by name) */}
                  {sortedComponents.length > 0 ? (
                    sortedComponents.map((comp, cIdx) => (
                      <th
                        key={comp.id}
                        className="py-2.5 px-3 font-bold text-center min-w-[130px] border-r border-slate-200/90 bg-blue-50/50 group relative"
                      >
                        <div className="text-slate-900 font-extrabold flex items-center justify-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                            {cIdx + 1}
                          </span>
                          <span>{comp.name}</span>
                          {sortedComponents.length > 1 && (
                            <button
                              onClick={() => handleDeleteComponent(comp.id, comp.name)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer ml-0.5"
                              title={`Xóa cột ${comp.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                          Trọng số: <strong className="text-blue-900 font-extrabold">{comp.weight}%</strong> • Thang {comp.maxScore}
                        </div>
                      </th>
                    ))
                  ) : (
                    <th className="py-2.5 px-3 font-semibold text-center text-slate-400 italic bg-slate-50 border-r border-slate-200 min-w-[180px]">
                      Chưa có cột điểm nào (components: [])
                    </th>
                  )}

                  <th className="py-2.5 px-4 font-bold text-center w-28 border-r border-slate-200 bg-slate-100/70">
                    <div className="text-slate-800">Tổng kết</div>
                    <div className="text-[10px] text-slate-500 font-normal">Hệ 10</div>
                  </th>
                  <th className="py-2.5 px-3 font-bold text-center w-20 border-r border-slate-200 bg-slate-100/70">
                    <div className="text-slate-800">Điểm chữ</div>
                    <div className="text-[10px] text-slate-500 font-normal">Quy đổi</div>
                  </th>
                  <th className="py-2.5 px-4 font-bold text-center w-28 bg-slate-100/70">
                    <div className="text-slate-800">Kết quả</div>
                    <div className="text-[10px] text-slate-500 font-normal">Xếp loại</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4 + (sortedComponents.length > 0 ? sortedComponents.length : 1) + 3}
                      className="py-12 px-4 text-center text-slate-400 bg-slate-50/50"
                    >
                      <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm text-slate-700">Lớp học phần chưa có sinh viên</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        {searchStudent.trim()
                          ? `Không tìm thấy sinh viên nào khớp với từ khóa "${searchStudent}".`
                          : 'Danh sách sinh viên đang rỗng (students: []). Chưa có sinh viên nào đăng ký vào lớp học phần này.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedStudents.map((st, idx) => {
                    const {
                      total,
                      normalizedScore,
                      letter,
                      status,
                      hasAnyScore,
                      totalWeight
                    } = calculateStudentTotal(st)
                    const comps = sortedComponents
                    const currentGrades = st.grades || []

                    return (
                      <tr key={st.enrollmentId || st.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-medium text-slate-400 border-r border-slate-100">
                          {(page - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 border-r border-slate-100">
                          {st.studentCode}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {st.fullName ? st.fullName.charAt(0) : '?'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block">{st.fullName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                MSSV: {st.studentCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-100">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {st.enrollmentStatus === 'Registered' ? 'Đã đăng ký' : st.enrollmentStatus}
                          </span>
                        </td>

                        {/* Các cột thành phần điểm tương ứng của từng sinh viên */}
                        {comps.length === 0 ? (
                          <td className="py-3 px-4 text-center text-slate-400 italic border-r border-slate-100 bg-slate-50/30 text-[11px]">
                            Chưa có cột điểm
                          </td>
                        ) : (
                          comps.map(comp => {
                            const gradeItem = currentGrades.find(
                              g =>
                                (g.gradeComponentId || '').toLowerCase() ===
                                (comp.id || '').toLowerCase()
                            )
                            const hasScore =
                              gradeItem &&
                              typeof gradeItem.score === 'number' &&
                              gradeItem.score !== null
                            const scoreVal: number | string =
                              hasScore && gradeItem && gradeItem.score !== null ? gradeItem.score : ''

                            return (
                              <td
                                key={comp.id}
                                className="py-2.5 px-3 text-center border-r border-slate-100 bg-blue-50/15"
                              >
                                <div className="inline-flex flex-col items-center justify-center">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max={comp.maxScore || 10}
                                    value={scoreVal}
                                    placeholder="Chưa có điểm"
                                    onChange={e =>
                                      handleScoreChange(st.enrollmentId, comp.id, e.target.value)
                                    }
                                    className={`w-28 text-center py-1.5 px-2 rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                      hasScore
                                        ? 'bg-blue-50 text-blue-900 border border-blue-300 shadow-xs'
                                        : 'bg-slate-50 text-slate-400 border border-dashed border-slate-300 placeholder-slate-400'
                                    }`}
                                    title={
                                      hasScore
                                        ? `Cột: ${comp.name} (${comp.weight}%)\nĐiểm: ${scoreVal} / ${comp.maxScore}\nGradeId: ${gradeItem?.gradeId || 'null'}${
                                            gradeItem?.gradedAtUtc
                                              ? `\nChấm lúc: ${new Date(gradeItem.gradedAtUtc).toLocaleString('vi-VN')}`
                                              : ''
                                          }`
                                        : `Cột ${comp.name}: Chưa có điểm (score: null, gradeId: null)`
                                    }
                                  />
                                  {hasScore ? (
                                    <span className="text-[9px] text-blue-700 font-semibold mt-0.5">
                                      {scoreVal} / {comp.maxScore}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 font-medium mt-0.5">
                                      Chưa có điểm
                                    </span>
                                  )}
                                </div>
                              </td>
                            )
                          })
                        )}

                        {/* Total Score */}
                        <td className="py-3 px-4 text-center border-l border-slate-200 bg-slate-50/40">
                          {hasAnyScore ? (
                            <div className="inline-flex flex-col items-center">
                              <span
                                className={`font-black text-sm px-2.5 py-1 rounded-md border ${
                                  (totalWeight === 100 ? total : normalizedScore) >= 8.0
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : (totalWeight === 100 ? total : normalizedScore) >= 5.0
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {totalWeight === 100 ? total : normalizedScore}
                              </span>
                              {totalWeight < 100 && (
                                <span
                                  className="text-[9px] text-slate-500 font-medium mt-0.5"
                                  title={`Hệ số tích lũy: ${total} / ${(totalWeight / 10).toFixed(1)}`}
                                >
                                  Tích lũy {total}/{(totalWeight / 10).toFixed(1)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic font-mono">-</span>
                          )}
                        </td>

                        {/* Letter Grade */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-md ${
                              letter.startsWith('A')
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : letter.startsWith('B')
                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                : letter.startsWith('C')
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : letter === '-'
                                ? 'text-slate-400'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}
                          >
                            {letter}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                              status === 'Đạt'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : status === 'Cảnh báo'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : status === 'Không đạt'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : status === 'Chưa hoàn tất'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {status === 'Chưa hoàn tất' && totalWeight < 100
                              ? `Chưa hoàn tất (${totalWeight}%)`
                              : status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Hiển thị <strong>{sortedStudents.length}</strong> / <strong>{totalCount}</strong> sinh viên
            </span>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-slate-400">Số dòng:</span>
              <select
                value={pageSize}
                onChange={e => {
                  const newSize = Number(e.target.value)
                  setPageSize(newSize)
                  setPage(1)
                  fetchGrades(selectedSectionId, 1, newSize)
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang (Mặc định)</option>
                <option value={50}>50 / trang</option>
                <option value={100}>100 / trang</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Trang tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Inspector Modal (GET & PUT) */}
      {showJsonInspector && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">API Payload Inspector</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {inspectorTab === 'get_response'
                      ? `GET /api/course-sections/${selectedSectionId}/grades?page=${page}&pageSize=${pageSize}`
                      : `PUT /api/course-sections/${selectedSectionId}/grades`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowJsonInspector(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setInspectorTab('get_response')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'get_response'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[10px] font-mono font-bold">
                  GET
                </span>
                <span>Response Lấy bảng điểm</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectorTab('put_request')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'put_request'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="px-1.5 py-0.2 rounded bg-blue-500 text-white text-[10px] font-mono font-bold">
                  PUT
                </span>
                <span>Request Body Nhập điểm ({currentPendingPutPayload.items.length} items)</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectorTab('put_response')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'put_response'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="px-1.5 py-0.2 rounded bg-purple-500 text-white text-[10px] font-mono font-bold">
                  PUT
                </span>
                <span>Response Kết quả nhập điểm</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                {inspectorTab === 'get_response' && (
                  <>
                    Cấu trúc response GET: Khi sinh viên chưa có điểm ở thành phần, <code>gradeId</code>, <code>score</code>, <code>gradedAtUtc</code>, <code>updatedAtUtc</code> là <code>null</code>.
                  </>
                )}
                {inspectorTab === 'put_request' && (
                  <>
                    Cấu trúc body PUT: Mảng <code>items: [{'{'} enrollmentId, gradeComponentId, score {'}'}]</code> gửi đồng thời trong một request.
                  </>
                )}
                {inspectorTab === 'put_response' && (
                  <>
                    Kết quả trả về sau khi gọi API cập nhật điểm <code>PUT /api/course-sections/{selectedSectionId}/grades</code>.
                  </>
                )}
              </span>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950">
              <pre className="whitespace-pre-wrap leading-relaxed text-emerald-400/90 selection:bg-emerald-500 selection:text-slate-950">
                {JSON.stringify(getInspectorJson(), null, 2)}
              </pre>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
              <button
                onClick={() => setShowJsonInspector(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Thêm cột thành phần điểm mới */}
      {showAddComponentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Thêm Cột Thành Phần Điểm</h3>
              </div>
              <button
                onClick={() => setShowAddComponentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddComponentSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên thành phần điểm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chuyên cần, Bài tập lớn, Thuyết trình, Tiểu luận..."
                  value={newCompName}
                  onChange={e => setNewCompName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trọng số (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="20"
                    value={newCompWeight}
                    onChange={e => setNewCompWeight(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thang điểm tối đa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    value={newCompMaxScore}
                    onChange={e => setNewCompMaxScore(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl text-[11px] text-blue-700 leading-relaxed border border-blue-100">
                Cột điểm mới sẽ được thêm vào bảng điểm của học phần và tự động tạo ô nhập điểm cho toàn bộ sinh viên trong danh sách.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddComponentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Tạo cột điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
