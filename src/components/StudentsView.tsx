import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  Mail,
  Download,
  RefreshCw,
  Lock,
  ShieldAlert,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  X,
  Eye,
  Server,
  Filter
} from 'lucide-react'
import type { ApiStudentItem, ApiStudentListResponse } from '../types'
import { API_BASE_URL } from '../config'

// Dữ liệu mẫu dùng cho chế độ xem trước (Offline Preview) khi backend chưa khởi động
const MOCK_DEMO_STUDENTS: ApiStudentItem[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    studentCode: 'STU002',
    fullName: 'Nguyen Van B',
    email: 'new.student@example.com',
    majorId: '00000000-0000-0000-0000-000000000001',
    majorName: 'Computer Science',
    enrollmentYear: 2026,
    status: 'Studying',
    avatarUrl: null
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    studentCode: 'STU003',
    fullName: 'Tran Thi Mai Anh',
    email: 'maianh.tran@example.com',
    majorId: '00000000-0000-0000-0000-000000000001',
    majorName: 'Computer Science',
    enrollmentYear: 2025,
    status: 'Studying',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    studentCode: 'STU004',
    fullName: 'Le Hoang Nam',
    email: 'hoangnam.le@example.com',
    majorId: '00000000-0000-0000-0000-000000000002',
    majorName: 'Software Engineering',
    enrollmentYear: 2026,
    status: 'Studying',
    avatarUrl: null
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    studentCode: 'STU005',
    fullName: 'Pham Thu Huong',
    email: 'thuhuong.pham@example.com',
    majorId: '00000000-0000-0000-0000-000000000003',
    majorName: 'Artificial Intelligence',
    enrollmentYear: 2026,
    status: 'Studying',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    studentCode: 'STU006',
    fullName: 'Vu Minh Duc',
    email: 'minhduc.vu@example.com',
    majorId: '00000000-0000-0000-0000-000000000002',
    majorName: 'Software Engineering',
    enrollmentYear: 2024,
    status: 'Graduated',
    avatarUrl: null
  }
]

