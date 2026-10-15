import React, { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users
} from 'lucide-react'

interface ClassReportSummary {
  code: string
  name: string
  studentCount: number
  avgScore: number
  passRate: number
  attendanceRate: number
  gradeA: number
  gradeB: number
  gradeC: number
  gradeD: number
  gradeF: number
}

const CLASS_SUMMARIES: ClassReportSummary[] = [
  {
    code: 'SE1623',
    name: 'Lập trình Web nâng cao',
    studentCount: 45,
    avgScore: 7.8,
    passRate: 95.5,
    attendanceRate: 96.2,
    gradeA: 14,
    gradeB: 20,
    gradeC: 7,
    gradeD: 2,
    gradeF: 2
  },
  {
    code: 'SE1234',
    name: 'Cơ sở dữ liệu',
    studentCount: 38,
    avgScore: 7.4,
    passRate: 92.1,
    attendanceRate: 94.0,
    gradeA: 10,
    gradeB: 16,
    gradeC: 8,
    gradeD: 3,
    gradeF: 1
  },
  {
    code: 'SE1710',
    name: 'Phát triển ứng dụng di động',
    studentCount: 42,
    avgScore: 8.1,
    passRate: 97.6,
    attendanceRate: 95.8,
    gradeA: 16,
    gradeB: 18,
    gradeC: 6,
    gradeD: 1,
    gradeF: 1
  },
  {
    code: 'SE1805',
    name: 'Kiến trúc phần mềm',
    studentCount: 31,
    avgScore: 7.6,
    passRate: 93.5,
    attendanceRate: 93.1,
    gradeA: 9,
    gradeB: 14,
    gradeC: 6,
    gradeD: 2,
    gradeF: 0
  }
]

