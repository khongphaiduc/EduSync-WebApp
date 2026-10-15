import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  CalendarDays,
  X,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Lock,
  LayoutGrid,
  List,
  Eye,
  Copy,
  Server,
  Clock,
  Sparkles
} from 'lucide-react'
import type {
  ApiSemesterItem,
  ApiSemesterListResponse,
  CreateSemesterRequest,
  CreateSemesterResponse
} from '../../types'
import { API_BASE_URL } from '../../config'

// Dữ liệu mẫu dùng cho chế độ xem trước (Offline Demo Preview) khi backend chưa khởi động
const MOCK_DEMO_SEMESTERS: ApiSemesterItem[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Học kỳ 1',
    academicYear: '2026-2027',
    startDate: '2026-09-01',
    endDate: '2027-01-15'
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    name: 'Học kỳ 2',
    academicYear: '2026-2027',
    startDate: '2027-02-15',
    endDate: '2027-06-25'
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    name: 'Học kỳ Phụ (Hè)',
    academicYear: '2026-2027',
    startDate: '2027-07-01',
    endDate: '2027-08-20'
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    name: 'Học kỳ 2',
    academicYear: '2025-2026',
    startDate: '2026-02-16',
    endDate: '2026-06-26'
  }
]

export const AdminSemestersView: React.FC = () => {
  // Trạng thái dữ liệu danh sách học kỳ từ API
  const [semesters, setSemesters] = useState<ApiSemesterItem[]>([])
  const [activeSemesterId, setActiveSemesterId] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Trạng thái HTTP & Lỗi
  const [httpStatus, setHttpStatus] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  // Cấu hình Base URL API
  const [baseUrl] = useState<string>(API_BASE_URL || 'https://localhost:7248')

  // Tìm kiếm và bộ lọc client
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Modal xem chi tiết và thêm mới
  const [selectedSemester, setSelectedSemester] = useState<ApiSemesterItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form thêm học kỳ mới (mặc định theo mẫu yêu cầu)
  const [newSemester, setNewSemester] = useState<CreateSemesterRequest>({
    name: 'Semester 1',
    academicYear: '2026-2027',
    startDate: '2026-09-01',
    endDate: '2027-01-15'
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Hàm gọi API GET /api/semesters
  const fetchSemesters = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setHttpStatus(null)

    const token = localStorage.getItem('accessToken')

    // Kiểm tra có token hay không
    if (!token) {
      setIsLoading(false)
      setHttpStatus(401)
      setErrorMessage('Thiếu token xác thực (401 Unauthorized). Vui lòng đăng nhập với tài khoản Quản trị viên để truy cập danh sách học kỳ.')
      return
    }

    try {
      const cleanBase = baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBase}/api/semesters`

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
        setSemesters([])
        setIsDemoMode(false)
        return
      }

      // 403: Không có quyền Admin
      if (response.status === 403) {
        setErrorMessage('Không có quyền truy cập (403 Forbidden). Bạn cần quyền Quản trị viên để xem danh sách học kỳ.')
        setSemesters([])
        setIsDemoMode(false)
        return
      }

      if (!response.ok) {
        let errDetail = `Lỗi máy chủ HTTP ${response.status} (${response.statusText})`
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setErrorMessage(errDetail)
        return
      }

      const resData: ApiSemesterListResponse = await response.json()

      if (resData.success && Array.isArray(resData.data)) {
        setSemesters(resData.data)
        if (resData.data.length > 0 && !activeSemesterId) {
          setActiveSemesterId(resData.data[0].id)
        }
        setIsDemoMode(false)
      } else {
        setErrorMessage(resData.message || 'Không thể lấy danh sách học kỳ từ API.')
      }
    } catch (err: unknown) {
      console.error('Lỗi khi gọi API semesters:', err)
      setHttpStatus(0)
      setErrorMessage(
        `Không thể kết nối đến máy chủ API (${baseUrl}). Vui lòng kiểm tra backend ASP.NET Core đang chạy hoặc bật chế độ xem trước dữ liệu mẫu.`
      )
    } finally {
      setIsLoading(false)
    }
  }, [baseUrl, activeSemesterId])

  // Gọi API lần đầu khi component mount
  useEffect(() => {
    fetchSemesters()
  }, [fetchSemesters])

  // Kích hoạt chế độ demo preview khi backend chưa chạy
  const handleEnableDemoMode = () => {
    setIsDemoMode(true)
    setSemesters(MOCK_DEMO_SEMESTERS)
    setActiveSemesterId(MOCK_DEMO_SEMESTERS[0].id)
    setErrorMessage(null)
    setHttpStatus(200)
    showToast('Đã tải danh sách học kỳ mẫu (Chế độ xem trước)')
  }

  // Danh sách các niên khóa duy nhất để tạo filter
  const academicYears = useMemo(() => {
    const years = Array.from(new Set(semesters.map(s => s.academicYear).filter(Boolean)))
    return years.sort().reverse()
  }, [semesters])

  // Danh sách học kỳ sau khi lọc tìm kiếm và niên khóa
  const filteredSemesters = useMemo(() => {
    return semesters.filter(item => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.academicYear.toLowerCase().includes(q) ||
        item.startDate.toLowerCase().includes(q) ||
        item.endDate.toLowerCase().includes(q)

      const matchesYear = yearFilter === 'ALL' || item.academicYear === yearFilter

      return matchesSearch && matchesYear
    })
  }, [semesters, search, yearFilter])

  // Thiết lập học kỳ hiện tại
  const handleSetActive = (id: string) => {
    setActiveSemesterId(id)
    const target = semesters.find(s => s.id === id)
    showToast(`Đã chọn [${target?.name}] niên khóa ${target?.academicYear} làm học kỳ hiện tại!`)
  }

  // Xử lý tạo học kỳ mới - Gọi API POST /api/semesters
  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const name = newSemester.name.trim()
    const academicYear = newSemester.academicYear.trim()
    const startDate = newSemester.startDate.trim()
    const endDate = newSemester.endDate.trim()

    if (!name || !academicYear || !startDate || !endDate) {
      setFormError('Vui lòng điền đầy đủ tất cả các trường thông tin học kỳ.')
      return
    }

    // Kiểm tra tính hợp lệ của ngày: Ngày kết thúc phải sau ngày bắt đầu
    if (new Date(endDate) <= new Date(startDate)) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu; dữ liệu không hợp lệ (400 Bad Request).')
      return
    }

    // Kiểm tra trùng name trong cùng academicYear
    const isDuplicate = semesters.some(
      s =>
        s.name.trim().toLowerCase() === name.toLowerCase() &&
        s.academicYear.trim().toLowerCase() === academicYear.toLowerCase()
    )

    const token = localStorage.getItem('accessToken')

    // Chế độ demo hoặc chưa có token xác thực
    if (isDemoMode || !token) {
      if (isDuplicate) {
        setFormError(`Trùng tên "${name}" trong cùng niên khóa ${academicYear} (409 Conflict).`)
        return
      }

      const created: ApiSemesterItem = {
        id: `11111111-1111-1111-1111-${Date.now().toString().slice(-12)}`,
        name,
        academicYear,
        startDate,
        endDate
      }

      setSemesters(prev => [created, ...prev])
      setIsModalOpen(false)
      showToast(`Đã thêm học kỳ "${created.name}" (${created.academicYear}) thành công! (Dữ liệu thử nghiệm)`)
      setNewSemester({
        name: 'Semester 1',
        academicYear: '2026-2027',
        startDate: '2026-09-01',
        endDate: '2027-01-15'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const cleanBase = baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBase}/api/semesters`

      const payload: CreateSemesterRequest = {
        name,
        academicYear,
        startDate,
        endDate
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

      // 409 Conflict: Trùng name trong cùng academicYear
      if (response.status === 409) {
        let errDetail = `Trùng tên "${name}" trong cùng niên khóa ${academicYear} (409 Conflict).`
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setFormError(errDetail)
        return
      }

      // 400 Bad Request: Ngày kết thúc không sau ngày bắt đầu hoặc dữ liệu không hợp lệ
      if (response.status === 400) {
        let errDetail = 'Ngày kết thúc phải sau ngày bắt đầu; dữ liệu không hợp lệ (400 Bad Request).'
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
        setFormError('Tài khoản không có quyền tạo học kỳ (403 Forbidden).')
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

      // 201 Created (hoặc 200 OK)
      const resData: CreateSemesterResponse = await response.json()

      if (resData.success && resData.data) {
        setSemesters(prev => [resData.data!, ...prev])
        setIsModalOpen(false)
        showToast(resData.message || `Đã tạo học kỳ "${resData.data.name}" (${resData.data.academicYear}) thành công!`)
        setNewSemester({
          name: 'Semester 1',
          academicYear: '2026-2027',
          startDate: '2026-09-01',
          endDate: '2027-01-15'
        })
      } else {
        setFormError(resData.message || 'Không thể tạo học kỳ mới.')
      }
    } catch (err: unknown) {
      console.error('Lỗi khi gọi API tạo học kỳ:', err)
      setFormError(
        `Không thể kết nối đến máy chủ API (${baseUrl}). Vui lòng kiểm tra backend ASP.NET Core đang chạy hoặc sử dụng chế độ xem trước.`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text)
    showToast(`Đã sao chép ${label}`)
  }

  const currentSem =
    semesters.find(s => s.id === activeSemesterId) ||
    semesters[0] || {
      id: 'default',
      name: 'Chưa chọn học kỳ',
      academicYear: '2026-2027',
      startDate: '2026-09-01',
      endDate: '2027-01-15'
    }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              Quản Lý Học Kỳ & Niên Khóa Đào Tạo
            </h1>
            {isDemoMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                Dữ liệu mẫu (Demo)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-12.5 flex items-center gap-2">
            <span>Danh sách học kỳ từ endpoint API:</span>
            <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
              /api/semesters
            </code>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchSemesters()}
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học kỳ mới</span>
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
                  : 'Lỗi khi gọi API học kỳ'}
              </p>
              <p className="text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => fetchSemesters()}
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

      {/* Spotlight Banner: Học kỳ đang diễn ra */}
      {semesters.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 flex items-center justify-center pointer-events-none">
            <CalendarDays className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Học kỳ trọng tâm hiện tại</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{currentSem.name}</h2>
              <p className="text-blue-100 text-sm mt-1">
                Niên khóa: <strong className="text-white font-semibold">{currentSem.academicYear}</strong> • ID:{' '}
                <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs">{currentSem.id}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <div>
                <span className="text-[10px] text-blue-200 block">Ngày bắt đầu</span>
                <strong className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-300" />
                  <span>{currentSem.startDate}</span>
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-blue-200 block">Ngày kết thúc</span>
                <strong className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{currentSem.endDate}</span>
                </strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-blue-200 block">Niên khóa</span>
                <strong className="text-sm font-bold text-amber-300 block mt-0.5">{currentSem.academicYear}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học kỳ, niên khóa, thời gian..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {academicYears.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Tất cả niên khóa</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng thẻ học kỳ"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng bảng chi tiết"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Đang tải danh sách học kỳ từ API...</p>
          <p className="text-[11px] text-slate-400">/api/semesters</p>
        </div>
      ) : filteredSemesters.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy học kỳ nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Không có kết quả phù hợp với bộ lọc tìm kiếm.' : 'Hệ thống chưa có dữ liệu học kỳ nào hoặc chưa kết nối được server.'}
          </p>
          {!isDemoMode && semesters.length === 0 && (
            <button
              onClick={handleEnableDemoMode}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Bật chế độ dữ liệu mẫu</span>
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSemesters.map(sem => {
            const isCurrent = sem.id === activeSemesterId
            return (
              <div
                key={sem.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {sem.academicYear}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Đang hoạt động
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mt-2">{sem.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Niên khóa: {sem.academicYear}</p>
                    </div>

                    {!isCurrent ? (
                      <button
                        onClick={() => handleSetActive(sem.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        Đặt làm hiện tại
                      </button>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Ngày bắt đầu:</span>
                      <strong className="text-slate-700 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{sem.startDate}</span>
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Ngày kết thúc:</span>
                      <strong className="text-slate-700 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{sem.endDate}</span>
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]" title={sem.id}>
                    ID: {sem.id}
                  </span>
                  <button
                    onClick={() => setSelectedSemester(sem)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết học kỳ</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Tên học kỳ</th>
                  <th className="py-3.5 px-4 font-bold">Niên khóa</th>
                  <th className="py-3.5 px-4 font-bold">Ngày bắt đầu</th>
                  <th className="py-3.5 px-4 font-bold">Ngày kết thúc</th>
                  <th className="py-3.5 px-4 font-bold text-slate-400">ID (GUID)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSemesters.map(sem => {
                  const isCurrent = sem.id === activeSemesterId
                  return (
                    <tr key={sem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{sem.name}</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-700">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-mono text-[11px]">
                          {sem.academicYear}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{sem.startDate}</td>
                      <td className="py-3.5 px-4 text-slate-600">{sem.endDate}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        <span className="truncate max-w-[130px] inline-block" title={sem.id}>
                          {sem.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Hiện tại
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetActive(sem.id)}
                            className="text-[11px] text-slate-500 hover:text-blue-600 underline cursor-pointer"
                          >
                            Chọn
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedSemester(sem)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
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

      {/* Footer Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>
            Hiển thị <b>{filteredSemesters.length}</b> / <b>{semesters.length}</b> học kỳ
          </span>
          <span className="text-slate-300 mx-2">•</span>
          <span>
            Học kỳ trọng tâm: <b>{currentSem.name}</b> ({currentSem.academicYear})
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Dữ liệu học kỳ đồng bộ từ endpoint API /api/semesters</span>
        </div>
      </div>

      {/* Modal Chi tiết học kỳ */}
      {selectedSemester && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Hồ sơ học kỳ</h3>
                  <p className="text-[11px] text-slate-400">Chi tiết thông tin học kỳ từ API</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSemester(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                    {selectedSemester.academicYear}
                  </span>
                  {selectedSemester.id === activeSemesterId && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Đang hoạt động
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-slate-800 text-base mt-2">{selectedSemester.name}</h4>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-medium block">Ngày bắt đầu:</span>
                    <strong className="text-slate-800 font-bold block mt-1">{selectedSemester.startDate}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-medium block">Ngày kết thúc:</span>
                    <strong className="text-slate-800 font-bold block mt-1">{selectedSemester.endDate}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Semester ID (GUID):</span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-700 break-all">
                    <span>{selectedSemester.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedSemester.id, 'Semester ID')}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer shrink-0 ml-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Niên khóa đào tạo:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 font-mono">
                    <span>{selectedSemester.academicYear}</span>
                    <button
                      onClick={() => copyToClipboard(selectedSemester.academicYear, 'niên khóa')}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {selectedSemester.id !== activeSemesterId ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSetActive(selectedSemester.id)
                      setSelectedSemester(null)
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Đặt làm học kỳ hiện tại
                  </button>
                ) : (
                  <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Học kỳ đang diễn ra</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedSemester(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm học kỳ mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Thêm học kỳ mới</h3>
                  <p className="text-[11px] text-slate-400">Tạo niên khóa và các mốc thời gian học vụ</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSemester} className="p-5 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên học kỳ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Semester 1"
                    value={newSemester.name}
                    onChange={e => {
                      setNewSemester({ ...newSemester, name: e.target.value })
                      if (formError) setFormError(null)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Niên khóa *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 2026-2027"
                    value={newSemester.academicYear}
                    onChange={e => {
                      setNewSemester({ ...newSemester, academicYear: e.target.value })
                      if (formError) setFormError(null)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    required
                    value={newSemester.startDate}
                    onChange={e => {
                      setNewSemester({ ...newSemester, startDate: e.target.value })
                      if (formError) setFormError(null)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Ngày kết thúc *</label>
                  <input
                    type="date"
                    required
                    value={newSemester.endDate}
                    onChange={e => {
                      setNewSemester({ ...newSemester, endDate: e.target.value })
                      if (formError) setFormError(null)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-700 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p>
                  Quy tắc: Ngày kết thúc phải sau ngày bắt đầu (nếu không trả về 400 Bad Request). Tên học kỳ không được trùng lặp trong cùng một niên khóa (nếu trùng trả về 409 Conflict).
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Đang tạo học kỳ...' : 'Lưu học kỳ'}</span>
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
