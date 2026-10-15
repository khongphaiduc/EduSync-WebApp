import React, { useState } from 'react'
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Users,
  Sparkles,
  Download,
  Layers
} from 'lucide-react'

interface AssignmentRow {
  sectionId: string
  sectionCode: string
  subjectName: string
  credits: number
  schedule: string
  room: string
  assignedTeacher: string
  assignedTeacherId: string
  status: 'assigned' | 'unassigned'
  workloadHours: number
}

const INITIAL_ASSIGNMENTS: AssignmentRow[] = [
  {
    sectionId: 'sec-1',
    sectionCode: 'SE1623.1',
    subjectName: 'Lập trình Web nâng cao',
    credits: 3,
    schedule: 'Thứ Ba (Tiết 1 - 3)',
    room: 'A402',
    assignedTeacher: 'ThS. Nguyễn Văn An',
    assignedTeacherId: 'GV001',
    status: 'assigned',
    workloadHours: 3
  },
  {
    sectionId: 'sec-2',
    sectionCode: 'SE1234.2',
    subjectName: 'Cơ sở dữ liệu quan hệ',
    credits: 4,
    schedule: 'Thứ Ba (Tiết 4 - 6)',
    room: 'A301',
    assignedTeacher: 'TS. Trần Thị Mai',
    assignedTeacherId: 'GV002',
    status: 'assigned',
    workloadHours: 4
  },
  {
    sectionId: 'sec-3',
    sectionCode: 'SE1710.1',
    subjectName: 'Phát triển ứng dụng di động',
    credits: 3,
    schedule: 'Thứ Ba (Tiết 7 - 9)',
    room: 'B201',
    assignedTeacher: 'ThS. Lê Quang Huy',
    assignedTeacherId: 'GV003',
    status: 'assigned',
    workloadHours: 3
  },
  {
    sectionId: 'sec-4',
    sectionCode: 'SE1805.1',
    subjectName: 'Kiến trúc phần mềm',
    credits: 3,
    schedule: 'Thứ Năm (Tiết 1 - 3)',
    room: 'A205',
    assignedTeacher: 'PGS.TS. Đỗ Hoàng Long',
    assignedTeacherId: 'GV004',
    status: 'assigned',
    workloadHours: 3
  },
  {
    sectionId: 'sec-5',
    sectionCode: 'INT3500.1',
    subjectName: 'Điện toán đám mây & DevOps',
    credits: 3,
    schedule: 'Thứ Sáu (Tiết 4 - 6)',
    room: 'A401',
    assignedTeacher: '',
    assignedTeacherId: '',
    status: 'unassigned',
    workloadHours: 3
  },
  {
    sectionId: 'sec-6',
    sectionCode: 'INT3900.2',
    subjectName: 'Học máy & Khai phá dữ liệu',
    credits: 3,
    schedule: 'Thứ Bảy (Tiết 1 - 3)',
    room: 'B302',
    assignedTeacher: '',
    assignedTeacherId: '',
    status: 'unassigned',
    workloadHours: 3
  }
]

const AVAILABLE_TEACHERS = [
  { id: 'GV001', name: 'ThS. Nguyễn Văn An', faculty: 'Khoa CNTT', currentHours: 12 },
  { id: 'GV002', name: 'TS. Trần Thị Mai', faculty: 'Khoa CNTT', currentHours: 9 },
  { id: 'GV003', name: 'ThS. Lê Quang Huy', faculty: 'Khoa Kinh tế', currentHours: 15 },
  { id: 'GV004', name: 'PGS.TS. Đỗ Hoàng Long', faculty: 'Khoa CNTT', currentHours: 9 },
  { id: 'GV005', name: 'TS. Vũ Phương Thảo', faculty: 'Khoa Ngoại ngữ', currentHours: 12 }
]

