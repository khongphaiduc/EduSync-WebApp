import React, { useState } from 'react'
import {
  Calendar,
  Plus,
  CheckCircle2,
  CalendarDays,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'

interface SemesterItem {
  id: string
  code: string
  name: string
  academicYear: string
  startDate: string
  endDate: string
  registrationStatus: 'open' | 'closed' | 'upcoming'
  isCurrent: boolean
  tuitionDeadline: string
  midtermDates: string
  finalExamDates: string
  gradesDeadline: string
}

const INITIAL_SEMESTERS: SemesterItem[] = [
  {
    id: 'sem-1',
    code: '20261',
    name: 'Học kỳ 1 (Fall Semester)',
    academicYear: '2026 - 2027',
    startDate: '05/09/2026',
    endDate: '15/01/2027',
    registrationStatus: 'closed',
    isCurrent: true,
    tuitionDeadline: '30/10/2026',
    midtermDates: '01/11/2026 - 10/11/2026',
    finalExamDates: '02/01/2027 - 12/01/2027',
    gradesDeadline: '20/01/2027'
  },
  {
    id: 'sem-2',
    code: '20262',
    name: 'Học kỳ 2 (Spring Semester)',
    academicYear: '2026 - 2027',
    startDate: '15/02/2027',
    endDate: '25/06/2027',
    registrationStatus: 'upcoming',
    isCurrent: false,
    tuitionDeadline: '15/03/2027',
    midtermDates: '15/04/2027 - 25/04/2027',
    finalExamDates: '10/06/2027 - 20/06/2027',
    gradesDeadline: '30/06/2027'
  },
  {
    id: 'sem-3',
    code: '20263',
    name: 'Học kỳ Phụ / Hè (Summer Term)',
    academicYear: '2026 - 2027',
    startDate: '01/07/2027',
    endDate: '20/08/2027',
    registrationStatus: 'upcoming',
    isCurrent: false,
    tuitionDeadline: '10/07/2027',
    midtermDates: '25/07/2027',
    finalExamDates: '15/08/2027 - 18/08/2027',
    gradesDeadline: '25/08/2027'
  },
  {
    id: 'sem-4',
    code: '20252',
    name: 'Học kỳ 2 (Spring Semester)',
    academicYear: '2025 - 2026',
    startDate: '16/02/2026',
    endDate: '26/06/2026',
    registrationStatus: 'closed',
    isCurrent: false,
    tuitionDeadline: '15/03/2026',
    midtermDates: '15/04/2026',
    finalExamDates: '12/06/2026',
    gradesDeadline: '01/07/2026'
  }
]

export const AdminSemestersView: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterItem[]>(INITIAL_SEMESTERS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newSemester, setNewSemester] = useState({
    code: '',
    name: 'Học kỳ 1',
    academicYear: '2027 - 2028',
    startDate: '05/09/2027',
    endDate: '15/01/2028',
    tuitionDeadline: '30/10/2027',
    gradesDeadline: '20/01/2028'
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSetActive = (id: string) => {
    setSemesters(prev =>
      prev.map(s => ({
        ...s,
        isCurrent: s.id === id
      }))
    )
    const target = semesters.find(s => s.id === id)
    showToast(`Đã thiết lập ${target?.name} (${target?.academicYear}) làm học kỳ hoạt động chính!`)
  }

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSemester.code) {
      alert('Vui lòng nhập mã học kỳ.')
      return
    }

    const created: SemesterItem = {
      id: `sem-${Date.now()}`,
      code: newSemester.code,
      name: newSemester.name,
      academicYear: newSemester.academicYear,
      startDate: newSemester.startDate,
      endDate: newSemester.endDate,
      registrationStatus: 'upcoming',
      isCurrent: false,
      tuitionDeadline: newSemester.tuitionDeadline,
      midtermDates: 'Đang cập nhật',
      finalExamDates: 'Đang cập nhật',
      gradesDeadline: newSemester.gradesDeadline
    }

    setSemesters([created, ...semesters])
    setIsModalOpen(false)
    showToast(`Đã tạo mới ${created.name} (${created.academicYear}) thành công!`)
  }

  const currentSem = semesters.find(s => s.isCurrent) || semesters[0]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            Quản Lý Học Kỳ & Niên Khóa Đào Tạo
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Thiết lập mốc thời gian đăng ký tín chỉ, hạn nộp học phí, lịch thi và thời hạn chốt sổ điểm
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học kỳ mới</span>
        </button>
      </div>

      {/* Active Semester Spotlight Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 flex items-center justify-center pointer-events-none">
          <CalendarDays className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Học kỳ hiện tại đang diễn ra</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{currentSem.name}</h2>
            <p className="text-blue-100 text-sm mt-1">
              Niên khóa: <strong className="text-white">{currentSem.academicYear}</strong> • Mã hệ thống:{' '}
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs">{currentSem.code}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <div>
              <span className="text-[10px] text-blue-200 block">Ngày bắt đầu</span>
              <strong className="text-sm font-bold text-white">{currentSem.startDate}</strong>
            </div>
            <div>
              <span className="text-[10px] text-blue-200 block">Ngày kết thúc</span>
              <strong className="text-sm font-bold text-white">{currentSem.endDate}</strong>
            </div>
            <div>
              <span className="text-[10px] text-blue-200 block">Hạn đóng học phí</span>
              <strong className="text-sm font-bold text-amber-300">{currentSem.tuitionDeadline}</strong>
            </div>
            <div>
              <span className="text-[10px] text-blue-200 block">Hạn nộp điểm GV</span>
              <strong className="text-sm font-bold text-emerald-300">{currentSem.gradesDeadline}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Semesters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {semesters.map(sem => (
          <div
            key={sem.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
              sem.isCurrent ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Mã: {sem.code}
                    </span>
                    {sem.isCurrent && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Đang diễn ra
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mt-2">{sem.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Năm học {sem.academicYear}</p>
                </div>

                {!sem.isCurrent ? (
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
                  <span className="text-[10px] text-slate-400 block font-medium">Thời gian học tập:</span>
                  <strong className="text-slate-700 text-xs">
                    {sem.startDate} - {sem.endDate}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Đăng ký tín chỉ:</span>
                  <span
                    className={`font-bold text-xs ${
                      sem.registrationStatus === 'open'
                        ? 'text-emerald-600'
                        : sem.registrationStatus === 'upcoming'
                        ? 'text-blue-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {sem.registrationStatus === 'open'
                      ? 'Đang mở đăng ký'
                      : sem.registrationStatus === 'upcoming'
                      ? 'Chưa mở'
                      : 'Đã đóng cổng'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Hạn nộp học phí:</span>
                  <strong className="text-slate-700 text-xs">{sem.tuitionDeadline}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Hạn nộp bảng điểm:</span>
                  <strong className="text-slate-700 text-xs">{sem.gradesDeadline}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Trạng thái: Đã đồng bộ máy chủ đào tạo</span>
              <button
                onClick={() => showToast(`Cấu hình chi tiết học kỳ ${sem.code}`)}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Cấu hình mốc thời gian</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
                  <p className="text-[11px] text-slate-400">Tạo niên khóa và các mốc học vụ mới</p>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã học kỳ</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 20271"
                    value={newSemester.code}
                    onChange={e => setNewSemester({ ...newSemester, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Niên khóa</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 2027 - 2028"
                    value={newSemester.academicYear}
                    onChange={e => setNewSemester({ ...newSemester, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên học kỳ</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Học kỳ 1 (Fall Semester)"
                  value={newSemester.name}
                  onChange={e => setNewSemester({ ...newSemester, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Ngày bắt đầu</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={newSemester.startDate}
                    onChange={e => setNewSemester({ ...newSemester, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Ngày kết thúc</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={newSemester.endDate}
                    onChange={e => setNewSemester({ ...newSemester, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Hạn nộp học phí</label>
                  <input
                    type="text"
                    value={newSemester.tuitionDeadline}
                    onChange={e => setNewSemester({ ...newSemester, tuitionDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Hạn nộp bảng điểm</label>
                  <input
                    type="text"
                    value={newSemester.gradesDeadline}
                    onChange={e => setNewSemester({ ...newSemester, gradesDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Lưu học kỳ
                </button>
              </div>
            </form>
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
