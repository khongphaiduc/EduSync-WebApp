import React, { useState } from 'react'
import {
  X,
  UserPlus,
  User,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Users,
  Copy,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import type {
  ApiCourseSectionItem,
  EnrollStudentToSectionRequest,
  EnrollStudentToSectionResponse,
  EnrollStudentToSectionResult
} from '../../types'
import { getAddStudentToSectionUrl } from '../../config'

interface AddStudentToSectionModalProps {
  isOpen: boolean
  section: ApiCourseSectionItem | null
  currentEnrolledCount?: number
  onClose: () => void
  onSuccess: (result: EnrollStudentToSectionResult) => void
  apiBaseUrl?: string
}

export const AddStudentToSectionModal: React.FC<AddStudentToSectionModalProps> = ({
  isOpen,
  section,
  currentEnrolledCount,
  onClose,
  onSuccess,
  apiBaseUrl
}) => {
  const [studentCode, setStudentCode] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [createdResult, setCreatedResult] = useState<EnrollStudentToSectionResult | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!isOpen || !section) return null

  // Xử lý sao chép
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Nạp nhanh mã sinh viên mẫu
  const handleQuickSelectCode = (code: string) => {
    setStudentCode(code)
    setErrorMessage(null)
  }

  // Submit POST /api/course-sections/{sectionId}/students
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanCode = studentCode.trim().toUpperCase()
    if (!cleanCode) {
      setErrorMessage('Vui lòng nhập Mã sinh viên (studentCode).')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setErrorMessage(
        'Phiên làm việc đã hết hạn hoặc thiếu Token quản trị viên. Vui lòng đăng nhập lại.'
      )
      return
    }

    setIsSubmitting(true)

    const payload: EnrollStudentToSectionRequest = {
      studentCode: cleanCode
    }

    try {
      const endpoint = apiBaseUrl
        ? `${apiBaseUrl.replace(/\/+$/, '')}/api/course-sections/${section.id}/students`
        : getAddStudentToSectionUrl(section.id)

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      // 409 Conflict: Đã đăng ký trước đó
      if (response.status === 409) {
        let msg = `Sinh viên ${cleanCode} đã đăng ký lớp học phần này trước đó (409 Conflict).`
        try {
          const errJson = await response.json()
          if (errJson.message) msg = errJson.message
        } catch {
          // ignore
        }
        setErrorMessage(msg)
        return
      }

      // 400 Bad Request: Lớp đóng, hết chỗ, SV không hoạt động, v.v.
      if (response.status === 400) {
        let msg = 'Yêu cầu không hợp lệ (400 Bad Request).'
        try {
          const errJson = await response.json()
          if (errJson.message) msg = errJson.message
        } catch {
          // ignore
        }
        setErrorMessage(msg)
        return
      }

      // 404 Not Found: Không tìm thấy sinh viên hoặc lớp
      if (response.status === 404) {
        let msg = `Không tìm thấy sinh viên có mã "${cleanCode}" hoặc lớp không tồn tại (404 Not Found).`
        try {
          const errJson = await response.json()
          if (errJson.message) msg = errJson.message
        } catch {
          // ignore
        }
        setErrorMessage(msg)
        return
      }

      // 401 Unauthorized
      if (response.status === 401) {
        setErrorMessage('Phiên làm việc đã hết hạn (401 Unauthorized). Vui lòng đăng nhập lại.')
        return
      }

      // 403 Forbidden
      if (response.status === 403) {
        setErrorMessage(
          'Tài khoản không có quyền thêm sinh viên vào lớp (403 Forbidden). Chỉ Quản trị viên mới có quyền này.'
        )
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
        setErrorMessage(errDetail)
        return
      }

      // 201 Created (hoặc 200)
      const resJson: EnrollStudentToSectionResponse | EnrollStudentToSectionResult =
        await response.json().catch(() => ({
          studentId: '',
          courseSectionId: section.id,
          enrolledAt: new Date().toISOString(),
          status: 'Enrolled'
        }))

      // Chuẩn hóa dữ liệu kết quả
      let resultData: EnrollStudentToSectionResult
      if ('data' in resJson && resJson.data) {
        resultData = {
          ...resJson.data,
          studentCode: resJson.data.studentCode || cleanCode
        }
      } else {
        resultData = {
          ...(resJson as EnrollStudentToSectionResult),
          studentCode: (resJson as EnrollStudentToSectionResult).studentCode || cleanCode
        }
      }

      setCreatedResult(resultData)
      onSuccess(resultData)
    } catch {
      setErrorMessage(
        'Không thể kết nối đến máy chủ API backend. Vui lòng kiểm tra cổng HTTPS 7249 đang chạy.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Khởi tạo lại để thêm sinh viên khác
  const handleReset = () => {
    setCreatedResult(null)
    setStudentCode('')
    setErrorMessage(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-800 text-base">Thêm Sinh Viên Vào Lớp</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                  POST API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ghi danh sinh viên trực tiếp vào lớp học phần (Phòng Đào Tạo)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông tin lớp học phần mục tiêu */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
              {section.sectionCode}
            </span>
            <span className="text-slate-600 truncate font-semibold">
              {section.courseName || section.courseCode}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[11px]">
            <span className="flex items-center gap-1 text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {currentEnrolledCount !== undefined ? `${currentEnrolledCount}/` : ''}
                {section.capacity} chỗ
              </span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                section.status === 'Open'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {section.status === 'Open' ? 'Đang mở' : section.status || 'Mở'}
            </span>
          </div>
        </div>

        {/* Nội dung khi thêm thành công */}
        {createdResult ? (
          <div className="p-6 space-y-5 animate-in fade-in duration-300">
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-800">Ghi Danh Thành Công!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Sinh viên có mã <strong>{createdResult.studentCode}</strong> đã được ghi danh vào lớp học phần{' '}
                <strong>{section.sectionCode}</strong>.
              </p>
            </div>

            {/* Chi tiết đăng ký */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Thông tin ghi danh (201 Created)
              </span>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Mã sinh viên:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {createdResult.studentCode}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">UUID Sinh viên (studentId):</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-slate-700 select-all">
                      {createdResult.studentId || 'Chưa gán'}
                    </span>
                    {createdResult.studentId && (
                      <button
                        onClick={() => handleCopy(createdResult.studentId, 'studentId')}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Sao chép"
                      >
                        {copiedKey === 'studentId' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Trạng thái ghi danh:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {createdResult.status || 'Enrolled'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-500">Thời gian ghi danh (enrolledAt):</span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {createdResult.enrolledAt
                      ? new Date(createdResult.enrolledAt).toLocaleString('vi-VN')
                      : new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                + Thêm sinh viên khác
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Form nhập MSSV */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Quick Helper */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-blue-900 text-[11px] font-semibold">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Chọn nhanh mã sinh viên mẫu thử nghiệm:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['STU001', 'STU002', 'STU003', 'STU004', 'STU005'].map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleQuickSelectCode(code)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 hover:text-blue-700 border border-blue-200 rounded-lg font-mono font-bold text-[11px] text-blue-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Không thể thêm sinh viên vào lớp:</span>
                  <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Input Student Code */}
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">
                Mã sinh viên (studentCode) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="VD: STU001 hoặc STU002"
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold tracking-wider"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Nhập chính xác mã sinh viên đã tồn tại trong cơ sở dữ liệu.
              </span>
            </div>

            {/* Security & Validation Notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Quy trình kiểm tra tự động của máy chủ:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                <li>Tra cứu thông tin sinh viên theo <code className="font-mono text-blue-600">studentCode</code></li>
                <li>Kiểm tra lớp học phần còn mở và còn chỗ trống (sĩ số &lt; capacity)</li>
                <li>Xác minh hồ sơ sinh viên đang ở trạng thái hoạt động (Active)</li>
                <li>Đảm bảo sinh viên chưa đăng ký lớp học phần này trước đó</li>
              </ul>
            </div>

            {/* Footer Form */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[220px]">
                POST /api/course-sections/{section.id.substring(0, 8)}.../students
              </span>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !studentCode.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kiểm tra & thêm...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Thêm vào lớp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
