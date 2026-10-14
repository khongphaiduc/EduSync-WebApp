import React, { useState } from 'react'
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  CheckCheck
} from 'lucide-react'
import type { ApplicationRequest } from '../types'

interface RequestsViewProps {
  requests: ApplicationRequest[]
  onViewRequest: (request: ApplicationRequest) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onViewRequest,
  onApprove,
  onReject
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')

  const filtered = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      r.requestType.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const pendingTotal = requests.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Quản Lý Đơn Từ Sinh Viên
            </h1>
            {pendingTotal > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                {pendingTotal} chờ xử lý
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Xét duyệt các đơn xin nghỉ học, phúc khảo điểm kiểm tra, hoãn thi và bảo lưu học tập
          </p>
        </div>

        <button
          onClick={() => {
            const pendingIds = requests.filter(r => r.status === 'pending').map(r => r.id)
            if (pendingIds.length === 0) {
              alert('Không có đơn nào đang chờ duyệt!')
              return
            }
            if (confirm(`Bạn có chắc muốn duyệt nhanh tất cả ${pendingIds.length} đơn đang chờ?`)) {
              pendingIds.forEach(id => onApprove(id))
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Duyệt nhanh tất cả</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên SV, MSSV hoặc loại đơn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Tất cả ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'pending'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Chờ duyệt ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'approved'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đã duyệt ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterStatus === 'rejected'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Từ chối ({requests.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <th className="py-3 px-4 font-bold">Sinh viên</th>
                <th className="py-3 px-4 font-bold">Mã SV</th>
                <th className="py-3 px-4 font-bold">Lớp / Học phần</th>
                <th className="py-3 px-4 font-bold">Loại đơn</th>
                <th className="py-3 px-4 font-bold">Ngày gửi</th>
                <th className="py-3 px-4 font-bold">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.avatar}
                        alt={req.studentName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span className="font-bold text-slate-800">{req.studentName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{req.studentCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{req.courseName}</div>
                    <div className="text-[11px] text-slate-400">{req.className}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{req.requestType}</td>
                  <td className="py-3.5 px-4 text-slate-500">{req.submissionDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                        req.status === 'pending'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200/80'
                          : req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                          : 'bg-rose-50 text-rose-600 border border-rose-200/80'
                      }`}
                    >
                      {req.statusText}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewRequest(req)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>

                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove(req.id)}
                            title="Duyệt đơn"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReject(req.id)}
                            title="Từ chối"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
