import React, { useState } from 'react'
import {
  Download,
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  X,
  Upload,
  Trash2,
  FolderOpen
} from 'lucide-react'

interface CourseMaterial {
  id: string
  title: string
  classCode: string
  className: string
  fileType: 'pdf' | 'pptx' | 'zip' | 'docx'
  fileSize: string
  category: 'Slide bài giảng' | 'Đề cương chi tiết' | 'Hướng dẫn Lab' | 'Đồ án & Bài tập'
  uploadedAt: string
  downloadCount: number
  isVisible: boolean
}

const INITIAL_MATERIALS: CourseMaterial[] = [
  {
    id: 'mat-1',
    title: 'Slide Chương 1: Giới thiệu Kiến trúc Ứng dụng Web Hiện Đại & RESTful API',
    classCode: 'SE1623',
    className: 'Lập trình Web nâng cao',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    category: 'Slide bài giảng',
    uploadedAt: '08/09/2026',
    downloadCount: 44,
    isVisible: true
  },
  {
    id: 'mat-2',
    title: 'Đề cương chi tiết học phần Lập trình Web nâng cao (Syllabus 2026)',
    classCode: 'SE1623',
    className: 'Lập trình Web nâng cao',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    category: 'Đề cương chi tiết',
    uploadedAt: '05/09/2026',
    downloadCount: 45,
    isVisible: true
  },
  {
    id: 'mat-3',
    title: 'Tài liệu hướng dẫn Lab 03: Tối ưu hóa chỉ mục Index & Query Plan trong PostgreSQL',
    classCode: 'SE1234',
    className: 'Cơ sở dữ liệu',
    fileType: 'docx',
    fileSize: '2.5 MB',
    category: 'Hướng dẫn Lab',
    uploadedAt: '02/10/2026',
    downloadCount: 38,
    isVisible: true
  },
  {
    id: 'mat-4',
    title: 'Starter Project Template Flutter & Jetpack Compose (Source Code)',
    classCode: 'SE1710',
    className: 'Phát triển ứng dụng di động',
    fileType: 'zip',
    fileSize: '18.4 MB',
    category: 'Đồ án & Bài tập',
    uploadedAt: '25/09/2026',
    downloadCount: 41,
    isVisible: true
  },
  {
    id: 'mat-5',
    title: 'Slide Chương 4: Mẫu thiết kế phần mềm (Design Patterns: Singleton, Factory, Observer)',
    classCode: 'SE1805',
    className: 'Kiến trúc phần mềm',
    fileType: 'pptx',
    fileSize: '6.2 MB',
    category: 'Slide bài giảng',
    uploadedAt: '10/10/2026',
    downloadCount: 29,
    isVisible: true
  }
]

