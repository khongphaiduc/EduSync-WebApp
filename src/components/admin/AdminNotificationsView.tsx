import React, { useState } from 'react'
import {
  Bell,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Pin,
  Send,
  X,
  Eye,
  Users,
  GraduationCap
} from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  content: string
  targetAudience: 'Toàn trường' | 'Giảng viên' | 'Sinh viên'
  priority: 'urgent' | 'important' | 'normal'
  isPinned: boolean
  publishedAt: string
  author: string
  readCount: number
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Thông báo về việc đăng ký học phần bổ sung Học kỳ 1 (2026 - 2027)',
    content:
      'Phòng Đào Tạo thông báo mở cổng đăng ký tín chỉ bổ sung cho toàn thể sinh viên các khóa từ ngày 16/10 đến 20/10/2026. Sinh viên kiểm tra số tín chỉ tích lũy trước khi thực hiện.',
    targetAudience: 'Sinh viên',
    priority: 'urgent',
    isPinned: true,
    publishedAt: '14/10/2026 09:00',
    author: 'Phòng Quản Lý Đào Tạo',
    readCount: 1140
  },
  {
    id: 'notif-2',
    title: 'Kế hoạch kiểm tra tiến độ nộp điểm giữa kỳ & nộp đề cương chi tiết',
    content:
      'Kính gửi Quý Thầy/Cô, Phòng Đào Tạo đề nghị các bộ môn hoàn thiện việc nhập điểm đánh giá quá trình và đề cương chi tiết học phần trước ngày 25/10/2026.',
    targetAudience: 'Giảng viên',
    priority: 'important',
    isPinned: true,
    publishedAt: '12/10/2026 14:30',
    author: 'Ban Giám Hiệu',
    readCount: 82
  },
  {
    id: 'notif-3',
    title: 'Lịch nghỉ Tết Dương lịch 2027 dành cho cán bộ, giảng viên và sinh viên',
    content:
      'Toàn thể cán bộ, giảng viên và người học được nghỉ theo quy định của Luật Lao động từ ngày 01/01/2027 đến hết ngày 03/01/2027.',
    targetAudience: 'Toàn trường',
    priority: 'normal',
    isPinned: false,
    publishedAt: '10/10/2026 08:00',
    author: 'Văn Phòng Nhà Trường',
    readCount: 950
  },
  {
    id: 'notif-4',
    title: 'Thông báo gia hạn nộp học phí Học kỳ 1 đợt 2 đến ngày 30/10/2026',
    content:
      'Nhằm hỗ trợ sinh viên có hoàn cảnh khó khăn, nhà trường quyết định gia hạn thời hạn hoàn thành nghĩa vụ học phí đến hết ngày 30/10/2026 mà không tính phí phạt chậm.',
    targetAudience: 'Sinh viên',
    priority: 'important',
    isPinned: false,
    publishedAt: '08/10/2026 16:15',
    author: 'Phòng Tài Chính - Kế Toán',
    readCount: 1080
  }
]

export const AdminNotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [search, setSearch] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newNotif, setNewNotif] = useState({
    title: '',
    content: '',
    targetAudience: 'Toàn trường' as 'Toàn trường' | 'Giảng viên' | 'Sinh viên',
    priority: 'normal' as 'urgent' | 'important' | 'normal',
    isPinned: false
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNotif.title || !newNotif.content) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.')
      return
    }

    const created: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: newNotif.title,
      content: newNotif.content,
      targetAudience: newNotif.targetAudience,
      priority: newNotif.priority,
      isPinned: newNotif.isPinned,
      publishedAt: 'Vừa xong',
      author: 'Phòng Đào Tạo (Admin)',
      readCount: 0
    }

    setNotifications([created, ...notifications])
    setIsModalOpen(false)
    showToast(`Đã phát hành thông báo mới tới đối tượng: ${created.targetAudience}!`)
    setNewNotif({
      title: '',
      content: '',
      targetAudience: 'Toàn trường',
      priority: 'normal',
      isPinned: false
    })
  }

  const handleTogglePin = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    )
    showToast('Đã cập nhật trạng thái ghim thông báo!')
  }

  const filteredNotifs = notifications.filter(n => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    const matchAudience = audienceFilter === 'ALL' || n.targetAudience === audienceFilter
    return matchSearch && matchAudience
  })

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            Hệ Thống Thông Báo & Tin Tức Đào Tạo Toàn Trường
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Soạn thảo, quản lý và phát hành các thông báo học vụ, lịch thi cử tới giảng viên và sinh viên
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng thông báo</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">18 tin</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Trong học kỳ 1</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Thông báo ghim</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">
              {notifications.filter(n => n.isPinned).length}
            </span>
            <span className="text-[10px] text-amber-600 font-medium block mt-1">Ưu tiên hiển thị</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Pin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tới sinh viên</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">
              {notifications.filter(n => n.targetAudience === 'Sinh viên').length}
            </span>
            <span className="text-[10px] text-purple-500 font-medium block mt-1">1,254 sinh viên nhận</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tới giảng viên</span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">
              {notifications.filter(n => n.targetAudience === 'Giảng viên').length}
            </span>
            <span className="text-[10px] text-emerald-500 font-medium block mt-1">86 giảng viên nhận</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung thông báo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={audienceFilter}
            onChange={e => setAudienceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Tất cả đối tượng</option>
            <option value="Toàn trường">Toàn trường</option>
            <option value="Giảng viên">Giảng viên</option>
            <option value="Sinh viên">Sinh viên</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifs.map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
              item.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/80 hover:shadow-md'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {item.isPinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Pin className="w-3 h-3" /> Đã ghim
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : item.priority === 'important'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.priority === 'urgent'
                    ? 'Khẩn cấp'
                    : item.priority === 'important'
                    ? 'Quan trọng'
                    : 'Bình thường'}
                </span>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Gửi tới: {item.targetAudience}
                </span>
                <span className="text-[11px] text-slate-400">• {item.publishedAt}</span>
              </div>

              <h3 className="font-bold text-slate-800 text-sm sm:text-base mt-2">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.content}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Người gửi: <strong className="text-slate-600">{item.author}</strong></span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {item.readCount} lượt xem
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-start">
              <button
                onClick={() => handleTogglePin(item.id)}
                className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  item.isPinned
                    ? 'border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100'
                    : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title={item.isPinned ? 'Bỏ ghim' : 'Ghim thông báo'}
              >
                <Pin className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tạo thông báo mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Soạn thông báo mới</h3>
                  <p className="text-[11px] text-slate-400">Gửi thông báo tới giảng viên hoặc sinh viên</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề thông báo</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tiêu đề thông báo..."
                  value={newNotif.title}
                  onChange={e => setNewNotif({ ...newNotif, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Đối tượng nhận</label>
                  <select
                    value={newNotif.targetAudience}
                    onChange={e => setNewNotif({ ...newNotif, targetAudience: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Toàn trường">Toàn trường</option>
                    <option value="Giảng viên">Giảng viên</option>
                    <option value="Sinh viên">Sinh viên</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mức độ ưu tiên</label>
                  <select
                    value={newNotif.priority}
                    onChange={e => setNewNotif({ ...newNotif, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="normal">Bình thường</option>
                    <option value="important">Quan trọng</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Soạn thảo nội dung thông báo..."
                  value={newNotif.content}
                  onChange={e => setNewNotif({ ...newNotif, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={newNotif.isPinned}
                  onChange={e => setNewNotif({ ...newNotif, isPinned: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isPinned" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Ghim thông báo này lên đầu trang bảng tin
                </label>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Phát hành ngay</span>
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
