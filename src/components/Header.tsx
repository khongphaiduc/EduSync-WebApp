import React, { useState } from 'react'
import { Search, Bell, ChevronDown, CheckCheck } from 'lucide-react'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onOpenNotifications?: () => void
  onSwitchPortal?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenNotifications,
  onSwitchPortal
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const notifications = [
    { id: 1, text: 'Sinh viên Trần Thị Mai vừa gửi đơn xin nghỉ học', time: '10 phút trước', unread: true },
    { id: 2, text: 'Hệ thống vừa mở cổng nhập điểm thi kết thúc học phần HK1', time: '1 giờ trước', unread: true },
    { id: 3, text: 'Nhắc nhở: Tiết dạy Lập trình Web nâng cao lúc 08:00', time: 'Hôm nay', unread: false }
  ]

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between gap-6 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm lớp học, sinh viên, học phần..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {onSwitchPortal && (
          <button
            onClick={onSwitchPortal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Chuyển sang Cổng Quản trị / Phòng Đào tạo"
          >
            <span>Sang Phòng Đào tạo</span>
          </button>
        )}
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu)
              if (onOpenNotifications) onOpenNotifications()
            }}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center text-slate-600 relative transition-colors cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">Thông báo mới</span>
                <span className="text-xs text-blue-600 cursor-pointer flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Đã đọc hết
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{n.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Nguyễn Văn An"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">Nguyễn Văn An</p>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">Giảng viên</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800 text-sm">ThS. Nguyễn Văn An</p>
                <p className="text-slate-500">Khoa Kỹ thuật Phần mềm</p>
                <p className="text-blue-600 mt-0.5">annv@harvard.edu</p>
              </div>
              <button
                onClick={() => {
                  alert('Chỉnh sửa thông tin cá nhân giảng viên')
                  setShowProfileMenu(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
              >
                Hồ sơ cá nhân
              </button>
              <button
                onClick={() => {
                  alert('Đổi mật khẩu tài khoản')
                  setShowProfileMenu(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
              >
                Đổi mật khẩu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