export const StudentsView: React.FC = () => {
  // Trạng thái dữ liệu sinh viên từ API
  const [students, setStudents] = useState<ApiStudentItem[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Trạng thái HTTP & Lỗi
  const [httpStatus, setHttpStatus] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  // Cấu hình Base URL API (Hỗ trợ chuyển đổi giữa http://localhost:5271 và https://localhost:7248)
  const [baseUrl, setBaseUrl] = useState<string>(API_BASE_URL || 'http://localhost:5271')

  // Bộ lọc và tìm kiếm client
  const [search, setSearch] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')

  // Chi tiết sinh viên đang mở modal
  const [selectedStudent, setSelectedStudent] = useState<ApiStudentItem | null>(null)

  // Hàm gọi API GET /api/students?page=1&pageSize=20
  const fetchStudents = useCallback(
    async (targetPage = page, targetPageSize = pageSize, targetBase = baseUrl) => {
      setIsLoading(true)
      setErrorMessage(null)
      setHttpStatus(null)

      const token = localStorage.getItem('accessToken')

      // Kiểm tra có token hay không
      if (!token) {
        setIsLoading(false)
        setHttpStatus(401)
        setErrorMessage('Thiếu token xác thực (401 Unauthorized). Bạn cần đăng nhập với tài khoản Admin để có quyền truy cập.')
        return
      }

      try {
        const cleanBase = targetBase.replace(/\/+$/, '')
        const endpoint = `${cleanBase}/api/students?page=${targetPage}&pageSize=${targetPageSize}`

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
          setErrorMessage('Thiếu hoặc sai token xác thực (401 Unauthorized). Phiên làm việc đã hết hạn hoặc token không hợp lệ.')
          setStudents([])
          setIsDemoMode(false)
          return
        }

        // 403: Token không có quyền Admin
        if (response.status === 403) {
          setErrorMessage('Không có quyền truy cập (403 Forbidden). Token này không thuộc tài khoản Quản trị viên (Role = 1 / Admin).')
          setStudents([])
          setIsDemoMode(false)
          return
        }

        if (!response.ok) {
          let errDetail = `Lỗi yêu cầu HTTP ${response.status} (${response.statusText})`
          try {
            const errJson = await response.json()
            if (errJson.message) errDetail = errJson.message
          } catch {
            // bỏ qua parse lỗi
          }
          setErrorMessage(errDetail)
          return
        }

        const resData: ApiStudentListResponse = await response.json()

        if (resData.success && resData.data) {
          setStudents(resData.data.items || [])
          setPage(resData.data.page || targetPage)
          setPageSize(resData.data.pageSize || targetPageSize)
          setTotalCount(resData.data.totalCount || 0)
          setIsDemoMode(false)
        } else {
          setErrorMessage(resData.message || 'Không thể lấy danh sách sinh viên từ API.')
        }
      } catch (err: unknown) {
        console.error('Lỗi khi gọi API students:', err)
        setHttpStatus(0)
        setErrorMessage(
          `Không thể kết nối đến máy chủ API (${targetBase}). Vui lòng kiểm tra backend ASP.NET Core hoặc chuyển đổi giữa cổng HTTP 5271 và HTTPS 7248.`
        )
      } finally {
        setIsLoading(false)
      }
    },
    [page, pageSize, baseUrl]
  )

  // Gọi API lần đầu khi component mount hoặc khi baseUrl thay đổi
  useEffect(() => {
    fetchStudents(1, pageSize, baseUrl)
  }, [baseUrl, fetchStudents, pageSize])

  // Lọc danh sách sinh viên theo search, ngành học, trạng thái
  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const matchSearch =
        st.fullName.toLowerCase().includes(search.toLowerCase()) ||
        st.studentCode.toLowerCase().includes(search.toLowerCase()) ||
        st.email.toLowerCase().includes(search.toLowerCase())

      const matchMajor = selectedMajor === 'ALL' || st.majorName === selectedMajor
      const matchStatus = selectedStatus === 'ALL' || st.status === selectedStatus

      return matchSearch && matchMajor && matchStatus
    })
  }, [students, search, selectedMajor, selectedStatus])

  // Danh sách các chuyên ngành xuất hiện trong dữ liệu để lọc
  const majorOptions = useMemo(() => {
    const set = new Set<string>()
    students.forEach(s => {
      if (s.majorName) set.add(s.majorName)
    })
    return Array.from(set)
  }, [students])

  // Chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return
    setPage(newPage)
    if (isDemoMode) return
    fetchStudents(newPage, pageSize, baseUrl)
  }

  // Thay đổi số lượng trên một trang
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
    if (isDemoMode) return
    fetchStudents(1, newSize, baseUrl)
  }

  // Đổi nhanh API Base URL giữa 5271 (HTTP) và 7248 (HTTPS)
  const toggleBaseUrl = () => {
    const nextUrl = baseUrl.includes('5271') ? 'https://localhost:7248' : 'http://localhost:5271'
    setBaseUrl(nextUrl)
  }

  // Kích hoạt chế độ xem mẫu Offline Demo
  const enableDemoMode = () => {
    setIsDemoMode(true)
    setStudents(MOCK_DEMO_STUDENTS)
    setTotalCount(MOCK_DEMO_STUDENTS.length)
    setPage(1)
    setHttpStatus(200)
    setErrorMessage(null)
  }

  // Tính số trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Render chữ viết tắt cho avatar khi avatarUrl = null
  const getInitials = (name: string) => {
    if (!name) return 'SV'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                Danh Sách Sinh Viên
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                API: <code className="text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">{baseUrl}/api/students?page={page}&pageSize={pageSize}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Base URL Switcher */}
          <button
            onClick={toggleBaseUrl}
            title="Đổi giữa cổng HTTP (5271) và HTTPS (7248)"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Port: {baseUrl.includes('5271') ? '5271 (HTTP)' : '7248 (HTTPS)'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchStudents(page, pageSize, baseUrl)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={() => alert(`Xuất danh sách ${filteredStudents.length} sinh viên sang định dạng Excel thành công!`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Demo Banner Notification if using preview mode */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm font-bold">
              !
            </div>
            <div>
              <span className="font-bold text-amber-900 block">Đang hiển thị dữ liệu mẫu (Offline Demo Mode)</span>
              <span className="text-amber-700">
                Backend chưa trả về dữ liệu. Bấm "Thử lại kết nối" khi API ASP.NET Core trên cổng 5271/7248 đã sẵn sàng.
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchStudents(1, pageSize, baseUrl)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 transition-colors"
          >
            Thử lại kết nối API
          </button>
        </div>
      )}

      {/* 401 Unauthorized Error State */}
      {httpStatus === 401 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 shadow-xs animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-base font-extrabold text-rose-800">
                401 Unauthorized - Thiếu hoặc sai Token xác thực
              </h2>
              <p className="text-xs text-rose-700 leading-relaxed">
                {errorMessage || 'API GET /api/students yêu cầu header Authorization: Bearer <adminAccessToken> hợp lệ. Token hiện tại bị thiếu hoặc đã hết hạn.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('authUser')
                    window.location.reload()
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Đăng nhập lại
                </button>
                <button
                  onClick={enableDemoMode}
                  className="px-4 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Xem dữ liệu mẫu (Offline Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 403 Forbidden Error State */}
      {httpStatus === 403 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 shadow-xs animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-base font-extrabold text-amber-800">
                403 Forbidden - Không có quyền Admin
              </h2>
              <p className="text-xs text-amber-700 leading-relaxed">
                {errorMessage || 'Token của bạn không có role Admin (Role = 1). API này chỉ dành riêng cho tài khoản Quản trị viên phòng Đào tạo.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('authUser')
                    window.location.reload()
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Đăng nhập với tài khoản Admin
                </button>
                <button
                  onClick={enableDemoMode}
                  className="px-4 py-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Xem giao diện mẫu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network / Connection Error State */}
      {httpStatus === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-base font-extrabold text-slate-800">
                Không thể kết nối đến máy chủ API ({baseUrl})
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {errorMessage}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => fetchStudents(page, pageSize, baseUrl)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Thử lại
                </button>
                <button
                  onClick={toggleBaseUrl}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Đổi sang {baseUrl.includes('5271') ? 'HTTPS 7248' : 'HTTP 5271'}
                </button>
                <button
                  onClick={enableDemoMode}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Xem dữ liệu mẫu (Offline Demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo MSSV, Họ tên hoặc Email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Major Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMajor}
              onChange={e => setSelectedMajor(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả ngành học</option>
              {majorOptions.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Studying">Đang học (Studying)</option>
              <option value="Graduated">Đã tốt nghiệp (Graduated)</option>
              <option value="Suspended">Bảo lưu (Suspended)</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={e => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-600">Đang tải danh sách sinh viên từ API...</p>
            <p className="text-[11px] font-mono text-slate-400">GET {baseUrl}/api/students?page={page}&pageSize={pageSize}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">Không tìm thấy sinh viên nào</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Không có sinh viên nào khớp với bộ lọc tìm kiếm hiện tại hoặc dữ liệu API chưa được cập nhật.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedMajor('ALL')
                setSelectedStatus('ALL')
                fetchStudents(1, pageSize, baseUrl)
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 uppercase font-bold tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã SV</th>
                  <th className="py-3 px-4">Sinh viên</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Chuyên ngành (Major)</th>
                  <th className="py-3 px-4 text-center">Khóa nhập học</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(st => (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStudent(st)}
                  >
                    {/* Student Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <span className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
                        {st.studentCode}
                      </span>
                    </td>

                    {/* Full Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {st.avatarUrl ? (
                          <img
                            src={st.avatarUrl}
                            alt={st.fullName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {getInitials(st.fullName)}
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                            {st.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: {st.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <a
                        href={`mailto:${st.email}`}
                        onClick={e => e.stopPropagation()}
                        className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{st.email}</span>
                      </a>
                    </td>

                    {/* Major Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span>{st.majorName || 'Chưa phân ngành'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Mã ngành: {st.majorId.substring(0, 8)}...
                      </div>
                    </td>

                    {/* Enrollment Year */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {st.enrollmentYear}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full ${
                          st.status === 'Studying'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : st.status === 'Graduated'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            st.status === 'Studying'
                              ? 'bg-emerald-500'
                              : st.status === 'Graduated'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        ></span>
                        {st.status === 'Studying'
                          ? 'Đang học'
                          : st.status === 'Graduated'
                          ? 'Đã tốt nghiệp'
                          : st.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStudent(st)}
                          title="Xem chi tiết"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`mailto:${st.email}`}
                          title="Gửi email"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Summary Bar */}
        <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Hiển thị{' '}
            <strong className="text-slate-700">
              {totalCount > 0 ? (page - 1) * pageSize + 1 : 0}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-700">
              {Math.min(page * pageSize, totalCount || filteredStudents.length)}
            </strong>{' '}
            trên tổng số <strong className="text-blue-600">{totalCount || filteredStudents.length}</strong> sinh viên
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </button>

            <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700">
              Trang {page} / {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Xem Chi Tiết Sinh Viên */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Avatar */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              {selectedStudent.avatarUrl ? (
                <img
                  src={selectedStudent.avatarUrl}
                  alt={selectedStudent.fullName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-100 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
                  {getInitials(selectedStudent.fullName)}
                </div>
              )}
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-mono font-bold uppercase mb-1">
                  {selectedStudent.studentCode}
                </span>
                <h3 className="font-extrabold text-lg text-slate-800 leading-tight">
                  {selectedStudent.fullName}
                </h3>
                <p className="text-xs text-slate-400">{selectedStudent.email}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Mã sinh viên:</span>
                <span className="font-mono font-bold text-slate-800">{selectedStudent.studentCode}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Ngành học:</span>
                <span className="font-bold text-blue-600">{selectedStudent.majorName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Mã ngành (Major ID):</span>
                <span className="font-mono text-[11px] text-slate-600">{selectedStudent.majorId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Khóa nhập học:</span>
                <span className="font-bold text-slate-800">{selectedStudent.enrollmentYear}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {selectedStudent.status === 'Studying' ? 'Đang học (Studying)' : selectedStudent.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Mã định danh (GUID):</span>
                <span className="font-mono text-[10px] text-slate-400 select-all">{selectedStudent.id}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <a
                href={`mailto:${selectedStudent.email}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Gửi thư</span>
              </a>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
