import React, { useState } from 'react'
import {
  Award,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  LayoutGrid,
  List,
  CheckCircle2,
  X,
  UserCheck
} from 'lucide-react'

interface TeacherItem {
  id: string
  code: string
  name: string
  title: string
  faculty: string
  department: string
  email: string
  phone: string
  avatar: string
  assignedClassesCount: number
  teachingQuotaPercent: number
  status: 'active' | 'leave'
}

const INITIAL_TEACHERS: TeacherItem[] = [
  {
    id: 'tch-1',
    code: 'GV001',
    name: 'ThS. Nguyễn Văn An',
    title: 'Thạc sĩ',
    faculty: 'Khoa CNTT',
    department: 'Bộ môn Kỹ thuật Phần mềm',
    email: 'an.nguyen@harvard.edu.vn',
    phone: '0903 123 456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedClassesCount: 4,
    teachingQuotaPercent: 100,
    status: 'active'
  },
  {
    id: 'tch-2',
    code: 'GV002',
    name: 'TS. Trần Thị Mai',
    title: 'Tiến sĩ',
    faculty: 'Khoa CNTT',
    department: 'Bộ môn Khoa học Máy tính',
    email: 'mai.tran@harvard.edu.vn',
    phone: '0912 888 999',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    assignedClassesCount: 3,
    teachingQuotaPercent: 100,
    status: 'active'
  },
  {
    id: 'tch-3',
    code: 'GV003',
    name: 'ThS. Lê Quang Huy',
    title: 'Thạc sĩ',
    faculty: 'Khoa Kinh tế',
    department: 'Bộ môn Quản trị Kinh doanh',
    email: 'huy.le@harvard.edu.vn',
    phone: '0988 777 666',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedClassesCount: 5,
    teachingQuotaPercent: 110,
    status: 'active'
  },
  {
    id: 'tch-4',
    code: 'GV004',
    name: 'PGS.TS. Đỗ Hoàng Long',
    title: 'Phó Giáo sư',
    faculty: 'Khoa CNTT',
    department: 'Bộ môn Hệ thống Thông tin',
    email: 'long.do@harvard.edu.vn',
    phone: '0908 555 444',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assignedClassesCount: 3,
    teachingQuotaPercent: 95,
    status: 'active'
  },
  {
    id: 'tch-5',
    code: 'GV005',
    name: 'TS. Vũ Phương Thảo',
    title: 'Tiến sĩ',
    faculty: 'Khoa Ngoại ngữ',
    department: 'Bộ môn Tiếng Anh Chuyên ngành',
    email: 'thao.vu@harvard.edu.vn',
    phone: '0977 123 789',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assignedClassesCount: 4,
    teachingQuotaPercent: 105,
    status: 'active'
  },
  {
    id: 'tch-6',
    code: 'GV006',
    name: 'GS.TS. Phạm Quốc Bảo',
    title: 'Giáo sư',
    faculty: 'Khoa Luật & Chính sách',
    department: 'Bộ môn Luật Kinh tế',
    email: 'bao.pham@harvard.edu.vn',
    phone: '0913 456 789',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    assignedClassesCount: 2,
    teachingQuotaPercent: 90,
    status: 'active'
  }
]

