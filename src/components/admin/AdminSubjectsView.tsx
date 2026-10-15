import React, { useState } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  FileCheck,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react'

interface SubjectItem {
  code: string
  name: string
  faculty: string
  credits: number
  theoryHours: number
  practiceHours: number
  openSectionsCount: number
  type: 'Bắt buộc' | 'Tự chọn'
  syllabusReady: boolean
}

const INITIAL_SUBJECTS: SubjectItem[] = [
  {
    code: 'INT3102',
    name: 'Lập trình .NET & C# nâng cao',
    faculty: 'Khoa CNTT',
    credits: 3,
    theoryHours: 30,
    practiceHours: 30,
    openSectionsCount: 8,
    type: 'Bắt buộc',
    syllabusReady: true
  },
  {
    code: 'INT2204',
    name: 'Cơ sở dữ liệu quan hệ',
    faculty: 'Khoa CNTT',
    credits: 4,
    theoryHours: 45,
    practiceHours: 30,
    openSectionsCount: 12,
    type: 'Bắt buộc',
    syllabusReady: true
  },
  {
    code: 'INT3115',
    name: 'Phát triển ứng dụng Web',
    faculty: 'Khoa CNTT',
    credits: 3,
    theoryHours: 30,
    practiceHours: 30,
    openSectionsCount: 10,
    type: 'Bắt buộc',
    syllabusReady: true
  },
  {
    code: 'INT3306',
    name: 'Phát triển ứng dụng di động',
    faculty: 'Khoa CNTT',
    credits: 3,
    theoryHours: 30,
    practiceHours: 30,
    openSectionsCount: 6,
    type: 'Tự chọn',
    syllabusReady: true
  },
  {
    code: 'INT3401',
    name: 'Trí tuệ nhân tạo căn bản',
    faculty: 'Khoa CNTT',
    credits: 3,
    theoryHours: 30,
    practiceHours: 30,
    openSectionsCount: 5,
    type: 'Bắt buộc',
    syllabusReady: true
  },
  {
    code: 'BSA2001',
    name: 'Nguyên lý kinh tế vi mô',
    faculty: 'Khoa Kinh tế',
    credits: 3,
    theoryHours: 45,
    practiceHours: 0,
    openSectionsCount: 14,
    type: 'Bắt buộc',
    syllabusReady: true
  },
  {
    code: 'BSA3005',
    name: 'Quản trị chuỗi cung ứng',
    faculty: 'Khoa Kinh tế',
    credits: 3,
    theoryHours: 30,
    practiceHours: 15,
    openSectionsCount: 7,
    type: 'Tự chọn',
    syllabusReady: false
  },
  {
    code: 'ENG1001',
    name: 'Tiếng Anh học thuật 1',
    faculty: 'Khoa Ngoại ngữ',
    credits: 4,
    theoryHours: 60,
    practiceHours: 0,
    openSectionsCount: 20,
    type: 'Bắt buộc',
    syllabusReady: true
  }
]

