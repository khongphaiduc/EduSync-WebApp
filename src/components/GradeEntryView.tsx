import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Save,
  Download,
  Lock,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import type { StudentGrade, ClassItem } from '../types'

interface GradeEntryViewProps {
  classes: ClassItem[]
  gradesData: Record<string, StudentGrade[]>
  onSaveGrades: (classCode: string, updatedGrades: StudentGrade[]) => void
}

export const GradeEntryView: React.FC<GradeEntryViewProps> = ({
  classes,
  gradesData,
  onSaveGrades
}) => {
  const [selectedClassCode, setSelectedClassCode] = useState<string>('SE1623')
  const [searchStudent, setSearchStudent] = useState('')
  const [localGrades, setLocalGrades] = useState<StudentGrade[]>(
    gradesData[selectedClassCode] || []
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false)

  // Switch class
  const handleSelectClass = (code: string) => {
    setSelectedClassCode(code)
    setLocalGrades(gradesData[code] || [])
    setHasChanges(false)
  }

  // Calculate letter grade & total score
  const calculateTotal = (att: number, mid: number, prac: number, fin: number) => {
    const total = Number((att * 0.1 + mid * 0.3 + prac * 0.2 + fin * 0.4).toFixed(1))
    let letter = 'F'
    let status: 'Đạt' | 'Không đạt' | 'Cảnh báo' = 'Không đạt'

    if (total >= 9.0) letter = 'A+'
    else if (total >= 8.5) letter = 'A'
    else if (total >= 8.0) letter = 'B+'
    else if (total >= 7.0) letter = 'B'
    else if (total >= 6.5) letter = 'C+'
    else if (total >= 5.5) letter = 'C'
    else if (total >= 5.0) letter = 'D+'
    else if (total >= 4.0) letter = 'D'
    else letter = 'F'

    if (total >= 5.0) {
      status = 'Đạt'
    } else if (total >= 4.0) {
      status = 'Cảnh báo'
    } else {
      status = 'Không đạt'
    }

    return { total, letter, status }
  }

  // Update specific score
  const handleScoreChange = (
    id: string,
    field: 'attendance' | 'midterm' | 'practical' | 'finalExam',
    value: string
  ) => {
    let numVal = parseFloat(value)
    if (isNaN(numVal)) numVal = 0
    if (numVal < 0) numVal = 0
    if (numVal > 10) numVal = 10

    setLocalGrades(prev =>
      prev.map(st => {
        if (st.id === id) {
          const updated = { ...st, [field]: numVal }
          const { total, letter, status } = calculateTotal(
            field === 'attendance' ? numVal : st.attendance,
            field === 'midterm' ? numVal : st.midterm,
            field === 'practical' ? numVal : st.practical,
            field === 'finalExam' ? numVal : st.finalExam
          )
          return {
            ...updated,
            totalScore: total,
            letterGrade: letter,
            status: status
          }
        }
        return st
      })
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    onSaveGrades(selectedClassCode, localGrades)
    setHasChanges(false)
    setSaveSuccessMessage(true)
    setTimeout(() => setSaveSuccessMessage(false), 3000)
  }

  const filteredGrades = localGrades.filter(
    st =>
      st.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      st.studentCode.toLowerCase().includes(searchStudent.toLowerCase())
  )

  const selectedClass = classes.find(c => c.code === selectedClassCode)

  // Calculations for stats
  const totalStudents = localGrades.length
  const passedStudents = localGrades.filter(st => st.status === 'Đạt').length
  const passRate = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0
  const avgScore =
    totalStudents > 0
      ? (
          localGrades.reduce((acc, cur) => acc + cur.totalScore, 0) / totalStudents
        ).toFixed(2)
      : '0'

  return (
    <div className="space-y-6">
      {/* Top Banner & Class Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Phân hệ Đào tạo & Quản lý điểm số</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
            Bảng Nhập Điểm Học Phần
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Môn học: <strong className="text-slate-700">{selectedClass?.name}</strong> • Mã lớp:{' '}
            <strong className="text-blue-600">{selectedClass?.code}</strong> • {selectedClass?.semester}
          </p>
        </div>

        {/* Select Class Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedClassCode}
            onChange={e => handleSelectClass(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            {classes.map(c => (
              <option key={c.id} value={c.code}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              hasChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{hasChanges ? 'Lưu thay đổi' : 'Đã lưu'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Bảng điểm lớp {selectedClassCode} đã được lưu thành công vào cơ sở dữ liệu đào tạo!</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Sĩ số lớp</span>
          <div className="text-2xl font-black text-slate-800 mt-0.5">{totalStudents}</div>
          <span className="text-[10px] text-slate-400">Sinh viên chính quy</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Điểm trung bình lớp</span>
          <div className="text-2xl font-black text-blue-600 mt-0.5">{avgScore}</div>
          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Đạt chuẩn đầu ra
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Tỷ lệ qua môn</span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">{passRate}%</div>
          <span className="text-[10px] text-slate-400">{passedStudents}/{totalStudents} sinh viên</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <span className="text-[11px] text-slate-400 font-medium">Cảnh báo học tập</span>
          <div className="text-2xl font-black text-amber-500 mt-0.5">
            {localGrades.filter(s => s.status !== 'Đạt').length}
          </div>
          <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3" /> Cần cải thiện
          </span>
        </div>
      </div>

      {/* Search & Actions toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sinh viên hoặc MSSV..."
            value={searchStudent}
            onChange={e => setSearchStudent(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => alert(`Xuất file Excel bảng điểm lớp ${selectedClassCode}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Khóa sổ điểm sẽ đóng quyền chỉnh sửa của sinh viên và gửi lên phòng khảo thí. Bạn có chắc không?')) {
                alert('Đã khóa sổ điểm lớp thành công!')
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Khóa sổ điểm</span>
          </button>
        </div>
      </div>

      {/* Main Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <th className="py-3 px-4 font-bold w-12 text-center">STT</th>
                <th className="py-3 px-4 font-bold">Mã SV</th>
                <th className="py-3 px-4 font-bold min-w-[180px]">Họ và tên</th>
                <th className="py-3 px-3 font-bold text-center w-28">
                  Chuyên cần <br />
                  <span className="text-[10px] text-slate-400 font-normal">(10%)</span>
                </th>
                <th className="py-3 px-3 font-bold text-center w-28">
                  Giữa kỳ <br />
                  <span className="text-[10px] text-slate-400 font-normal">(30%)</span>
                </th>
                <th className="py-3 px-3 font-bold text-center w-28">
                  Thực hành <br />
                  <span className="text-[10px] text-slate-400 font-normal">(20%)</span>
                </th>
                <th className="py-3 px-3 font-bold text-center w-28">
                  Cuối kỳ <br />
                  <span className="text-[10px] text-slate-400 font-normal">(40%)</span>
                </th>
                <th className="py-3 px-4 font-bold text-center w-24">
                  Tổng kết <br />
                  <span className="text-[10px] text-slate-400 font-normal">(Hệ 10)</span>
                </th>
                <th className="py-3 px-3 font-bold text-center w-20">Điểm chữ</th>
                <th className="py-3 px-4 font-bold text-center w-24">Kết quả</th>
                <th className="py-3 px-4 font-bold min-w-[160px]">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.map((st, idx) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-medium text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {st.studentCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={st.avatar}
                        alt={st.fullName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span className="font-bold text-slate-800">{st.fullName}</span>
                    </div>
                  </td>

                  {/* Attendance 10% */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={st.attendance}
                      onChange={e => handleScoreChange(st.id, 'attendance', e.target.value)}
                      className="w-16 mx-auto text-center py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Midterm 30% */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={st.midterm}
                      onChange={e => handleScoreChange(st.id, 'midterm', e.target.value)}
                      className="w-16 mx-auto text-center py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Practical 20% */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={st.practical}
                      onChange={e => handleScoreChange(st.id, 'practical', e.target.value)}
                      className="w-16 mx-auto text-center py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Final Exam 40% */}
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={st.finalExam}
                      onChange={e => handleScoreChange(st.id, 'finalExam', e.target.value)}
                      className="w-16 mx-auto text-center py-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Total Score */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-black text-sm text-blue-600 bg-blue-50/90 px-2.5 py-1 rounded-md border border-blue-100">
                      {st.totalScore.toFixed(1)}
                    </span>
                  </td>

                  {/* Letter Grade */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded-md ${
                        st.letterGrade.startsWith('A')
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : st.letterGrade.startsWith('B')
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : st.letterGrade.startsWith('C')
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {st.letterGrade}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                        st.status === 'Đạt'
                          ? 'bg-emerald-50 text-emerald-700'
                          : st.status === 'Cảnh báo'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {st.notes || '—'}
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
