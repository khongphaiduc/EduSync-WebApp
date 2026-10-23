import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Award,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  LayoutGrid,
  List,
  CheckCircle2,
  X,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Server,
  Key
} from 'lucide-react'
import type { ApiLecturerItem, ApiLecturerListResponse, CreateLecturerResponse } from '../../types'
import { API_BASE_URL } from '../../config'

// Dữ liệu mẫu dùng cho chế độ xem trước (Offline Demo Preview) khi backend chưa khởi động
const MOCK_DEMO_LECTURERS: ApiLecturerItem[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000002',
    lecturerCode: 'GV001',
    fullName: 'Nguyễn Văn An',
    email: 'giangvien@example.com',
    phone: '0900000000',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    userId: '00000000-0000-0000-0000-000000000004',
    lecturerCode: 'GV002',
    fullName: 'Trần Thị Mai',
    email: 'mai.tran@example.com',
    phone: '0912888999',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isActive: true
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    userId: '00000000-0000-0000-0000-000000000006',
    lecturerCode: 'GV003',
    fullName: 'Lê Quang Huy',
    email: 'huy.le@example.com',
    phone: '0988777666',
    avatarUrl: null,
    isActive: true
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    userId: '00000000-0000-0000-0000-000000000008',
    lecturerCode: 'GV004',
    fullName: 'Đỗ Hoàng Long',
    email: 'long.do@example.com',
    phone: '0908555444',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: false
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    userId: '00000000-0000-0000-0000-000000000010',
    lecturerCode: 'GV005',
    fullName: 'Vũ Phương Thảo',
    email: 'thao.vu@example.com',
    phone: '0977123789',
    avatarUrl: null,
    isActive: true
  }
]

