import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  Plus,
  User,
  Mail,
  Lock,
  Calendar,
  Phone,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Layers,
  CheckCircle,
  Database,
  ArrowRight
} from 'lucide-react'
import type {
  CreateStudentRequest,
  CreateStudentResponse,
  ApiStudentItem,
  ApiMajorItem,
  ApiMajorListResponse
} from '../../types'
import { getCreateStudentUrl, getMajorsUrl } from '../../config'

// Danh sách chuyên ngành dự phòng (Fallback) khi API GET /api/majors chưa khởi động
export const DEFAULT_FALLBACK_MAJORS: ApiMajorItem[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    majorCode: 'DEMO-IT',
    majorName: 'Cong nghe thong tin',
    description: null
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    majorCode: 'DEMO-SE',
    majorName: 'Ky thuat phan mem',
    description: null
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    majorCode: 'DEMO-AI',
    majorName: 'Tri tue nhan tao',
    description: null
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    majorCode: 'DEMO-BA',
    majorName: 'Quan tri kinh doanh',
    description: null
  }
]

// Dữ liệu mẫu chuẩn theo tài liệu API POST /api/students
export const API_SAMPLE_STUDENT: CreateStudentRequest = {
  email: 'new.student@example.com',
  password: 'Password123!',
  studentCode: 'STU002',
  fullName: 'Nguyen Van B',
  majorId: '00000000-0000-0000-0000-000000000001',
  enrollmentYear: 2026,
  dateOfBirth: '2007-07-14',
  gender: 'Male',
  phone: '0900000001'
}

