import React, { useState } from 'react'
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  X
} from 'lucide-react'

interface AdminSectionItem {
  id: string
  code: string
  subjectName: string
  subjectCode: string
  credits: number
  teacherName: string
  room: string
  schedule: string
  enrolled: number
  capacity: number
  semester: string
  status: 'active' | 'upcoming' | 'completed'
  statusText: string
  gradeSubmitted: boolean
}

const INITIAL_SECTIONS: AdminSectionItem[] = [
  {
    id: 'sec-1',
    code: 'SE1623.1',
    subjectName: 'Lập trình Web nâng cao',
    subjectCode: 'INT3115',
    credits: 3,
    teacherName: 'ThS. Nguyễn Văn An',
    room: 'Phòng A402 - Tòa A',
    schedule: 'Thứ Ba (Tiết 1 - 3)',
    enrolled: 45,
    capacity: 50,
    semester: 'HK1 2026 - 2027',
    status: 'active',
    statusText: 'Đang diễn ra',
    gradeSubmitted: false
  },
  {
    id: 'sec-2',
    code: 'SE1234.2',
    subjectName: 'Cơ sở dữ liệu quan hệ',
    subjectCode: 'INT2204',
    credits: 4,
    teacherName: 'TS. Trần Thị Mai',
    room: 'Phòng A301 - Tòa A',
    schedule: 'Thứ Ba (Tiết 4 - 6)',
    enrolled: 38,
    capacity: 40,
    semester: 'HK1 2026 - 2027',
    status: 'active',
    statusText: 'Đang diễn ra',
    gradeSubmitted: false
  },
  {
    id: 'sec-3',
    code: 'SE1710.1',
    subjectName: 'Phát triển ứng dụng di động',
    subjectCode: 'INT3306',
    credits: 3,
    teacherName: 'ThS. Lê Quang Huy',
    room: 'Phòng B201 - Tòa B',
    schedule: 'Thứ Ba (Tiết 7 - 9)',
    enrolled: 42,
    capacity: 45,
    semester: 'HK1 2026 - 2027',
    status: 'active',
    statusText: 'Đang diễn ra',
    gradeSubmitted: false
  },
  {
    id: 'sec-4',
    code: 'SE1805.1',
    subjectName: 'Kiến trúc phần mềm',
    subjectCode: 'INT3105',
    credits: 3,
    teacherName: 'PGS.TS. Đỗ Hoàng Long',
    room: 'Phòng A205 - Tòa A',
    schedule: 'Thứ Năm (Tiết 1 - 3)',
    enrolled: 31,
    capacity: 40,
    semester: 'HK1 2026 - 2027',
    status: 'upcoming',
    statusText: 'Chưa bắt đầu',
    gradeSubmitted: false
  },
  {
    id: 'sec-5',
    code: 'BSA2001.3',
    subjectName: 'Nguyên lý kinh tế vi mô',
    subjectCode: 'BSA2001',
    credits: 3,
    teacherName: 'TS. Vũ Phương Thảo',
    room: 'Hội trường C101',
    schedule: 'Thứ Sáu (Tiết 7 - 9)',
    enrolled: 80,
    capacity: 80,
    semester: 'HK1 2026 - 2027',
    status: 'active',
    statusText: 'Đang diễn ra',
    gradeSubmitted: false
  },
  {
    id: 'sec-6',
    code: 'INT1001.5',
    subjectName: 'Tin học đại cương',
    subjectCode: 'INT1001',
    credits: 3,
    teacherName: 'ThS. Nguyễn Văn An',
    room: 'Phòng Máy 1 - Tòa B',
    schedule: 'Thứ Bảy (Tiết 1 - 3)',
    enrolled: 40,
    capacity: 40,
    semester: 'HK2 2025 - 2026',
    status: 'completed',
    statusText: 'Đã kết thúc',
    gradeSubmitted: true
  }
]

