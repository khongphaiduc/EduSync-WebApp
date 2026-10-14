import React, { useState } from 'react'
import { X, CheckCircle, XCircle, FileText, Download } from 'lucide-react'
import type { ApplicationRequest } from '../types'

interface RequestDetailModalProps {
  request: ApplicationRequest | null
  onClose: () => void
  onApprove: (id: string, comment?: string) => void
  onReject: (id: string, reason?: string) => void
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject
}) => {
  const [comment, setComment] = useState('')

  if (!request) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Chi tiết đơn từ sinh viên</h3>
            <p className="text-xs text-slate-400 mt-0.5">Mã đơn: #{request.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Student Info */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <img
              src={request.avatar}
              alt={request.studentName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-sm">{request.studentName}</h4>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>MSSV: <strong className="text-slate-700">{request.studentCode}</strong></span>
                <span>•</span>
                <span>Lớp: <strong className="text-slate-700">{request.className}</strong></span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                request.status === 'pending'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : request.status === 'approved'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {request.statusText}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block mb-1">Loại đơn:</span>
                <span className="font-semibold text-slate-800 text-sm">{request.requestType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Ngày gửi:</span>
                <span className="font-semibold text-slate-700">{request.submissionDate}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Học phần:</span>
              <span className="font-semibold text-blue-600">{request.courseName}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Lý do & Nội dung trình bày:</span>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-normal">
                {request.reason}
              </div>
            </div>

            {request.attachment && (
              <div>
                <span className="text-slate-400 block mb-1">Tệp đính kèm chứng minh:</span>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-700">{request.attachment}</span>
                  </div>
                  <button
                    onClick={() => alert(`Đang tải tệp: ${request.attachment}`)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải về
                  </button>
                </div>
              </div>
            )}

            {/* Note/Comment */}
            {request.status === 'pending' && (
              <div>
                <label className="text-slate-500 font-medium block mb-1">
                  Ý kiến phê duyệt của Giảng viên (tùy chọn):
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Nhập ghi chú hoặc yêu cầu bổ sung nếu có..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          {request.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  onReject(request.id, comment)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </button>

              <button
                onClick={() => {
                  onApprove(request.id, comment)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Duyệt đơn
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
