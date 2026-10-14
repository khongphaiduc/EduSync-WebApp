import React, { useState } from 'react'
import { Search, Bell, ChevronDown, CheckCheck, RefreshCw } from 'lucide-react'

interface AdminHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSwitchPortal: () => void
  onLogout?: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onSwitchPortal,
  onLogout
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const notifications = [
    { id: 1, text: 'Phòng Khảo thí vừa cập nhật kết quả phúc khảo 4 sinh viên', time: '5 phút trước' },
    { id: 2, text: 'Có 12 đơn từ học vụ mới đang chờ duyệt từ sinh viên', time: '30 phút trước' },
    { id: 3, text: 'Khoa CNTT đã hoàn tất phân công giảng viên cho HK1', time: '2 giờ trước' }
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
          placeholder="Tìm kiếm sinh viên, giảng viên, môn học, lớp học phần..."
          className="w-full pl-10 pr-16 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200/70 border border-slate-300 text-[10px] font-semibold text-slate-500">
          Ctrl K
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Switch Portal button */}
        <button
          onClick={onSwitchPortal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="Chuyển sang giao diện Cổng Giảng Viên"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Sang Cổng Giảng viên</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center text-slate-600 relative transition-colors cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">Thông báo Phòng Đào tạo</span>
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
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt="Nguyễn Văn Minh"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">Nguyễn Văn Minh</p>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">Quản trị viên</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800 text-sm">Nguyễn Văn Minh</p>
                <p className="text-slate-500">Phòng Quản lý Đào tạo</p>
                <p className="text-blue-600 mt-0.5">minhnv@harvard.edu</p>
              </div>
              <button
                onClick={onSwitchPortal}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Chuyển Cổng Giảng viên
              </button>
              <button
                onClick={() => {
                  alert('Cài đặt hệ thống đào tạo')
                  setShowProfileMenu(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
              >
                Cài đặt hệ thống
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  if (onLogout) onLogout()
                  else window.location.reload()
                }}
                className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