export const AdminAssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentRow[]>(INITIAL_ASSIGNMENTS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'assigned' | 'unassigned'>('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleTeacherChange = (sectionId: string, teacherName: string) => {
    setAssignments(prev =>
      prev.map(item => {
        if (item.sectionId === sectionId) {
          const teacher = AVAILABLE_TEACHERS.find(t => t.name === teacherName)
          return {
            ...item,
            assignedTeacher: teacherName,
            assignedTeacherId: teacher ? teacher.id : '',
            status: teacherName ? 'assigned' : 'unassigned'
          }
        }
        return item
      })
    )
    if (teacherName) {
      showToast(`Đã phân công ${teacherName} phụ trách lớp thành công!`)
    } else {
      showToast('Đã hủy phân công lớp học phần.')
    }
  }

  const handleAutoAssign = () => {
    setAssignments(prev =>
      prev.map(item => {
        if (!item.assignedTeacher) {
          return {
            ...item,
            assignedTeacher: 'TS. Trần Thị Mai',
            assignedTeacherId: 'GV002',
            status: 'assigned'
          }
        }
        return item
      })
    )
    showToast('Hệ thống AI đã tự động đề xuất phân công các lớp còn trống!')
  }

  const filtered = assignments.filter(item => {
    const matchQuery =
      item.sectionCode.toLowerCase().includes(search.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      item.assignedTeacher.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || item.status === filterStatus
    return matchQuery && matchStatus
  })

  const unassignedCount = assignments.filter(a => a.status === 'unassigned').length
  const assignedCount = assignments.filter(a => a.status === 'assigned').length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            Phân Công Giảng Dạy & Điều Phối Giảng Viên
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Phân bổ giảng viên phụ trách học phần, kiểm tra trùng lịch dạy và cân bằng định mức giờ chuẩn
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => showToast('Đang tải danh sách phân công ra file Excel...')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất phân công</span>
          </button>

          <button
            onClick={handleAutoAssign}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gợi ý phân công AI</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng lớp học phần</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">256</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">HK1 2026 - 2027</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã phân công</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">{assignedCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đạt 96.8% tiến độ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Chưa phân công</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">{unassignedCount}</span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">Cần bổ nhiệm trước 30/10</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tải TB giảng viên</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">14.2h</span>
            <span className="text-[10px] text-purple-500 font-medium block mt-1">Chuẩn: 12 - 15h / tuần</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã lớp, môn học, giảng viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({assignments.length})
          </button>
          <button
            onClick={() => setFilterStatus('assigned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === 'assigned'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đã phân công ({assignedCount})
          </button>
          <button
            onClick={() => setFilterStatus('unassigned')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterStatus === 'unassigned'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Chưa phân công ({unassignedCount})
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Mã lớp</th>
                <th className="py-3.5 px-4 font-bold">Môn học</th>
                <th className="py-3.5 px-4 font-bold">Thời khóa biểu & Phòng</th>
                <th className="py-3.5 px-4 font-bold text-center">Tín chỉ</th>
                <th className="py-3.5 px-4 font-bold">Giảng viên đảm nhiệm</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(row => (
                <tr key={row.sectionId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{row.sectionCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{row.subjectName}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{row.schedule}</div>
                    <div className="text-[11px] text-slate-500">Phòng {row.room}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{row.credits} TC</td>
                  <td className="py-3 px-4">
                    <select
                      value={row.assignedTeacher}
                      onChange={e => handleTeacherChange(row.sectionId, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                        row.status === 'assigned'
                          ? 'border-slate-200 text-slate-800 bg-white'
                          : 'border-rose-300 text-rose-700 bg-rose-50/60'
                      }`}
                    >
                      <option value="">-- Chưa chọn giảng viên --</option>
                      {AVAILABLE_TEACHERS.map(t => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.faculty} - Hiện có {t.currentHours}h)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.status === 'assigned' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Đã phân công
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" /> Chưa phân công
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        showToast(`Kiểm tra xung đột lịch dạy của lớp ${row.sectionCode}: Không phát hiện trùng lịch!`)
                      }
                      className="px-2.5 py-1 text-[11px] font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Kiểm tra lịch
                    </button>
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
