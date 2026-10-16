import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
  X,
  Calendar,
  MessageSquare
} from 'lucide-react'
import type {
  ApiStudentRequestItem,
  ApiStudentRequestListResponse
} from '../../types'
import { getStudentRequestsUrl } from '../../config'

export const AdminRequestsView: React.FC = () => {
  // Dữ liệu từ API GET /api/requests
  const [requests, setRequests] = useState<ApiStudentRequestItem[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Bộ lọc
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('ALL')
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  // Modal chi tiết đơn từ
  const [selectedRequest, setSelectedRequest] = useState<ApiStudentRequestItem | null>(null)

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Lấy token đăng nhập
  const getAuthToken = () => localStorage.getItem('accessToken')

  // Gọi API lấy danh sách đơn từ
  const fetchRequests = useCallback(
    async (
      targetPage = page,
      targetPageSize = pageSize,
      targetStatus = statusFilter,
      targetType = requestTypeFilter
    ) => {
      setIsLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        setError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập với tài khoản Quản trị viên.')
        setIsLoading(false)
        return
      }

      try {
        const url = getStudentRequestsUrl(
          targetPage,
          targetPageSize,
          targetStatus,
          targetType
        )

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const json: ApiStudentRequestListResponse = await response.json()
          if (json.success && json.data) {
            setRequests(json.data.items || [])
            setTotalCount(json.data.totalCount || 0)
            setPage(json.data.page || targetPage)
            setPageSize(json.data.pageSize || targetPageSize)
          } else {
            setRequests([])
            setTotalCount(0)
          }
        } else if (response.status === 401 || response.status === 403) {
          setError('Bạn không có quyền truy cập danh sách đơn từ (Yêu cầu quyền Admin).')
          setRequests([])
        } else {
          const errData = await response.json().catch(() => null)
          setError(errData?.message || 'Không thể tải danh sách đơn từ.')
          setRequests([])
        }
      } catch {
        setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra đường truyền và thử lại.')
        setRequests([])
      } finally {
        setIsLoading(false)
      }
    },
    [page, pageSize, statusFilter, requestTypeFilter]
  )

  // Tải lại khi thay đổi trang, kích thước trang hoặc bộ lọc
  useEffect(() => {
    fetchRequests(page, pageSize, statusFilter, requestTypeFilter)
  }, [page, pageSize, statusFilter, requestTypeFilter, fetchRequests])

  // Lọc tìm kiếm cục bộ theo mã sinh viên, tên, tiêu đề hoặc nội dung
  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests
    const q = search.toLowerCase().trim()
    return requests.filter(
      r =>
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.studentCode && r.studentCode.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.content && r.content.toLowerCase().includes(q))
    )
  }, [requests, search])

  // Thống kê nhanh từ danh sách hiện tại
  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').length
    const approved = requests.filter(r => r.status === 'Approved').length
    const rejected = requests.filter(r => r.status === 'Rejected').length
    return { pending, approved, rejected }
  }, [requests])

  // Chuyển đổi định dạng ngày giờ Việt Nam
  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  const formatDateTimeDisplay = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000)
      const day = String(vnTime.getUTCDate()).padStart(2, '0')
      const month = String(vnTime.getUTCMonth() + 1).padStart(2, '0')
      const year = vnTime.getUTCFullYear()
      const hh = String(vnTime.getUTCHours()).padStart(2, '0')
      const mm = String(vnTime.getUTCMinutes()).padStart(2, '0')
      return `${hh}:${mm} - ${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  // Định dạng nhãn và màu sắc loại đơn
  const getRequestTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'leave':
        return { label: 'Đơn xin nghỉ học', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'certificate':
        return { label: 'Cấp giấy chứng nhận', color: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'appeal':
        return { label: 'Phúc khảo điểm', color: 'bg-purple-50 text-purple-700 border-purple-200' }
      case 'postpone':
        return { label: 'Xin hoãn thi', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      default:
        return { label: type, color: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  // Định dạng nhãn và màu sắc trạng thái đơn
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'Approved':
        return { label: 'Đã duyệt', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'Rejected':
        return { label: 'Từ chối', color: 'bg-rose-50 text-rose-700 border-rose-200' }
      default:
        return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            Xử Lý Đơn Từ Học Vụ Sinh Viên
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Tiếp nhận, xử lý và theo dõi các loại đơn từ (nghỉ học, cấp giấy chứng nhận, phúc khảo...) của sinh viên
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              fetchRequests(page, pageSize, statusFilter, requestTypeFilter)
              showToast('Đang tải lại danh sách đơn từ...')
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng số đơn</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{totalCount}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Hệ thống ghi nhận</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang chờ duyệt</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">{stats.pending}</span>
            <span className="text-[10px] text-amber-600 font-medium block mt-1">Cần xem xét</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã phê duyệt</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">{stats.approved}</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đã hoàn tất</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã từ chối</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">{stats.rejected}</span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">Không hợp lệ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên SV, mã sinh viên, tiêu đề đơn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setStatusFilter('ALL')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setStatusFilter('Pending')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => {
                setStatusFilter('Approved')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'Approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => {
                setStatusFilter('Rejected')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'Rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Từ chối
            </button>
          </div>

          {/* Request Type filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={requestTypeFilter}
              onChange={e => {
                setRequestTypeFilter(e.target.value)
                setPage(1)
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả loại đơn</option>
              <option value="Leave">Đơn xin nghỉ học</option>
              <option value="Certificate">Cấp giấy chứng nhận</option>
              <option value="Appeal">Phúc khảo điểm</option>
              <option value="Postpone">Xin hoãn thi</option>
            </select>
          </div>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={10}>10 đơn / trang</option>
            <option value={20}>20 đơn / trang</option>
            <option value={50}>50 đơn / trang</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Mã đơn</th>
                <th className="py-3.5 px-4 font-bold">Sinh viên</th>
                <th className="py-3.5 px-4 font-bold">Loại đơn</th>
                <th className="py-3.5 px-4 font-bold">Tiêu đề & Nội dung</th>
                <th className="py-3.5 px-4 font-bold">Thời gian áp dụng</th>
                <th className="py-3.5 px-4 font-bold">Ngày nộp</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Đang tải danh sách đơn từ...</span>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-xs">Không có đơn từ nào phù hợp</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const typeBadge = getRequestTypeBadge(req.requestType)
                  const statusBadge = getStatusBadge(req.status)

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600 text-[11px]">
                        #{req.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {req.studentName ? req.studentName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{req.studentName || 'Chưa cập nhật'}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{req.studentCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate" title={req.title}>
                          {req.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5" title={req.content}>
                          {req.content}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {req.startDate || req.endDate ? (
                          <div className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {formatDateDisplay(req.startDate)}
                              {req.endDate && req.endDate !== req.startDate && ` – ${formatDateDisplay(req.endDate)}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Không áp dụng</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {formatDateTimeDisplay(req.submittedAt)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                          title="Xem chi tiết đơn"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Hiển thị{' '}
              <strong className="text-slate-800">
                {(page - 1) * pageSize + 1} – {Math.min(page * pageSize, totalCount)}
              </strong>{' '}
              trong tổng số <strong className="text-slate-800">{totalCount}</strong> đơn từ
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
      </div>

      {/* Modal Chi Tiết Đơn Từ */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    Chi tiết đơn từ học vụ
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Mã đơn: #{selectedRequest.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4.5 text-xs">
              {/* Thông tin sinh viên */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                  {selectedRequest.studentName
                    ? selectedRequest.studentName.charAt(0).toUpperCase()
                    : <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm">{selectedRequest.studentName}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>
                      Mã SV: <strong className="text-slate-700 font-mono">{selectedRequest.studentCode}</strong>
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    getStatusBadge(selectedRequest.status).color
                  }`}
                >
                  {getStatusBadge(selectedRequest.status).label}
                </span>
              </div>

              {/* Thông tin loại đơn và tiêu đề */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-1">Loại đơn:</span>
                  <span className="font-bold text-slate-800">
                    {getRequestTypeBadge(selectedRequest.requestType).label}
                  </span>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-1">Ngày nộp đơn:</span>
                  <span className="font-semibold text-slate-700">
                    {formatDateTimeDisplay(selectedRequest.submittedAt)}
                  </span>
                </div>
              </div>

              {/* Tiêu đề đơn */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tiêu đề đơn:
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-800">
                  {selectedRequest.title}
                </div>
              </div>

              {/* Khoảng thời gian nếu có */}
              {(selectedRequest.startDate || selectedRequest.endDate) && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Khoảng thời gian áp dụng:
                  </span>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>
                      {formatDateDisplay(selectedRequest.startDate)}
                      {selectedRequest.endDate &&
                        selectedRequest.endDate !== selectedRequest.startDate &&
                        ` đến ${formatDateDisplay(selectedRequest.endDate)}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Nội dung chi tiết */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nội dung trình bày:
                </span>
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {selectedRequest.content || <span className="text-slate-400 italic">Không có nội dung mô tả</span>}
                </div>
              </div>

              {/* Thông tin xét duyệt nếu có */}
              {(selectedRequest.reviewedBy || selectedRequest.response) && (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Phản hồi từ Ban Đào Tạo:
                  </span>
                  {selectedRequest.reviewedBy && (
                    <div className="text-[11px] text-slate-600">
                      Người duyệt: <strong className="text-slate-800">{selectedRequest.reviewedBy}</strong>
                      {selectedRequest.reviewedAt && (
                        <span> lúc {formatDateTimeDisplay(selectedRequest.reviewedAt)}</span>
                      )}
                    </div>
                  )}
                  {selectedRequest.response && (
                    <div className="text-slate-700 font-medium italic mt-1">
                      "{selectedRequest.response}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
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
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