export const AdminSectionsView: React.FC = () => {
  const [sections, setSections] = useState<AdminSectionItem[]>(INITIAL_SECTIONS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [semesterFilter, setSemesterFilter] = useState('HK1 2026 - 2027')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newSection, setNewSection] = useState({
    code: '',
    subjectName: 'Lập trình Web nâng cao',
    subjectCode: 'INT3115',
    credits: 3,
    teacherName: 'ThS. Nguyễn Văn An',
    room: 'Phòng A402 - Tòa A',
    schedule: 'Thứ Hai (Tiết 1 - 3)',
    capacity: 50,
    semester: 'HK1 2026 - 2027'
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredSections = sections.filter(sec => {
    const matchesSearch =
      sec.code.toLowerCase().includes(search.toLowerCase()) ||
      sec.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      sec.teacherName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || sec.status === statusFilter
    const matchesSemester = semesterFilter === 'ALL' || sec.semester === semesterFilter
    return matchesSearch && matchesStatus && matchesSemester
  })

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSection.code) {
      alert('Vui lòng nhập mã lớp học phần.')
      return
    }

    const created: AdminSectionItem = {
      id: `sec-${Date.now()}`,
      code: newSection.code,
      subjectName: newSection.subjectName,
      subjectCode: newSection.subjectCode,
      credits: newSection.credits,
      teacherName: newSection.teacherName,
      room: newSection.room,
      schedule: newSection.schedule,
      enrolled: 0,
      capacity: newSection.capacity,
      semester: newSection.semester,
      status: 'upcoming',
      statusText: 'Chưa bắt đầu',
      gradeSubmitted: false
    }

    setSections([created, ...sections])
    setIsModalOpen(false)
    showToast(`Đã mở thành công lớp học phần ${created.code} (${created.subjectName})!`)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            Quản Lý 256 Lớp Học Phần (Học Kỳ 1, 2026 - 2027)
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Theo dõi sĩ số sinh viên đăng ký, giảng viên phụ trách, phòng học và tiến độ nộp bảng điểm
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Mở lớp học phần mới</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng lớp mở</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">256</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">↑ 8.7% so với kỳ trước</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang diễn ra</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">62</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Chiếm 24.2%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Chưa bắt đầu</span>
            <span className="text-2xl font-black text-blue-600 leading-tight">150</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Đợt học phần nửa kỳ sau</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã nộp điểm</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">44</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Học phần kết thúc sớm</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã lớp, tên môn học, giảng viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Tất cả học kỳ</option>
            <option value="HK1 2026 - 2027">HK1 2026 - 2027</option>
            <option value="HK2 2025 - 2026">HK2 2025 - 2026</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">Đang diễn ra</option>
            <option value="upcoming">Chưa bắt đầu</option>
            <option value="completed">Đã kết thúc</option>
          </select>
        </div>
      </div>

      {/* Sections Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Mã lớp</th>
                <th className="py-3.5 px-4 font-bold">Môn học</th>
                <th className="py-3.5 px-4 font-bold">Giảng viên</th>
                <th className="py-3.5 px-4 font-bold">Thời khóa biểu & Phòng</th>
                <th className="py-3.5 px-4 font-bold text-center">Sĩ số (Đã ĐK / Tối đa)</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái lớp</th>
                <th className="py-3.5 px-4 font-bold text-center">Sổ điểm</th>
                <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSections.map(sec => {
                const fillPercent = Math.round((sec.enrolled / sec.capacity) * 100)

                return (
                  <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">{sec.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{sec.subjectName}</div>
                      <div className="text-[11px] text-slate-400">
                        {sec.subjectCode} • {sec.credits} TC
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{sec.teacherName}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{sec.schedule}</div>
                      <div className="text-[11px] text-slate-500">{sec.room}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700">
                        <span>{sec.enrolled}</span>
                        <span className="text-slate-400">/</span>
                        <span>{sec.capacity} SV</span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fillPercent >= 100
                              ? 'bg-rose-500'
                              : fillPercent >= 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(fillPercent, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                          sec.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : sec.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {sec.statusText}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {sec.gradeSubmitted ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Đã khóa điểm
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                          Chưa nộp
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showToast(`Xem danh sách sinh viên lớp ${sec.code}`)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mở lớp học phần mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Mở lớp học phần mới</h3>
                  <p className="text-[11px] text-slate-400">Đăng ký lớp học phần cho kỳ học hiện hành</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã lớp học phần</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SE1623.2"
                    value={newSection.code}
                    onChange={e => setNewSection({ ...newSection, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Sĩ số tối đa</label>
                  <input
                    type="number"
                    value={newSection.capacity}
                    onChange={e => setNewSection({ ...newSection, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Môn học đào tạo</label>
                <select
                  value={newSection.subjectName}
                  onChange={e => setNewSection({ ...newSection, subjectName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-white"
                >
                  <option value="Lập trình Web nâng cao">INT3115 - Lập trình Web nâng cao (3 TC)</option>
                  <option value="Cơ sở dữ liệu quan hệ">INT2204 - Cơ sở dữ liệu quan hệ (4 TC)</option>
                  <option value="Phát triển ứng dụng di động">INT3306 - Phát triển ứng dụng di động (3 TC)</option>
                  <option value="Kiến trúc phần mềm">INT3105 - Kiến trúc phần mềm (3 TC)</option>
                  <option value="Nguyên lý kinh tế vi mô">BSA2001 - Nguyên lý kinh tế vi mô (3 TC)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Giảng viên giảng dạy</label>
                  <select
                    value={newSection.teacherName}
                    onChange={e => setNewSection({ ...newSection, teacherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-white"
                  >
                    <option value="ThS. Nguyễn Văn An">ThS. Nguyễn Văn An (Khoa CNTT)</option>
                    <option value="TS. Trần Thị Mai">TS. Trần Thị Mai (Khoa CNTT)</option>
                    <option value="ThS. Lê Quang Huy">ThS. Lê Quang Huy (Khoa Kinh tế)</option>
                    <option value="PGS.TS. Đỗ Hoàng Long">PGS.TS. Đỗ Hoàng Long (Khoa CNTT)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Phòng học</label>
                  <input
                    type="text"
                    value={newSection.room}
                    onChange={e => setNewSection({ ...newSection, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Thời khóa biểu</label>
                <input
                  type="text"
                  placeholder="VD: Thứ Ba (Tiết 1 - 3)"
                  value={newSection.schedule}
                  onChange={e => setNewSection({ ...newSection, schedule: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Lưu lớp học phần
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