export const AdminTeachersView: React.FC = () => {
  // Trạng thái dữ liệu danh sách giảng viên từ API
  const [lecturers, setLecturers] = useState<ApiLecturerItem[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Trạng thái HTTP & Lỗi
  const [httpStatus, setHttpStatus] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  // Cấu hình Base URL API
  const [baseUrl] = useState<string>(API_BASE_URL || 'https://localhost:7249')

  // Tìm kiếm và bộ lọc client
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modal xem chi tiết và thêm mới
  const [selectedLecturer, setSelectedLecturer] = useState<ApiLecturerItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form thêm giảng viên mới
  const [newLecturer, setNewLecturer] = useState({
    lecturerCode: '',
    fullName: '',
    email: '',
    password: 'Password123!',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Hàm gọi API GET api/lecturers?page=1&pageSize=20
  const fetchLecturers = useCallback(
    async (targetPage = page, targetPageSize = pageSize) => {
      setIsLoading(true)
      setErrorMessage(null)
      setHttpStatus(null)

      const token = localStorage.getItem('accessToken')

      // Kiểm tra có token hay không
      if (!token) {
        setIsLoading(false)
        setHttpStatus(401)
        setErrorMessage('Thiếu token xác thực (401 Unauthorized). Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) để có quyền truy cập.')
        return
      }

      try {
        const cleanBase = baseUrl.replace(/\/+$/, '')
        const endpoint = `${cleanBase}/api/lecturers?page=${targetPage}&pageSize=${targetPageSize}`

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
          setLecturers([])
          setIsDemoMode(false)
          return
        }

        // 403: Không có quyền Admin
        if (response.status === 403) {
          setErrorMessage('Không có quyền truy cập (403 Forbidden). Token này không thuộc tài khoản Quản trị viên (Role = 1 / Admin).')
          setLecturers([])
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

        const resData: ApiLecturerListResponse = await response.json()

        if (resData.success && resData.data) {
          setLecturers(resData.data.items || [])
          setPage(resData.data.page || targetPage)
          setPageSize(resData.data.pageSize || targetPageSize)
          setTotalCount(resData.data.totalCount || 0)
          setIsDemoMode(false)
        } else {
          setErrorMessage(resData.message || 'Không thể lấy danh sách giảng viên từ API.')
        }
      } catch (err: unknown) {
        console.error('Lỗi khi gọi API lecturers:', err)
        setHttpStatus(0)
        setErrorMessage(
          `Không thể kết nối đến máy chủ API (${baseUrl}). Vui lòng kiểm tra backend ASP.NET Core đang chạy hoặc bật chế độ xem trước dữ liệu mẫu.`
        )
      } finally {
        setIsLoading(false)
      }
    },
    [page, pageSize, baseUrl]
  )

  // Gọi API lần đầu khi component mount
  useEffect(() => {
    fetchLecturers(1, pageSize)
  }, [fetchLecturers, pageSize])

  // Kích hoạt chế độ demo preview khi backend chưa chạy
  const handleEnableDemoMode = () => {
    setIsDemoMode(true)
    setLecturers(MOCK_DEMO_LECTURERS)
    setPage(1)
    setPageSize(20)
    setTotalCount(MOCK_DEMO_LECTURERS.length)
    setErrorMessage(null)
    setHttpStatus(200)
    showToast('Đã tải danh sách giảng viên mẫu (Chế độ xem trước)')
  }

  // Danh sách giảng viên sau khi lọc tìm kiếm và trạng thái
  const filteredLecturers = useMemo(() => {
    return lecturers.filter(item => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        item.lecturerCode.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.phone && item.phone.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive)

      return matchesSearch && matchesStatus
    })
  }, [lecturers, search, statusFilter])

  // Tính số trang
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    if (isDemoMode) {
      setPage(newPage)
    } else {
      fetchLecturers(newPage, pageSize)
    }
  }

  // Xử lý tạo giảng viên - Gọi POST /api/lecturers
  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!newLecturer.lecturerCode.trim() || !newLecturer.fullName.trim() || !newLecturer.email.trim()) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc (Mã GV, Họ và tên, Email).')
      return
    }

    if (!newLecturer.password || newLecturer.password.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    const token = localStorage.getItem('accessToken')

    // Chế độ demo hoặc chưa có token
    if (isDemoMode || !token) {
      const created: ApiLecturerItem = {
        id: `00000000-0000-0000-0000-${Date.now().toString().slice(-12)}`,
        userId: `00000000-0000-0000-0000-${(Date.now() + 1).toString().slice(-12)}`,
        lecturerCode: newLecturer.lecturerCode.trim().toUpperCase(),
        fullName: newLecturer.fullName.trim(),
        email: newLecturer.email.trim(),
        phone: newLecturer.phone.trim() || '0900000002',
        avatarUrl: null,
        isActive: true
      }

      setLecturers(prev => [created, ...prev])
      setTotalCount(prev => prev + 1)
      setIsAddModalOpen(false)
      showToast(`Đã thêm giảng viên ${created.fullName} (${created.lecturerCode}) thành công! (Dữ liệu thử nghiệm)`)
      setNewLecturer({
        lecturerCode: '',
        fullName: '',
        email: '',
        password: 'Password123!',
        phone: ''
      })
      return
    }

    setIsSubmitting(true)

    try {
      const cleanBase = baseUrl.replace(/\/+$/, '')
      const endpoint = `${cleanBase}/api/lecturers`

      const payload = {
        email: newLecturer.email.trim(),
        password: newLecturer.password,
        lecturerCode: newLecturer.lecturerCode.trim().toUpperCase(),
        fullName: newLecturer.fullName.trim(),
        phone: newLecturer.phone.trim() || '0900000002'
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

      // HTTP 409 Conflict: Email already exists
      if (response.status === 409) {
        let errDetail = 'Email đã tồn tại trong hệ thống (409 Conflict).'
        try {
          const errJson = await response.json()
          if (errJson.message) errDetail = errJson.message
        } catch {
          // ignore
        }
        setFormError(errDetail)
        return
      }

      // HTTP 400 Bad Request
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

      // HTTP 401 Unauthorized
      if (response.status === 401) {
        setFormError('Phiên làm việc đã hết hạn hoặc không có quyền truy cập (401 Unauthorized).')
        return
      }

      // HTTP 403 Forbidden
      if (response.status === 403) {
        setFormError('Tài khoản không có quyền tạo giảng viên (403 Forbidden).')
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

      // HTTP 201 Created
      const resData: CreateLecturerResponse = await response.json()

      if (resData.success && resData.data) {
        setLecturers(prev => [resData.data!, ...prev])
        setTotalCount(prev => prev + 1)
        setIsAddModalOpen(false)
        showToast(`Đã tạo giảng viên ${resData.data.fullName} (${resData.data.lecturerCode}) thành công!`)
        setNewLecturer({
          lecturerCode: '',
          fullName: '',
          email: '',
          password: 'Password123!',
          phone: ''
        })
      } else {
        setFormError(resData.message || 'Không thể tạo giảng viên.')
      }
    } catch (err: unknown) {
      console.error('Lỗi khi gọi API POST /api/lecturers:', err)
      setFormError(`Không thể kết nối đến máy chủ API (${baseUrl}). Vui lòng kiểm tra backend hoặc thử lại.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text)
    showToast(`Đã sao chép ${label}`)
  }

  // Render Avatar với Fallback ký tự đầu nếu không có ảnh
  const renderAvatar = (name: string, url: string | null, size = 'md') => {
    const sizeClasses = size === 'lg' ? 'w-16 h-16 text-lg' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm'
    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className={`${sizeClasses} rounded-2xl object-cover ring-2 ring-slate-100 shrink-0`}
        />
      )
    }
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'GV'

    return (
      <div
        className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white font-bold flex items-center justify-center ring-2 ring-slate-100 shrink-0 shadow-xs`}
      >
        {initials}
      </div>
    )
  }

  // Thống kê nhanh
  const activeCount = lecturers.filter(l => l.isActive).length
  const inactiveCount = lecturers.filter(l => !l.isActive).length

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              Quản Lý Giảng Viên Toàn Trường
            </h1>
            {isDemoMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                Dữ liệu mẫu (Demo)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-12.5 flex items-center gap-2">
            <span>Danh sách giảng viên từ endpoint API:</span>
            <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
              api/lecturers?page={page}&pageSize={pageSize}
            </code>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchLecturers(page, pageSize)}
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
              setIsAddModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giảng viên mới</span>
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
                  : 'Lỗi khi gọi API giảng viên'}
              </p>
              <p className="text-rose-700 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => fetchLecturers(page, pageSize)}
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
            <span className="text-[11px] text-slate-400 font-medium block">Tổng giảng viên</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">
              {isLoading ? '...' : totalCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đã lưu trong hệ thống</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang công tác</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">
              {isLoading ? '...' : activeCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Hoạt động bình thường</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tạm dừng / Khóa</span>
            <span className="text-2xl font-black text-slate-700 leading-tight">
              {isLoading ? '...' : inactiveCount}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Nghỉ phép hoặc tạm ngưng</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Phân trang API</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">
              {page} / {totalPages}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Kích cỡ {pageSize} bản ghi/trang</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
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
              placeholder="Tìm theo mã GV, họ tên, email, SĐT..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang công tác</option>
              <option value="INACTIVE">Tạm dừng / Khóa</option>
            </select>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng lưới thẻ"
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
          <div className="w-10 h-10 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Đang tải danh sách giảng viên từ API...</p>
          <p className="text-[11px] text-slate-400">api/lecturers?page={page}&pageSize={pageSize}</p>
        </div>
      ) : filteredLecturers.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy giảng viên nào</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search ? 'Không có kết quả phù hợp với bộ lọc tìm kiếm.' : 'Hệ thống chưa có hồ sơ giảng viên nào hoặc chưa kết nối được dữ liệu.'}
          </p>
          {!isDemoMode && lecturers.length === 0 && (
            <button
              onClick={handleEnableDemoMode}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Bật chế độ dữ liệu mẫu</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLecturers.map(lecturer => (
            <div
              key={lecturer.id}
              onClick={() => setSelectedLecturer(lecturer)}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-rose-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {renderAvatar(lecturer.fullName, lecturer.avatarUrl, 'md')}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {lecturer.lecturerCode}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            lecturer.isActive
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                              : 'text-slate-500 bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lecturer.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {lecturer.isActive ? 'Đang công tác' : 'Tạm dừng'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mt-1.5 group-hover:text-rose-600 transition-colors">
                        {lecturer.fullName}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lecturer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{lecturer.phone || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>

              {/* Footer info: User ID */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[170px]" title={lecturer.userId}>
                  UID: {lecturer.userId}
                </span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    setSelectedLecturer(lecturer)
                  }}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Mã GV</th>
                  <th className="py-3 px-4 font-bold">Họ và tên</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Số điện thoại</th>
                  <th className="py-3 px-4 font-bold">User ID</th>
                  <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                  <th className="py-3 px-4 font-bold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLecturers.map(lecturer => (
                  <tr key={lecturer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                        {lecturer.lecturerCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {renderAvatar(lecturer.fullName, lecturer.avatarUrl, 'sm')}
                        <span className="font-bold text-slate-800">{lecturer.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{lecturer.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{lecturer.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      <span className="truncate max-w-[120px] inline-block" title={lecturer.userId}>
                        {lecturer.userId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          lecturer.isActive
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                            : 'text-slate-500 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            lecturer.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {lecturer.isActive ? 'Đang công tác' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedLecturer(lecturer)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>
            Hiển thị <b>{filteredLecturers.length}</b> / <b>{totalCount}</b> giảng viên
          </span>
          <span className="text-slate-300 mx-2">•</span>
          <span>
            Trang <b>{page}</b> / <b>{totalPages}</b>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang trước</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-100">
            {page}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Chi tiết Giảng Viên */}
      {selectedLecturer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Hồ sơ giảng viên</h3>
                  <p className="text-[11px] text-slate-400">Chi tiết thông tin giảng viên từ API</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLecturer(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                {renderAvatar(selectedLecturer.fullName, selectedLecturer.avatarUrl, 'lg')}
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">{selectedLecturer.fullName}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {selectedLecturer.lecturerCode}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        selectedLecturer.isActive
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-slate-500 bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {selectedLecturer.isActive ? 'Đang công tác' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span>{selectedLecturer.email}</span>
                    <button
                      onClick={() => copyToClipboard(selectedLecturer.email, 'email')}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Số điện thoại:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span>{selectedLecturer.phone || 'Chưa cập nhật'}</span>
                    {selectedLecturer.phone && (
                      <button
                        onClick={() => copyToClipboard(selectedLecturer.phone, 'số điện thoại')}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Lecturer ID (GUID):</span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-700 break-all">
                    <span>{selectedLecturer.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedLecturer.id, 'Lecturer ID')}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer shrink-0 ml-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">User ID (GUID):</span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-700 break-all">
                    <span>{selectedLecturer.userId}</span>
                    <button
                      onClick={() => copyToClipboard(selectedLecturer.userId, 'User ID')}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer shrink-0 ml-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLecturer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm giảng viên mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Thêm giảng viên mới</h3>
                  <p className="text-[11px] text-slate-400">Endpoint: POST /api/lecturers</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setFormError(null)
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLecturer} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-rose-900">Không thể tạo giảng viên</p>
                    <p className="text-rose-700 mt-0.5 leading-relaxed">{formError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã GV *</label>
                  <input
                    type="text"
                    required
                    placeholder="LEC001"
                    value={newLecturer.lecturerCode}
                    onChange={e => setNewLecturer({ ...newLecturer, lecturerCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyen Van C"
                    value={newLecturer.fullName}
                    onChange={e => setNewLecturer({ ...newLecturer, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Email đăng nhập *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="new.lecturer@example.com"
                    value={newLecturer.email}
                    onChange={e => setNewLecturer({ ...newLecturer, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Mật khẩu khởi tạo *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password123!"
                    value={newLecturer.password}
                    onChange={e => setNewLecturer({ ...newLecturer, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Mật khẩu mặc định: Password123!</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="0900000002"
                    value={newLecturer.phone}
                    onChange={e => setNewLecturer({ ...newLecturer, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setFormError(null)
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Đang tạo...' : 'Lưu giảng viên'}</span>
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