export const AdminTeachersView: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherItem[]>(INITIAL_TEACHERS)
  const [search, setSearch] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newTeacher, setNewTeacher] = useState({
    code: '',
    name: '',
    title: 'Tiến sĩ',
    faculty: 'Khoa CNTT',
    department: 'Bộ môn Kỹ thuật Phần mềm',
    email: '',
    phone: ''
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase())
    const matchesFaculty = facultyFilter === 'ALL' || t.faculty === facultyFilter
    return matchesSearch && matchesFaculty
  })

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeacher.name || !newTeacher.email || !newTeacher.code) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }

    const created: TeacherItem = {
      id: `tch-${Date.now()}`,
      code: newTeacher.code,
      name: `${newTeacher.title}. ${newTeacher.name}`,
      title: newTeacher.title,
      faculty: newTeacher.faculty,
      department: newTeacher.department,
      email: newTeacher.email,
      phone: newTeacher.phone || '0900 000 000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      assignedClassesCount: 0,
      teachingQuotaPercent: 0,
      status: 'active'
    }

    setTeachers([created, ...teachers])
    setIsModalOpen(false)
    showToast(`Đã thêm giảng viên ${created.name} vào hệ thống!`)
    setNewTeacher({
      code: '',
      name: '',
      title: 'Tiến sĩ',
      faculty: 'Khoa CNTT',
      department: 'Bộ môn Kỹ thuật Phần mềm',
      email: '',
      phone: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            Danh Sách 86 Giảng Viên Toàn Trường
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Quản lý định mức giờ giảng dạy, học hàm học vị, phân công bộ môn và hồ sơ khoa học
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giảng viên</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng giảng viên</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">86</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">100% đạt chuẩn Bộ GD&ĐT</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Giáo sư & Phó GS</span>
            <span className="text-2xl font-black text-purple-700 leading-tight">14</span>
            <span className="text-[10px] text-purple-600 font-medium block mt-1">Chiếm 16.2% tổng số</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tiến sĩ (PhD)</span>
            <span className="text-2xl font-black text-blue-600 leading-tight">42</span>
            <span className="text-[10px] text-blue-500 font-medium block mt-1">Chiếm 48.8% tổng số</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Thạc sĩ (Master)</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">30</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">12 đang làm NCS</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
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
              placeholder="Tìm theo tên giảng viên, mã số, bộ môn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={facultyFilter}
              onChange={e => setFacultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="ALL">Tất cả các khoa</option>
              <option value="Khoa CNTT">Khoa CNTT</option>
              <option value="Khoa Kinh tế">Khoa Kinh tế</option>
              <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
              <option value="Khoa Luật & Chính sách">Khoa Luật & Chính sách</option>
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

      {/* Teachers Content: Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map(teacher => (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {teacher.code}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Đang công tác
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mt-1">{teacher.name}</h3>
                      <p className="text-[11px] text-rose-600 font-medium">{teacher.faculty}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{teacher.phone}</span>
                  </div>
                </div>
              </div>

              {/* Teaching Quota Progress */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 text-[11px]">Định mức giảng dạy:</span>
                  <span
                    className={`font-bold text-[11px] ${
                      teacher.teachingQuotaPercent >= 100 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {teacher.teachingQuotaPercent}% ({teacher.assignedClassesCount} lớp)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      teacher.teachingQuotaPercent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(teacher.teachingQuotaPercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Mã GV</th>
                  <th className="py-3 px-4 font-bold">Họ và tên</th>
                  <th className="py-3 px-4 font-bold">Khoa / Bộ môn</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold text-center">Số lớp phụ trách</th>
                  <th className="py-3 px-4 font-bold text-center">Tải giảng dạy</th>
                  <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-600">{t.code}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-bold text-slate-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{t.faculty}</div>
                      <div className="text-[11px] text-slate-400">{t.department}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{t.email}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{t.assignedClassesCount} lớp</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          t.teachingQuotaPercent >= 100
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {t.teachingQuotaPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        Đang công tác
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm giảng viên mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Thêm giảng viên mới</h3>
                  <p className="text-[11px] text-slate-400">Tạo tài khoản hồ sơ giảng viên toàn trường</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã GV</label>
                  <input
                    type="text"
                    required
                    placeholder="GV007"
                    value={newTeacher.code}
                    onChange={e => setNewTeacher({ ...newTeacher, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Học vị / Học hàm</label>
                  <select
                    value={newTeacher.title}
                    onChange={e => setNewTeacher({ ...newTeacher, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="ThS">ThS</option>
                    <option value="TS">TS</option>
                    <option value="PGS.TS">PGS.TS</option>
                    <option value="GS.TS">GS.TS</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newTeacher.name}
                    onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Khoa trực thuộc</label>
                  <select
                    value={newTeacher.faculty}
                    onChange={e => setNewTeacher({ ...newTeacher, faculty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 bg-white"
                  >
                    <option value="Khoa CNTT">Khoa CNTT</option>
                    <option value="Khoa Kinh tế">Khoa Kinh tế</option>
                    <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                    <option value="Khoa Luật & Chính sách">Khoa Luật & Chính sách</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Bộ môn</label>
                  <input
                    type="text"
                    required
                    placeholder="Bộ môn Kỹ thuật Phần mềm"
                    value={newTeacher.department}
                    onChange={e => setNewTeacher({ ...newTeacher, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@harvard.edu.vn"
                    value={newTeacher.email}
                    onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0912 345 678"
                    value={newTeacher.phone}
                    onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Lưu giảng viên
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
