import React, { useState } from 'react'
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download
} from 'lucide-react'
import type { ApplicationRequest } from '../../types'
import { INITIAL_REQUESTS } from '../../mockData'

interface AdminRequestsViewProps {
  requests?: ApplicationRequest[]
  onViewRequest?: (req: ApplicationRequest) => void
  onApprove?: (id: string, comment?: string) => void
  onReject?: (id: string, reason?: string) => void
}

export const AdminRequestsView: React.FC<AdminRequestsViewProps> = ({
  requests: propRequests,
  onViewRequest,
  onApprove,
  onReject
}) => {
  const [internalRequests, setInternalRequests] = useState<ApplicationRequest[]>(INITIAL_REQUESTS)
  const requests = propRequests || internalRequests
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'approved' | 'rejected'>('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleApprove = (id: string) => {
    if (onApprove) {
      onApprove(id, 'Đã được Ban Đào Tạo phê duyệt')
    } else {
      setInternalRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'approved', statusText: 'Đã duyệt' } : r))
      )
      showToast(`Đã duyệt đơn #${id} thành công!`)
    }
  }

  const handleReject = (id: string) => {
    if (onReject) {
      onReject(id, 'Không đáp ứng quy định đào tạo')
    } else {
      setInternalRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'rejected', statusText: 'Từ chối' } : r))
      )
      showToast(`Đã từ chối đơn #${id}.`)
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      r.courseName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    const matchType = typeFilter === 'ALL' || r.requestType === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            Xử Lý Đơn Từ Học Vụ Sinh Viên Toàn Trường
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Tiếp nhận, xử lý và phê duyệt các đơn xin nghỉ, phúc khảo điểm, bảo lưu và hoãn thi trực tuyến
          </p>
        </div>

        <button
          onClick={() => showToast('Đang xuất báo cáo thống kê đơn từ học vụ ra Excel...')}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Xuất báo cáo đơn từ</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng số đơn</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{requests.length}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Trong học kỳ 1</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang chờ duyệt</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">{pendingCount}</span>
            <span className="text-[10px] text-amber-600 font-medium block mt-1">Cần xử lý gấp</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã phê duyệt</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">{approvedCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đạt 85% tỷ lệ duyệt</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã từ chối</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">{rejectedCount}</span>
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
            placeholder="Tìm theo tên SV, mã sinh viên, môn học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({requests.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Chờ duyệt ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Đã duyệt ({approvedCount})
            </button>
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả loại đơn</option>
            <option value="Xin nghỉ học">Xin nghỉ học</option>
            <option value="Phúc khảo điểm">Phúc khảo điểm</option>
            <option value="Bảo lưu kết quả">Bảo lưu kết quả</option>
            <option value="Xin hoãn thi">Xin hoãn thi</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Mã đơn</th>
                <th className="py-3.5 px-4 font-bold">Sinh viên</th>
                <th className="py-3.5 px-4 font-bold">Loại đơn</th>
                <th className="py-3.5 px-4 font-bold">Lớp / Học phần</th>
                <th className="py-3.5 px-4 font-bold">Lý do</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{req.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img src={req.avatar} alt={req.studentName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-800">{req.studentName}</div>
                        <div className="text-[11px] text-slate-400">{req.studentCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-700">{req.requestType}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{req.courseName}</div>
                    <div className="text-[11px] text-slate-400">Lớp: {req.className}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="truncate text-slate-600 text-xs" title={req.reason}>
                      {req.reason}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                        req.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {req.statusText}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          if (onViewRequest) onViewRequest(req)
                          else showToast(`Xem chi tiết đơn ${req.id} của ${req.studentName}`)
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