export const TeacherMaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<CourseMaterial[]>(INITIAL_MATERIALS)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    classCode: 'SE1623',
    className: 'Lập trình Web nâng cao',
    category: 'Slide bài giảng' as 'Slide bài giảng' | 'Đề cương chi tiết' | 'Hướng dẫn Lab' | 'Đồ án & Bài tập',
    fileType: 'pdf' as 'pdf' | 'pptx' | 'zip' | 'docx'
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterial.title) {
      alert('Vui lòng nhập tên tài liệu.')
      return
    }

    const created: CourseMaterial = {
      id: `mat-${Date.now()}`,
      title: newMaterial.title,
      classCode: newMaterial.classCode,
      className:
        newMaterial.classCode === 'SE1623'
          ? 'Lập trình Web nâng cao'
          : newMaterial.classCode === 'SE1234'
          ? 'Cơ sở dữ liệu'
          : newMaterial.classCode === 'SE1710'
          ? 'Phát triển ứng dụng di động'
          : 'Kiến trúc phần mềm',
      fileType: newMaterial.fileType,
      fileSize: '3.6 MB',
      category: newMaterial.category,
      uploadedAt: 'Hôm nay',
      downloadCount: 0,
      isVisible: true
    }

    setMaterials([created, ...materials])
    setIsUploadOpen(false)
    showToast(`Đã tải lên thành công tài liệu: ${created.title}!`)
    setNewMaterial({
      title: '',
      classCode: 'SE1623',
      className: 'Lập trình Web nâng cao',
      category: 'Slide bài giảng',
      fileType: 'pdf'
    })
  }

  const handleToggleVisible = (id: string) => {
    setMaterials(prev =>
      prev.map(m => {
        if (m.id === id) {
          const newVis = !m.isVisible
          showToast(`Đã ${newVis ? 'công khai' : 'ẩn'} tài liệu đối với sinh viên!`)
          return { ...m, isVisible: newVis }
        }
        return m
      })
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) {
      setMaterials(prev => prev.filter(m => m.id !== id))
      showToast('Đã xóa tài liệu thành công!')
    }
  }

  const filteredMaterials = materials.filter(m => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.classCode.toLowerCase().includes(search.toLowerCase())
    const matchClass = classFilter === 'ALL' || m.classCode === classFilter
    const matchCategory = categoryFilter === 'ALL' || m.category === categoryFilter
    return matchSearch && matchClass && matchCategory
  })

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            Kho Tài Liệu & Đề Cương Học Phần (Cổng Giảng Viên)
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Quản trị giáo trình, bài giảng điện tử, bài tập thực hành Lab và đồ án cho sinh viên các lớp
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tải lên tài liệu mới</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng tài liệu</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{materials.length} tệp</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đầy đủ 4 học phần</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Lượt tải về</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">197 lượt</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Sinh viên truy cập cao</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Slide & Bài giảng</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">
              {materials.filter(m => m.category === 'Slide bài giảng').length} bộ
            </span>
            <span className="text-[10px] text-purple-500 font-medium block mt-1">Theo tuần học</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Dung lượng sử dụng</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">33.1 MB</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Đám mây Harvard Cloud</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên tài liệu, học phần..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả lớp học phần</option>
              <option value="SE1623">SE1623 - Web nâng cao</option>
              <option value="SE1234">SE1234 - Cơ sở dữ liệu</option>
              <option value="SE1710">SE1710 - Lập trình di động</option>
              <option value="SE1805">SE1805 - Kiến trúc phần mềm</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả danh mục</option>
            <option value="Slide bài giảng">Slide bài giảng</option>
            <option value="Đề cương chi tiết">Đề cương chi tiết</option>
            <option value="Hướng dẫn Lab">Hướng dẫn Lab</option>
            <option value="Đồ án & Bài tập">Đồ án & Bài tập</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Tài liệu học tập</th>
                <th className="py-3.5 px-4 font-bold">Lớp áp dụng</th>
                <th className="py-3.5 px-4 font-bold">Danh mục</th>
                <th className="py-3.5 px-4 font-bold text-center">Kích thước</th>
                <th className="py-3.5 px-4 font-bold text-center">Lượt tải</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map(mat => (
                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold uppercase text-[10px] ${
                          mat.fileType === 'pdf'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : mat.fileType === 'pptx'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : mat.fileType === 'zip'
                            ? 'bg-purple-50 text-purple-600 border border-purple-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        {mat.fileType}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{mat.title}</h4>
                        <span className="text-[11px] text-slate-400">Đăng ngày: {mat.uploadedAt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {mat.classCode}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5">{mat.className}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{mat.category}</td>
                  <td className="py-3 px-4 text-center text-slate-500">{mat.fileSize}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">
                    {mat.downloadCount} lượt
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleVisible(mat.id)}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        mat.isVisible
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {mat.isVisible ? 'Công khai' : 'Đang ẩn'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => showToast(`Bắt đầu tải về tệp: ${mat.title}`)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Tải về"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tải lên tài liệu mới */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Tải lên tài liệu học phần mới</h3>
                  <p className="text-[11px] text-slate-400">Chia sẻ giáo trình, slide bài giảng cho sinh viên</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề tài liệu</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Slide Chương 2: Entity Framework Core & Repository Pattern"
                  value={newMaterial.title}
                  onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Áp dụng cho lớp</label>
                  <select
                    value={newMaterial.classCode}
                    onChange={e => setNewMaterial({ ...newMaterial, classCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="SE1623">SE1623 - Web nâng cao</option>
                    <option value="SE1234">SE1234 - Cơ sở dữ liệu</option>
                    <option value="SE1710">SE1710 - Lập trình di động</option>
                    <option value="SE1805">SE1805 - Kiến trúc phần mềm</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Danh mục tài liệu</label>
                  <select
                    value={newMaterial.category}
                    onChange={e => setNewMaterial({ ...newMaterial, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Slide bài giảng">Slide bài giảng</option>
                    <option value="Đề cương chi tiết">Đề cương chi tiết</option>
                    <option value="Hướng dẫn Lab">Hướng dẫn Lab</option>
                    <option value="Đồ án & Bài tập">Đồ án & Bài tập</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Định dạng tệp</label>
                  <select
                    value={newMaterial.fileType}
                    onChange={e => setNewMaterial({ ...newMaterial, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="pdf">Tệp PDF (.pdf)</option>
                    <option value="pptx">Slide thuyết trình (.pptx)</option>
                    <option value="zip">Tệp nén mã nguồn (.zip, .rar)</option>
                    <option value="docx">Tài liệu Word (.docx)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tệp đính kèm</label>
                  <input
                    type="file"
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải lên ngay</span>
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
