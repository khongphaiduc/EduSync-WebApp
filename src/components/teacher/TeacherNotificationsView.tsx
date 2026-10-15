import React, { useState } from 'react'
import {
  Bell,
  Search,
  CheckCircle2,
  Mail,
  Send,
  Star,
  X,
  Users
} from 'lucide-react'

interface LecturerNotice {
  id: string
  title: string
  sender: string
  senderRole: string
  sentAt: string
  content: string
  isRead: boolean
  isStarred: boolean
  priority: 'urgent' | 'important' | 'normal'
  targetClass?: string
}

const INITIAL_TEACHER_NOTICES: LecturerNotice[] = [
  {
    id: 'nt-1',
    title: 'Nhắc nhở hoàn thành nhập điểm đánh giá quá trình Học kỳ 1 (2026 - 2027)',
    sender: 'Phòng Quản Lý Đào Tạo',
    senderRole: 'Phòng Đào Tạo',
    sentAt: '14/10/2026 09:30',
    content:
      'Kính gửi ThS. Nguyễn Văn An, hạn chót hoàn thành nhập điểm thành phần và điểm giữa kỳ cho các lớp SE1623 và SE1234 là ngày 25/10/2026. Thầy vui lòng kiểm tra và khóa bảng điểm đúng hạn.',
    isRead: false,
    isStarred: true,
    priority: 'urgent'
  },
  {
    id: 'nt-2',
    title: 'Kế hoạch tổ chức Hội thảo Khoa học Quốc tế về AI & Công nghệ Phần mềm',
    sender: 'Văn Phòng Khoa CNTT',
    senderRole: 'Ban Chủ Nhiệm Khoa',
    sentAt: '13/10/2026 15:00',
    content:
      'Trân trọng kính mời các giảng viên trong bộ môn tham dự và gửi bài báo cáo khoa học cho Hội thảo IEEE-ICSE tổ chức tại Hội trường A vào tháng 12/2026.',
    isRead: true,
    isStarred: false,
    priority: 'important'
  },
  {
    id: 'nt-3',
    title: 'Thông báo điều chỉnh phòng học buổi thực hành lớp SE1623 ngày 20/10',
    sender: 'Tổ Quản Trị Giảng Đường',
    senderRole: 'Điều Phối Phòng',
    sentAt: '11/10/2026 10:15',
    content:
      'Do phòng A402 bảo trì hệ thống máy lạnh, buổi học ngày Thứ Ba (20/10) sẽ chuyển sang Phòng B301 (Tòa B). Hệ thống đã tự động gửi SMS thông báo cho toàn bộ 45 sinh viên trong lớp.',
    isRead: true,
    isStarred: true,
    priority: 'normal',
    targetClass: 'SE1623'
  },
  {
    id: 'nt-4',
    title: 'Đăng ký xét duyệt đề tài Nghiên cứu khoa học cấp Trường năm học 2026 - 2027',
    sender: 'Phòng Quản Lý Khoa Học & Hợp Tác Quốc Tế',
    senderRole: 'Phòng NCKH',
    sentAt: '08/10/2026 08:30',
    content:
      'Phòng NCKH xin gửi mẫu đăng ký đề tài nghiên cứu cấp trường năm 2026. Giảng viên nộp hồ sơ thuyết minh trước ngày 15/11/2026.',
    isRead: true,
    isStarred: false,
    priority: 'normal'
  }
]

