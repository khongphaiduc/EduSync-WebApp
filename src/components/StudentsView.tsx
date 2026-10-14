import React, { useState } from 'react'
import { Search, Mail, Download } from 'lucide-react'
import { INITIAL_STUDENTS_GRADES } from '../mockData'

export const StudentsView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [search, setSearch] = useState('')

  const allStudents = Object.values(INITIAL_STUDENTS_GRADES).flat()

  const filtered = allStudents.filter(st => {
    const matchesSearch =
      st.fullName.toLowerCase().includes(search.toLowerCase()) ||
      st.studentCode.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Danh Sách Sinh Viên
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý hồ sơ học vụ, thông tin liên lạc và tình hình học tập của 156 sinh viên
          </p>
        </div>

        <button
          onClick={() => alert('Xuất danh sách sinh viên toàn bộ các lớp sang file Excel')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Xuất danh sách (Excel)</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc MSSV..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Lọc theo lớp:</span>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tất cả các lớp (4 lớp)</option>
            <option value="SE1623">SE1623 - Web nâng cao</option>
            <option value="SE1234">SE1234 - Cơ sở dữ liệu</option>
            <option value="SE1710">SE1710 - Lập trình di động</option>
            <option value="SE1805">SE1805 - Kiến trúc phần mềm</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <th className="py-3 px-4 font-bold">Mã SV</th>
                <th className="py-3 px-4 font-bold">Họ và tên</th>
                <th className="py-3 px-4 font-bold">Lớp chính quy</th>
                <th className="py-3 px-4 font-bold text-center">Chuyên cần</th>
                <th className="py-3 px-4 font-bold text-center">Điểm TB môn</th>
                <th className="py-3 px-4 font-bold text-center">Xếp loại</th>
                <th className="py-3 px-4 font-bold text-center">Tình trạng</th>
                <th className="py-3 px-4 font-bold text-right">Liên hệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(st => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{st.studentCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar}
                        alt={st.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-800">{st.fullName}</div>
                        <div className="text-[11px] text-slate-400">Khoa CNTT - Khóa 2023</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">KTPM-K20A</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {st.attendance * 10}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {st.totalScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-xs">{st.letterGrade}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                        st.status === 'Đạt'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => alert(`Gửi email thông báo tới ${st.fullName}`)}
                        title="Gửi email"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Xem chi tiết lịch sử học tập của ${st.fullName}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Hồ sơ
                      </button>
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