interface CreateStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (
    createdStudent?: ApiStudentItem | CreateStudentRequest | { id: string } | Record<string, unknown>
  ) => void
  apiBaseUrl?: string
}

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  apiBaseUrl
}) => {
  // Danh sách chuyên ngành lấy từ GET /api/majors
  const [majors, setMajors] = useState<ApiMajorItem[]>(DEFAULT_FALLBACK_MAJORS)
  const [isLoadingMajors, setIsLoadingMajors] = useState<boolean>(false)
  const [majorsSource, setMajorsSource] = useState<'api' | 'fallback'>('fallback')
  const [majorsError, setMajorsError] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState<CreateStudentRequest>({
    studentCode: '',
    fullName: '',
    email: '',
    password: 'Password123!',
    majorId: DEFAULT_FALLBACK_MAJORS[0].id,
    enrollmentYear: 2026,
    dateOfBirth: '2007-07-14',
    gender: 'Male',
    phone: '0900000001'
  })

  // Quản lý Chuyên ngành tùy chỉnh
  const [isCustomMajor, setIsCustomMajor] = useState<boolean>(false)
  const [customMajorId, setCustomMajorId] = useState<string>('')

  // Hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // Trạng thái gửi API
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Trạng thái thành công
  const [createdResult, setCreatedResult] = useState<{
    studentCode: string
    fullName: string
    email: string
    password?: string
    majorName?: string
    majorCode?: string
    majorId: string
    enrollmentYear: number
    gender?: string
    phone?: string
  } | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Hàm gọi API GET /api/majors để nạp danh sách chuyên ngành thực tế từ backend
  const fetchMajors = useCallback(async () => {
    setIsLoadingMajors(true)
    setMajorsError(null)

    const token = localStorage.getItem('accessToken')
    const endpoint = apiBaseUrl
      ? `${apiBaseUrl.replace(/\/+$/, '')}/api/majors`
      : getMajorsUrl()

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.statusText})`)
      }

      const resData: ApiMajorListResponse = await response.json()
      if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
        setMajors(resData.data)
        setMajorsSource('api')
        // Tự động gán majorId đầu tiên nếu chưa có hoặc không hợp lệ
        setFormData(prev => {
          const exists = resData.data!.some(m => m.id === prev.majorId)
          if (!exists || !prev.majorId) {
            return { ...prev, majorId: resData.data![0].id }
          }
          return prev
        })
      } else {
        // Dữ liệu rỗng, giữ fallback
        setMajors(DEFAULT_FALLBACK_MAJORS)
        setMajorsSource('fallback')
      }
    } catch (err) {
      console.warn('Lỗi khi tải danh sách majors từ API /api/majors:', err)
      setMajorsError('Không thể kết nối API GET /api/majors. Hệ thống đang dùng danh mục dự phòng.')
      setMajors(DEFAULT_FALLBACK_MAJORS)
      setMajorsSource('fallback')
    } finally {
      setIsLoadingMajors(false)
    }
  }, [apiBaseUrl])

  // Tự động tải danh sách majors khi Modal được mở
  useEffect(() => {
    if (isOpen) {
      fetchMajors()
    }
  }, [isOpen, fetchMajors])

  // Lấy thông tin chi tiết của chuyên ngành đang được chọn
  const selectedMajorObj = useMemo(() => {
    const targetId = isCustomMajor ? customMajorId.trim() : formData.majorId
    return majors.find(m => m.id === targetId)
  }, [majors, formData.majorId, isCustomMajor, customMajorId])

  if (!isOpen) return null

  // Nạp dữ liệu mẫu theo đặc tả người dùng yêu cầu: STU002, Nguyen Van B, ...
  const handleLoadSampleData = () => {
    const chosenMajorId = majors.length > 0 ? majors[0].id : DEFAULT_FALLBACK_MAJORS[0].id
    setFormData({
      studentCode: 'STU002',
      fullName: 'Nguyen Van B',
      email: 'new.student@example.com',
      password: 'Password123!',
      majorId: chosenMajorId,
      enrollmentYear: 2026,
      dateOfBirth: '2007-07-14',
      gender: 'Male',
      phone: '0900000001'
    })
    setIsCustomMajor(false)
    setErrorMessage(null)
    setFieldErrors({})
  }

  // Tạo mật khẩu ngẫu nhiên an toàn
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
    let pwd = ''
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password: pwd }))
    setShowPassword(true)
  }

  // Xử lý sao chép thông tin
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Submit form POST /api/students
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setFieldErrors({})

    const finalMajorId = isCustomMajor ? customMajorId.trim() : formData.majorId

    if (!formData.studentCode.trim()) {
      setErrorMessage('Vui lòng nhập Mã sinh viên (studentCode).')
      return
    }
    if (!formData.fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và tên sinh viên (fullName).')
      return
    }
    if (!formData.email.trim()) {
      setErrorMessage('Vui lòng nhập Email sinh viên.')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Mật khẩu khởi tạo phải từ 6 ký tự trở lên.')
      return
    }
    if (!finalMajorId) {
      setErrorMessage('Vui lòng chọn hoặc nhập Mã chuyên ngành (majorId).')
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setErrorMessage(
        'Bạn chưa đăng nhập hoặc thiếu Access Token quản trị viên. Vui lòng đăng nhập lại tài khoản Admin.'
      )
      return
    }

    setIsSubmitting(true)

    // Khởi tạo payload chuẩn theo tài liệu API POST /api/students
    const payload: CreateStudentRequest = {
      email: formData.email.trim(),
      password: formData.password,
      studentCode: formData.studentCode.trim().toUpperCase(),
      fullName: formData.fullName.trim(),
      majorId: finalMajorId,
      enrollmentYear: Number(formData.enrollmentYear) || 2026,
      dateOfBirth: formData.dateOfBirth?.trim() || undefined,
      gender: formData.gender?.trim() || 'Male',
      phone: formData.phone?.trim() || undefined
    }

    try {
      const endpoint = apiBaseUrl
        ? `${apiBaseUrl.replace(/\/+$/, '')}/api/students`
        : getCreateStudentUrl()

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      // 409 Conflict: Trùng MSSV hoặc Email
      if (response.status === 409) {
        let msg = 'Mã sinh viên hoặc Email đã tồn tại trong hệ thống (409 Conflict).'
        try {
          const errJson = await response.json()
          if (errJson.message) msg = errJson.message
        } catch {
          // ignore
        }
        setErrorMessage(msg)
        return
      }

      // 400 Bad Request
      if (response.status === 400) {
        let msg = 'Tham số yêu cầu không hợp lệ (400 Bad Request).'
        try {
          const errJson = await response.json()
          if (errJson.message) msg = errJson.message
          if (errJson.errors && typeof errJson.errors === 'object') {
            setFieldErrors(errJson.errors)
          }
        } catch {
          // ignore
        }
        setErrorMessage(msg)
        return
      }

      // 401 Unauthorized
      if (response.status === 401) {
        setErrorMessage(
          'Phiên làm việc đã hết hạn hoặc không có token hợp lệ (401 Unauthorized). Vui lòng đăng nhập lại.'
        )
        return
      }

      // 403 Forbidden
      if (response.status === 403) {
        setErrorMessage(
          'Tài khoản không có quyền tạo sinh viên (403 Forbidden). Chỉ Quản trị viên (Admin) mới có quyền tạo hồ sơ sinh viên.'
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

      // 200 / 201 Success
      const resData: CreateStudentResponse = await response.json().catch(() => ({
        success: true,
        message: 'Thành công'
      }))

      setCreatedResult({
        studentCode: payload.studentCode,
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        majorId: payload.majorId,
        majorName: selectedMajorObj?.majorName || 'Chuyên ngành đã gán',
        majorCode: selectedMajorObj?.majorCode || 'DEMO',
        enrollmentYear: payload.enrollmentYear,
        gender: payload.gender,
        phone: payload.phone
      })

      if (onSuccess) {
        onSuccess(resData.data || payload)
      }
    } catch {
      setErrorMessage(
        'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra backend ASP.NET Core đang chạy.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Khởi tạo lại form để thêm sinh viên khác
  const handleResetForm = () => {
    setCreatedResult(null)
    setFormData({
      studentCode: '',
      fullName: '',
      email: '',
      password: 'Password123!',
      majorId: majors.length > 0 ? majors[0].id : DEFAULT_FALLBACK_MAJORS[0].id,
      enrollmentYear: 2026,
      dateOfBirth: '2007-07-14',
      gender: 'Male',
      phone: '0900000001'
    })
    setIsCustomMajor(false)
    setCustomMajorId('')
    setErrorMessage(null)
    setFieldErrors({})
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-800 text-base">Thêm Sinh Viên Mới</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                  POST /api/students
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  GET /api/majors
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tạo hồ sơ và cấp tài khoản sinh viên chính quy với chuyên ngành từ backend
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

        {/* Nội dung khi tạo thành công */}
        {createdResult ? (
          <div className="p-6 space-y-5 animate-in fade-in duration-300">
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-800">Tạo Sinh Viên Thành Công!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Hồ sơ sinh viên <strong>{createdResult.fullName}</strong> đã được lưu thành công vào cơ sở dữ liệu qua{' '}
                <span className="font-mono text-blue-600 font-semibold">POST /api/students</span>.
              </p>
            </div>

            {/* Thẻ thông tin tài khoản & hồ sơ cấp phát */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Thông tin tài khoản & Hồ sơ sinh viên
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* MSSV */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Mã sinh viên (MSSV)</span>
                    <span className="font-mono font-bold text-slate-800">{createdResult.studentCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(createdResult.studentCode, 'code')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Sao chép"
                  >
                    {copiedKey === 'code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Mật khẩu */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Mật khẩu ban đầu</span>
                    <span className="font-mono font-bold text-blue-600">
                      {createdResult.password || '••••••••'}
                    </span>
                  </div>
                  {createdResult.password && (
                    <button
                      onClick={() => handleCopy(createdResult.password!, 'pwd')}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Sao chép"
                    >
                      {copiedKey === 'pwd' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Email */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Email sinh viên</span>
                    <span className="font-mono font-bold text-slate-800">{createdResult.email}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(createdResult.email, 'email')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Sao chép"
                  >
                    {copiedKey === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Chuyên ngành */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Chuyên ngành đào tạo</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-slate-800">
                        {createdResult.majorCode ? `[${createdResult.majorCode}] ` : ''}
                        {createdResult.majorName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (UUID: {createdResult.majorId})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(createdResult.majorId, 'majorId')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Sao chép majorId"
                  >
                    {copiedKey === 'majorId' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetForm}
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
          /* Form nhập liệu */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Quick Helper Toolbar & API Majors Status */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-blue-900 text-[11px] font-semibold">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Nạp nhanh mẫu dữ liệu thử nghiệm (STU002 - Nguyễn Văn B)?</span>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Nạp mẫu STU002</span>
                <ArrowRight className="w-3 h-3 text-blue-600" />
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Không thể tạo sinh viên:</span>
                  <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
                  {Object.keys(fieldErrors).length > 0 && (
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-700">
                      {Object.entries(fieldErrors).map(([field, msgs]) => (
                        <li key={field}>
                          <strong>{field}:</strong> {msgs.join(', ')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Dòng 1: MSSV & Năm nhập học */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">
                  Mã sinh viên (studentCode) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="VD: STU002"
                    value={formData.studentCode}
                    onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1.5">
                  Khóa / Năm nhập học (enrollmentYear) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min={2000}
                    max={2035}
                    value={formData.enrollmentYear}
                    onChange={e => setFormData({ ...formData, enrollmentYear: Number(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Dòng 2: Họ và tên sinh viên */}
            <div>
              <label className="text-slate-700 font-bold block mb-1.5">
                Họ và tên sinh viên (fullName) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn B"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
              />
            </div>

            {/* Dòng 3: Email & Mật khẩu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">
                  Email sinh viên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="new.student@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 font-bold">
                    Mật khẩu ban đầu <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password123!"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Dòng 4: Chuyên ngành đào tạo (majorId) - Lấy từ GET /api/majors */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-slate-800 font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>
                    Chuyên ngành đào tạo (majorId) <span className="text-rose-500">*</span>
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  {/* Trạng thái tải từ GET /api/majors */}
                  {isLoadingMajors ? (
                    <span className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Đang nạp /api/majors...</span>
                    </span>
                  ) : majorsSource === 'api' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                      <CheckCircle className="w-2.5 h-2.5" />
                      <span>{majors.length} ngành từ API</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                      <span>Dự phòng offline</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={fetchMajors}
                    disabled={isLoadingMajors}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Tải lại danh sách từ GET /api/majors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMajors ? 'animate-spin' : ''}`} />
                  </button>

                  <span className="text-slate-300">|</span>

                  <button
                    type="button"
                    onClick={() => setIsCustomMajor(c => !c)}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    {isCustomMajor ? 'Chọn danh mục' : '+ Nhập UUID'}
                  </button>
                </div>
              </div>

              {majorsError && (
                <p className="text-[10px] text-amber-600 italic">{majorsError}</p>
              )}

              {isCustomMajor ? (
                <div className="space-y-1">
                  <div className="relative">
                    <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nhập UUID chuyên ngành (majorId) thực tế"
                      value={customMajorId}
                      onChange={e => setCustomMajorId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block pl-1">
                    Nhập chính xác UUID của major trong cơ sở dữ liệu nếu không có trong danh sách
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={formData.majorId}
                    onChange={e => setFormData({ ...formData, majorId: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {majors.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.majorCode ? `[${m.majorCode}] ` : ''}
                        {m.majorName}
                      </option>
                    ))}
                  </select>

                  {/* Hiển thị chi tiết Major đã chọn kèm UUID và nút sao chép */}
                  {selectedMajorObj && (
                    <div className="p-2 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between text-[11px]">
                      <div className="truncate pr-2">
                        <span className="text-slate-400 font-medium">UUID majorId: </span>
                        <span className="font-mono font-bold text-slate-700 select-all">
                          {selectedMajorObj.id}
                        </span>
                        {selectedMajorObj.description && (
                          <span className="text-slate-400 block text-[10px] truncate">
                            {selectedMajorObj.description}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedMajorObj.id, 'selectedMajorId')}
                        className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === 'selectedMajorId' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dòng 5: Ngày sinh, Giới tính, Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">
                  Ngày sinh (dateOfBirth) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1.5">
                  Giới tính (gender) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-semibold"
                >
                  <option value="Male">Nam (Male)</option>
                  <option value="Female">Nữ (Female)</option>
                  <option value="Other">Khác (Other)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1.5">Số điện thoại (phone)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0900000001"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Footer Form */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>POST /api/students</span>
              </div>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tạo sinh viên...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tạo sinh viên</span>
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
