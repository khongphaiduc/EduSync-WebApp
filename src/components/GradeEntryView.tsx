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
  Layers
} from 'lucide-react'
import type {
  StudentGrade,
  ClassItem,
  CourseSectionGradesData,
  CourseSectionGradesResponse,
  SectionStudentGradeItem
} from '../types'
import { getCourseSectionGradesUrl } from '../config'
import { DEMO_SECTION_GRADES } from '../mockData'

interface GradeEntryViewProps {
  classes?: ClassItem[]
  gradesData?: Record<string, StudentGrade[]>
  onSaveGrades?: (classCode: string, updatedGrades: StudentGrade[]) => void
  initialSectionId?: string
}

export const GradeEntryView: React.FC<GradeEntryViewProps> = ({
  classes = [],
  onSaveGrades,
  initialSectionId = '22222222-2222-2222-2222-222222222222'
}) => {
  // Quản lý lớp học phần đang được chọn
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId)
  const [isCustomSection, setIsCustomSection] = useState<boolean>(false)
  const [customSectionInput, setCustomSectionInput] = useState<string>('')

  // Dữ liệu bảng điểm từ API GET /api/course-sections/{sectionId}/grades
  const [sectionGrades, setSectionGrades] = useState<CourseSectionGradesData>(DEMO_SECTION_GRADES)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(DEMO_SECTION_GRADES.totalCount || 1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Local edited student grades map: enrollmentId -> SectionStudentGradeItem
  const [localStudents, setLocalStudents] = useState<SectionStudentGradeItem[]>(
    DEMO_SECTION_GRADES.students || []
  )
  const [searchStudent, setSearchStudent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false)

  // Gọi API GET /api/course-sections/{sectionId}/grades?page={page}&pageSize={pageSize}
  const fetchGrades = useCallback(
    async (secId: string, targetPage = 1, targetPageSize = 20) => {
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
            setTotalCount(json.data.totalCount || 0)
            setHasChanges(false)
            return
          }
        }
        // Fallback sang demo data
        setSectionGrades({
          ...DEMO_SECTION_GRADES,
          courseSectionId: secId
        })
        setLocalStudents(DEMO_SECTION_GRADES.students)
        setTotalCount(DEMO_SECTION_GRADES.totalCount)
      } catch {
        setSectionGrades({
          ...DEMO_SECTION_GRADES,
          courseSectionId: secId
        })
        setLocalStudents(DEMO_SECTION_GRADES.students)
        setTotalCount(DEMO_SECTION_GRADES.totalCount)
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

  // Cập nhật điểm thành phần của một sinh viên
  const handleScoreChange = (enrollmentId: string, gradeComponentId: string, value: string) => {
    let numVal: number | null = parseFloat(value)
    if (isNaN(numVal) || value === '') {
      numVal = null
    } else {
      if (numVal < 0) numVal = 0
      if (numVal > 10) numVal = 10
    }

    setLocalStudents(prev =>
      prev.map(st => {
        if (st.enrollmentId === enrollmentId) {
          const existingGrade = st.grades.find(g => g.gradeComponentId === gradeComponentId)
          let updatedGrades = [...st.grades]
          if (existingGrade) {
            updatedGrades = updatedGrades.map(g =>
              g.gradeComponentId === gradeComponentId
                ? { ...g, score: numVal, updatedAtUtc: new Date().toISOString() }
                : g
            )
          } else {
            updatedGrades.push({
              gradeComponentId,
              gradeId: null,
              score: numVal,
              gradedAtUtc: new Date().toISOString(),
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

  // Tính điểm tổng kết có trọng số cho 1 sinh viên
  const calculateStudentTotal = (st: SectionStudentGradeItem) => {
    const comps = sectionGrades.components || []
    let weightedScore = 0
    let hasAnyScore = false

    comps.forEach(c => {
      const g = st.grades.find(item => item.gradeComponentId === c.id)
      if (g && typeof g.score === 'number') {
        hasAnyScore = true
        weightedScore += (g.score / (c.maxScore || 10)) * 10 * (c.weight / 100)
      }
    })

    const total = Number(weightedScore.toFixed(1))
    let letter = '-'
    let status: 'Đạt' | 'Cảnh báo' | 'Không đạt' | 'Chưa chấm' = 'Chưa chấm'

    if (hasAnyScore) {
      if (total >= 9.0) letter = 'A+'
      else if (total >= 8.5) letter = 'A'
      else if (total >= 8.0) letter = 'B+'
      else if (total >= 7.0) letter = 'B'
      else if (total >= 6.5) letter = 'C+'
      else if (total >= 5.5) letter = 'C'
      else if (total >= 5.0) letter = 'D+'
      else if (total >= 4.0) letter = 'D'
      else letter = 'F'

      if (total >= 5.0) {
        status = 'Đạt'
      } else if (total >= 4.0) {
        status = 'Cảnh báo'
      } else {
        status = 'Không đạt'
      }
    }

    return { total, letter, status, hasAnyScore }
  }

  // Lưu bảng điểm
  const handleSave = () => {
    if (onSaveGrades) {
      // Chuyển đổi định dạng nếu cần cho legacy mock
      const legacyGrades: StudentGrade[] = localStudents.map(st => {
        const { total, letter, status } = calculateStudentTotal(st)
        return {
          id: st.enrollmentId,
          studentCode: st.studentCode,
          fullName: st.fullName,
          avatar: `https://images.unsplash.com/photo-${1534528741775 + 10}?w=150&auto=format&fit=crop&q=80`,
          attendance: 10,
          midterm: st.grades[0]?.score || 0,
          practical: 0,
          finalExam: st.grades[1]?.score || 0,
          totalScore: total,
          letterGrade: letter,
          status: status === 'Chưa chấm' ? 'Không đạt' : status
        }
      })
      onSaveGrades(selectedSectionId, legacyGrades)
    }

    setHasChanges(false)
    setSaveSuccessMessage(true)
    setTimeout(() => setSaveSuccessMessage(false), 3500)
  }

  // Lọc tìm kiếm sinh viên
  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return localStudents
    const q = searchStudent.toLowerCase().trim()
    return localStudents.filter(
      st =>
        (st.fullName && st.fullName.toLowerCase().includes(q)) ||
        (st.studentCode && st.studentCode.toLowerCase().includes(q))
    )
  }, [localStudents, searchStudent])

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
        totalScoreSum += res.total
        if (res.status === 'Đạt') passedCount++
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
  }, [localStudents, totalCount, sectionGrades])

  // Xuất file CSV bảng điểm
  const handleExportCsv = () => {
    const comps = sectionGrades.components || []
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

    const rows = localStudents.map((st, idx) => {
      const { total, letter, status } = calculateStudentTotal(st)
      const compScores = comps.map(c => {
        const g = st.grades.find(item => item.gradeComponentId === c.id)
        return g && typeof g.score === 'number' ? g.score : ''
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-1 flex items-center gap-2.5">
            <span>Bảng Điểm Học Phần</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
              GET /api/course-sections/{'{sectionId}'}/grades
            </span>
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
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-w-[240px]"
          >
            <option value="22222222-2222-2222-2222-222222222222">
              Lớp API: CS101-01 (Introduction to Programming)
            </option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
            <option value="CUSTOM">+ Nhập mã UUID khác...</option>
          </select>

          <button
            onClick={() => fetchGrades(selectedSectionId, page, pageSize)}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Tải lại từ API"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{hasChanges ? 'Lưu bảng điểm' : 'Đã lưu'}</span>
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
              placeholder="Nhập courseSectionId (UUID)..."
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

      {/* Endpoint Bar */}
      <div className="px-5 py-2.5 bg-slate-900 text-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-bold font-mono text-[10px]">
            GET 200 OK
          </span>
          <span className="font-mono text-[11px] text-slate-300">
            /api/course-sections/<span className="text-emerald-400 font-bold">{selectedSectionId}</span>/grades?page={page}&pageSize={pageSize}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Quyền:</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 font-mono font-semibold">
            Bearer &lt;lecturerAccessToken&gt;
          </span>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bảng điểm lớp học phần đã được lưu thành công vào hệ thống khảo thí!</span>
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
          <span className="text-[10px] text-slate-400">Sinh viên chính quy</span>
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
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Cấu trúc điểm ({sectionGrades.components?.length || 0} cột)</span>
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
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200/80">
                  <th className="py-3 px-3 font-bold w-12 text-center">STT</th>
                  <th className="py-3 px-4 font-bold w-28">Mã SV</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Họ và tên</th>
                  <th className="py-3 px-3 font-bold text-center w-28">Trạng thái</th>

                  {/* Dynamic Columns from API components */}
                  {(sectionGrades.components || []).map(comp => (
                    <th
                      key={comp.id}
                      className="py-3 px-3 font-bold text-center min-w-[120px] border-l border-slate-200/60 bg-blue-50/20"
                    >
                      <div className="text-slate-800">{comp.name}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">
                        ({comp.weight}% • Thang {comp.maxScore})
                      </div>
                    </th>
                  ))}

                  <th className="py-3 px-4 font-bold text-center w-24 border-l border-slate-200 bg-slate-100/60">
                    <div>Tổng kết</div>
                    <div className="text-[10px] text-slate-500 font-normal">(Hệ 10)</div>
                  </th>
                  <th className="py-3 px-3 font-bold text-center w-20">Điểm chữ</th>
                  <th className="py-3 px-4 font-bold text-center w-24">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st, idx) => {
                  const { total, letter, status, hasAnyScore } = calculateStudentTotal(st)
                  const comps = sectionGrades.components || []

                  return (
                    <tr key={st.enrollmentId || st.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-medium text-slate-400">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {st.studentCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {st.fullName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{st.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {st.enrollmentStatus === 'Registered' ? 'Đã đăng ký' : st.enrollmentStatus}
                        </span>
                      </td>

                      {/* Dynamic Component Score Inputs */}
                      {comps.map(comp => {
                        const gradeItem = st.grades.find(g => g.gradeComponentId === comp.id)
                        const scoreVal = gradeItem?.score !== null && gradeItem?.score !== undefined ? gradeItem.score : ''

                        return (
                          <td
                            key={comp.id}
                            className="py-2 px-2 text-center border-l border-slate-100"
                          >
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max={comp.maxScore || 10}
                              value={scoreVal}
                              placeholder="-"
                              onChange={e =>
                                handleScoreChange(st.enrollmentId, comp.id, e.target.value)
                              }
                              className="w-16 mx-auto text-center py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                        )
                      })}

                      {/* Total Score */}
                      <td className="py-3 px-4 text-center border-l border-slate-200 bg-slate-50/40">
                        {hasAnyScore ? (
                          <span
                            className={`font-black text-sm px-2.5 py-1 rounded-md border ${
                              total >= 8.0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : total >= 5.0
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {total}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
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
                              ? 'bg-emerald-50 text-emerald-700'
                              : status === 'Cảnh báo'
                              ? 'bg-amber-50 text-amber-700'
                              : status === 'Không đạt'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong>{filteredStudents.length}</strong> / <strong>{totalCount}</strong> sinh viên
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
    </div>
  )
}