export const TeacherNotificationsView: React.FC = () => {
  const [notices, setNotices] = useState<LecturerNotice[]>(INITIAL_TEACHER_NOTICES)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred'>('all')
  const [selectedNotice, setSelectedNotice] = useState<LecturerNotice | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [composeData, setComposeData] = useState({
    targetClass: 'SE1623',
    title: '',
    content: ''
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleToggleRead = (id: string) => {
    setNotices(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    )
  }

  const handleToggleStar = (id: string) => {
    setNotices(prev =>
      prev.map(n => (n.id === id ? { ...n, isStarred: !n.isStarred } : n))
    )
    showToast('Đã cập nhật đánh dấu sao!')
  }

  const handleSendNoticeToClass = (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeData.title || !composeData.content) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung.')
      return
    }

    setIsComposeOpen(false)
    showToast(`Đã gửi thông báo đến lớp [${composeData.targetClass}] thành công!`)
    setComposeData({ targetClass: 'SE1623', title: '', content: '' })
  }

  const filteredNotices = notices.filter(n => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.sender.toLowerCase().includes(search.toLowerCase())
    const matchType =
      filterType === 'all' ||
      (filterType === 'unread' && !n.isRead) ||
      (filterType === 'starred' && n.isStarred)
    return matchSearch && matchType
  })

  const unreadCount = notices.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            Hộp Thư & Thông Báo Hệ Thống (Cổng Giảng Viên)
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Tiếp nhận thông báo từ Ban Giám Hiệu, Phòng Đào Tạo và gửi tin nhắn tức thì tới sinh viên các lớp
          </p>
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Gửi thông báo tới lớp</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng tin nhắn</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{notices.length} tin</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">Trong học kỳ 1</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Chưa đọc</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">{unreadCount}</span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">Cần xem trước</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Đã gắn dấu sao</span>
            <span className="text-2xl font-black text-amber-600 leading-tight">
              {notices.filter(n => n.isStarred).length}
            </span>
            <span className="text-[10px] text-amber-500 font-medium block mt-1">Tin quan trọng</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Thông báo học phần</span>
            <span className="text-2xl font-black text-purple-600 leading-tight">4 lớp</span>
            <span className="text-[10px] text-purple-500 font-medium block mt-1">Kênh trao đổi sinh viên</span>
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
            placeholder="Tìm theo tiêu đề, người gửi, nội dung..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({notices.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'unread'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:text-rose-800'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('starred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'starred'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-600 hover:text-amber-800'
            }`}
          >
            Đã gắn sao ({notices.filter(n => n.isStarred).length})
          </button>
        </div>
      </div>

      {/* Notices List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotices.map(notice => (
          <div
            key={notice.id}
            className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
              !notice.isRead ? 'bg-blue-50/30' : ''
            }`}
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <button
                onClick={() => handleToggleStar(notice.id)}
                className={`mt-1 p-1 rounded-lg transition-colors cursor-pointer ${
                  notice.isStarred
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-300 hover:text-slate-500'
                }`}
              >
                <Star className={`w-4 h-4 ${notice.isStarred ? 'fill-amber-400' : ''}`} />
              </button>

              <div
                className="cursor-pointer min-w-0 flex-1"
                onClick={() => {
                  setSelectedNotice(notice)
                  if (!notice.isRead) handleToggleRead(notice.id)
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {!notice.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                  )}
                  <span className="font-bold text-xs text-slate-800">{notice.sender}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({notice.senderRole})</span>
                  <span className="text-[11px] text-slate-400">• {notice.sentAt}</span>

                  {notice.priority === 'urgent' && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Khẩn cấp
                    </span>
                  )}
                  {notice.targetClass && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      Lớp: {notice.targetClass}
                    </span>
                  )}
                </div>

                <h3 className={`text-sm mt-1 truncate ${!notice.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{notice.content}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleRead(notice.id)}
                className="text-xs text-slate-400 hover:text-slate-700 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                {notice.isRead ? 'Đánh dấu chưa đọc' : 'Đã đọc'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Xem chi tiết thông báo */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {selectedNotice.senderRole}
                </span>
                <h3 className="font-bold text-slate-800 text-sm mt-0.5">{selectedNotice.sender}</h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 leading-snug">
                {selectedNotice.title}
              </h2>

              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>Thời gian: {selectedNotice.sentAt}</span>
                {selectedNotice.targetClass && <span>Lớp: {selectedNotice.targetClass}</span>}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedNotice.content}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gửi thông báo tới lớp */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Gửi thông báo tới sinh viên lớp</h3>
                  <p className="text-[11px] text-slate-400">Tin nhắn sẽ gửi vào portal sinh viên và email</p>
                </div>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNoticeToClass} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Lớp nhận thông báo</label>
                <select
                  value={composeData.targetClass}
                  onChange={e => setComposeData({ ...composeData, targetClass: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="SE1623">SE1623 - Lập trình Web nâng cao (45 SV)</option>
                  <option value="SE1234">SE1234 - Cơ sở dữ liệu (38 SV)</option>
                  <option value="SE1710">SE1710 - Phát triển ứng dụng di động (42 SV)</option>
                  <option value="SE1805">SE1805 - Kiến trúc phần mềm (31 SV)</option>
                  <option value="ALL">Gửi tất cả 4 lớp phụ trách (156 SV)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tiêu đề thông báo</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Dặn dò chuẩn bị bài thuyết trình Tuần 9"
                  value={composeData.title}
                  onChange={e => setComposeData({ ...composeData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nội dung chi tiết</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập nội dung dặn dò sinh viên..."
                  value={composeData.content}
                  onChange={e => setComposeData({ ...composeData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi ngay</span>
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
