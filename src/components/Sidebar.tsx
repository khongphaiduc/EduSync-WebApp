import React from 'react'
import {
  Home,
  BookOpen,
  Edit3,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'
import type { ActiveNavTab } from '../types'
import harvardLogo from '../assets/Harvard-Logo.png'

interface SidebarProps {
  activeTab: ActiveNavTab
  setActiveTab: (tab: ActiveNavTab) => void
  pendingRequestsCount: number
  onLogout?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingRequestsCount,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard' as ActiveNavTab, label: 'Trang chủ', icon: Home },
    { id: 'classes' as ActiveNavTab, label: 'Lớp học của tôi', icon: BookOpen },
    {
      id: 'grades' as ActiveNavTab,
      label: 'Nhập điểm',
      icon: Edit3,
      hasSubmenu: true
    },
    { id: 'schedule' as ActiveNavTab, label: 'Lịch giảng dạy', icon: Calendar },
    { id: 'students' as ActiveNavTab, label: 'Sinh viên', icon: Users },
    {
      id: 'requests' as ActiveNavTab,
      label: 'Đơn từ',
      icon: MessageSquare,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined
    },
    { id: 'notifications' as ActiveNavTab, label: 'Thông báo', icon: Bell },
    { id: 'materials' as ActiveNavTab, label: 'Tài liệu học phần', icon: FileText },
    { id: 'reports' as ActiveNavTab, label: 'Báo cáo - Thống kê', icon: BarChart3 }
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
          <img src={harvardLogo} alt="Harvard Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="text-sm font-black tracking-tight text-slate-800 leading-tight">
            Harvard University
          </div>
          <div className="text-[11px] text-red-700 font-semibold leading-none mt-0.5">
            Cổng Giảng Viên
          </div>
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-rose-500 text-white shadow-sm'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                )}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Bottom Nav Items */}
      <div className="p-3 border-t border-slate-100 space-y-1 mt-auto">
        <button
          onClick={() => alert('Cài đặt hệ thống & hồ sơ giảng viên')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Cài đặt</span>
        </button>

        <button
          onClick={() => {
            if (onLogout) onLogout()
            else window.location.reload()
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