export const AdminSubjectsView: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>(INITIAL_SUBJECTS)
  const [search, setSearch] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    faculty: 'Khoa CNTT',
    credits: 3,
    theoryHours: 30,
    practiceHours: 30,
    type: 'Bắt buộc' as 'Bắt buộc' | 'Tự chọn'
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch =
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    const matchesFaculty = facultyFilter === 'ALL' || s.faculty === facultyFilter
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter
    return matchesSearch && matchesFaculty && matchesType
  })

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.code || !newSubject.name) {
      alert('Vui lòng nhập đầy đủ mã và tên môn học.')
      return
    }

    const created: SubjectItem = {
      ...newSubject,
      openSectionsCount: 0,
      syllabusReady: true
    }

    setSubjects([created, ...subjects])
    setIsModalOpen(false)
    showToast(`Đã thêm môn học [${created.code}] ${created.name} vào chương trình đào tạo!`)
    setNewSubject({
      code: '',
      name: '',
      faculty: 'Khoa CNTT',
      credits: 3,
      theoryHours: 30,
      practiceHours: 30,
      type: 'Bắt buộc'
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            Danh Mục 128 Môn Học Đào Tạo (Harvard University)
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Khung chương trình cử nhân & kỹ sư hệ chính quy, chuẩn đầu ra và đề cương chi tiết
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm môn học mới</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng môn học</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">128</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đã kiểm định ABET / AUN</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Môn đại cương</span>
            <span className="text-2xl font-black text-blue-600 leading-tight">32</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Toán, Lý, Ngoại ngữ, Triết</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Chuyên ngành</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">66</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Có đồ án / thực hành</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đang mở lớp kỳ này</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">82 môn</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">256 lớp học phần</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã môn học, tên môn học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={facultyFilter}
              onChange={e => setFacultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">Tất cả các khoa</option>
              <option value="Khoa CNTT">Khoa CNTT</option>
              <option value="Khoa Kinh tế">Khoa Kinh tế</option>
              <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả loại môn</option>
            <option value="Bắt buộc">Bắt buộc</option>
            <option value="Tự chọn">Tự chọn</option>
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Mã môn</th>
                <th className="py-3.5 px-4 font-bold">Tên môn học</th>
                <th className="py-3.5 px-4 font-bold">Khoa phụ trách</th>
                <th className="py-3.5 px-4 font-bold text-center">Số tín chỉ</th>
                <th className="py-3.5 px-4 font-bold text-center">LT / TH</th>
                <th className="py-3.5 px-4 font-bold text-center">Loại môn</th>
                <th className="py-3.5 px-4 font-bold text-center">Lớp mở kỳ này</th>
                <th className="py-3.5 px-4 font-bold text-center">Đề cương</th>
                <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map(sub => (
                <tr key={sub.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">{sub.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{sub.name}</td>
                  <td className="py-3 px-4 text-slate-600">{sub.faculty}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{sub.credits} TC</td>
                  <td className="py-3 px-4 text-center text-slate-500 font-medium">
                    {sub.theoryHours}h / {sub.practiceHours}h
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        sub.type === 'Bắt buộc'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {sub.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">
                    {sub.openSectionsCount} lớp
                  </td>
                  <td className="py-3 px-4 text-center">
                    {sub.syllabusReady ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <FileCheck className="w-3 h-3" /> Đã duyệt
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Chờ nộp
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => showToast(`Xem đề cương chi tiết môn ${sub.code} - ${sub.name}`)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm môn học */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Thêm môn học đào tạo mới</h3>
                  <p className="text-[11px] text-slate-400">Thêm học phần vào chương trình khung</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mã môn học</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: INT3500"
                    value={newSubject.code}
                    onChange={e => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên môn học</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Điện toán đám mây (Cloud Computing)"
                    value={newSubject.name}
                    onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Khoa phụ trách</label>
                  <select
                    value={newSubject.faculty}
                    onChange={e => setNewSubject({ ...newSubject, faculty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Khoa CNTT">Khoa CNTT</option>
                    <option value="Khoa Kinh tế">Khoa Kinh tế</option>
                    <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Loại môn học</label>
                  <select
                    value={newSubject.type}
                    onChange={e => setNewSubject({ ...newSubject, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Bắt buộc">Bắt buộc</option>
                    <option value="Tự chọn">Tự chọn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Số tín chỉ</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newSubject.credits}
                    onChange={e => setNewSubject({ ...newSubject, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Giờ lý thuyết</label>
                  <input
                    type="number"
                    value={newSubject.theoryHours}
                    onChange={e => setNewSubject({ ...newSubject, theoryHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Giờ thực hành</label>
                  <input
                    type="number"
                    value={newSubject.practiceHours}
                    onChange={e => setNewSubject({ ...newSubject, practiceHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Lưu môn học
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