export const TeacherReportsView: React.FC = () => {
  const [selectedClassCode, setSelectedClassCode] = useState('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const selectedClass =
    selectedClassCode === 'ALL'
      ? null
      : CLASS_SUMMARIES.find(c => c.code === selectedClassCode)

  const totalStudents = CLASS_SUMMARIES.reduce((acc, c) => acc + c.studentCount, 0)
  const overallAvgScore = (
    CLASS_SUMMARIES.reduce((acc, c) => acc + c.avgScore * c.studentCount, 0) / totalStudents
  ).toFixed(1)
  const overallPassRate = (
    CLASS_SUMMARIES.reduce((acc, c) => acc + c.passRate * c.studentCount, 0) / totalStudents
  ).toFixed(1)
  const totalGradeA = CLASS_SUMMARIES.reduce((acc, c) => acc + c.gradeA, 0)
  const totalGradeB = CLASS_SUMMARIES.reduce((acc, c) => acc + c.gradeB, 0)
  const totalGradeC = CLASS_SUMMARIES.reduce((acc, c) => acc + c.gradeC, 0)
  const totalGradeD = CLASS_SUMMARIES.reduce((acc, c) => acc + c.gradeD, 0)
  const totalGradeF = CLASS_SUMMARIES.reduce((acc, c) => acc + c.gradeF, 0)

  const currentGradeA = selectedClass ? selectedClass.gradeA : totalGradeA
  const currentGradeB = selectedClass ? selectedClass.gradeB : totalGradeB
  const currentGradeC = selectedClass ? selectedClass.gradeC : totalGradeC
  const currentGradeD = selectedClass ? selectedClass.gradeD : totalGradeD
  const currentGradeF = selectedClass ? selectedClass.gradeF : totalGradeF
  const currentTotal = selectedClass ? selectedClass.studentCount : totalStudents

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            Báo Cáo - Thống Kê Học Tập (Cổng Giảng Viên)
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Phân tích phổ điểm, tỷ lệ đạt/trượt và tình hình chuyên cần các lớp phụ trách Học kỳ 1 (2026 - 2027)
          </p>
        </div>

        <button
          onClick={() => showToast('Đang tạo và tải về báo cáo tổng kết học kỳ định dạng PDF / Excel...')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Xuất báo cáo tổng kết</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Điểm trung bình (GPA)</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">
              {selectedClass ? selectedClass.avgScore : overallAvgScore} / 10
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> ↑ 0.3 điểm so với kỳ trước
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tỷ lệ sinh viên Đạt</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">
              {selectedClass ? selectedClass.passRate : overallPassRate}%
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đạt chuẩn đào tạo</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tỷ lệ Chuyên cần</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">
              {selectedClass ? selectedClass.attendanceRate : 94.8}%
            </span>
            <span className="text-[10px] text-purple-500 font-medium block mt-1">Điểm danh 15 buổi</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Cần hỗ trợ học tập</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">
              {selectedClass ? selectedClass.gradeF : totalGradeF} SV
            </span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">Điểm quá trình &lt; 4.0</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Class filter tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 pl-2">Chọn lớp xem báo cáo:</span>
        <button
          onClick={() => setSelectedClassCode('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            selectedClassCode === 'ALL'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tổng hợp toàn bộ 4 lớp
        </button>
        {CLASS_SUMMARIES.map(c => (
          <button
            key={c.code}
            onClick={() => setSelectedClassCode(c.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              selectedClassCode === c.code
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.code} - {c.name}
          </button>
        ))}
      </div>

      {/* Grade Distribution & Pass Rate Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Phổ điểm (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Phổ điểm đánh giá quá trình{' '}
                {selectedClass ? `lớp ${selectedClass.code}` : '(Toàn bộ 4 lớp)'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Phân bố số lượng sinh viên theo thang điểm chữ A, B, C, D, F
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              Tổng số: {currentTotal} sinh viên
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-60 flex items-end justify-between gap-4 pt-6 pb-2 px-6 border-b border-l border-slate-200 relative">
            {/* Gridlines */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-slate-100"></div>
            <div className="absolute inset-x-0 top-1/4 h-[1px] bg-slate-100"></div>
            <div className="absolute inset-x-0 top-2/4 h-[1px] bg-slate-100"></div>
            <div className="absolute inset-x-0 top-3/4 h-[1px] bg-slate-100"></div>

            {/* Bar A */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-slate-700 mb-1.5 group-hover:text-blue-600">
                {currentGradeA} ({Math.round((currentGradeA / currentTotal) * 100)}%)
              </span>
              <div
                className="w-12 bg-blue-600 rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer shadow-xs"
                style={{ height: `${Math.max((currentGradeA / currentTotal) * 100 * 1.8, 10)}%` }}
              ></div>
              <span className="text-xs font-bold text-slate-700 mt-2">Điểm A (Giỏi)</span>
              <span className="text-[10px] text-slate-400">8.5 - 10.0</span>
            </div>

            {/* Bar B */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-slate-700 mb-1.5 group-hover:text-emerald-600">
                {currentGradeB} ({Math.round((currentGradeB / currentTotal) * 100)}%)
              </span>
              <div
                className="w-12 bg-emerald-500 rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer shadow-xs"
                style={{ height: `${Math.max((currentGradeB / currentTotal) * 100 * 1.8, 10)}%` }}
              ></div>
              <span className="text-xs font-bold text-slate-700 mt-2">Điểm B (Khá)</span>
              <span className="text-[10px] text-slate-400">7.0 - 8.4</span>
            </div>

            {/* Bar C */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-slate-700 mb-1.5 group-hover:text-amber-600">
                {currentGradeC} ({Math.round((currentGradeC / currentTotal) * 100)}%)
              </span>
              <div
                className="w-12 bg-amber-500 rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer shadow-xs"
                style={{ height: `${Math.max((currentGradeC / currentTotal) * 100 * 1.8, 10)}%` }}
              ></div>
              <span className="text-xs font-bold text-slate-700 mt-2">Điểm C (TB)</span>
              <span className="text-[10px] text-slate-400">5.5 - 6.9</span>
            </div>

            {/* Bar D */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-slate-700 mb-1.5 group-hover:text-orange-600">
                {currentGradeD} ({Math.round((currentGradeD / currentTotal) * 100)}%)
              </span>
              <div
                className="w-12 bg-orange-400 rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer shadow-xs"
                style={{ height: `${Math.max((currentGradeD / currentTotal) * 100 * 1.8, 6)}%` }}
              ></div>
              <span className="text-xs font-bold text-slate-700 mt-2">Điểm D (Yếu)</span>
              <span className="text-[10px] text-slate-400">4.0 - 5.4</span>
            </div>

            {/* Bar F */}
            <div className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-bold text-rose-600 mb-1.5 group-hover:text-rose-700">
                {currentGradeF} ({Math.round((currentGradeF / currentTotal) * 100)}%)
              </span>
              <div
                className="w-12 bg-rose-500 rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer shadow-xs"
                style={{ height: `${Math.max((currentGradeF / currentTotal) * 100 * 1.8, 4)}%` }}
              ></div>
              <span className="text-xs font-bold text-rose-600 mt-2">Điểm F (Kém)</span>
              <span className="text-[10px] text-slate-400">&lt; 4.0</span>
            </div>
          </div>
        </div>

        {/* Tóm tắt chỉ tiêu học vụ (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4">Chỉ số chất lượng đào tạo</h2>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Tỷ lệ Giỏi & Xuất sắc (A)</span>
                  <strong className="text-blue-600 font-bold">
                    {Math.round((currentGradeA / currentTotal) * 100)}%
                  </strong>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(currentGradeA / currentTotal) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Tỷ lệ Khá (B)</span>
                  <strong className="text-emerald-600 font-bold">
                    {Math.round((currentGradeB / currentTotal) * 100)}%
                  </strong>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(currentGradeB / currentTotal) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Tỷ lệ Đạt yêu cầu (&gt;= 4.0)</span>
                  <strong className="text-purple-600 font-bold">
                    {Math.round(((currentTotal - currentGradeF) / currentTotal) * 100)}%
                  </strong>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${((currentTotal - currentGradeF) / currentTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Tiến độ giảng dạy:</span>
            <strong className="text-emerald-600">Đã hoàn thành 8/15 tuần</strong>
          </div>
        </div>
      </div>

      {/* Summary Table Per Class */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Bảng so sánh chất lượng giữa các lớp giảng dạy</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Mã lớp</th>
                <th className="py-3 px-4 font-bold">Tên học phần</th>
                <th className="py-3 px-4 font-bold text-center">Sĩ số</th>
                <th className="py-3 px-4 font-bold text-center">Điểm TB (Hệ 10)</th>
                <th className="py-3 px-4 font-bold text-center">Chuyên cần</th>
                <th className="py-3 px-4 font-bold text-center">Tỷ lệ Đạt</th>
                <th className="py-3 px-4 font-bold text-center">Loại A</th>
                <th className="py-3 px-4 font-bold text-center">Loại F</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CLASS_SUMMARIES.map(c => (
                <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">{c.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                  <td className="py-3 px-4 text-center text-slate-700 font-semibold">{c.studentCount} SV</td>
                  <td className="py-3 px-4 text-center font-black text-slate-800">{c.avgScore}</td>
                  <td className="py-3 px-4 text-center font-bold text-purple-600">{c.attendanceRate}%</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">{c.passRate}%</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600">{c.gradeA} SV</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">{c.gradeF} SV</td>
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
