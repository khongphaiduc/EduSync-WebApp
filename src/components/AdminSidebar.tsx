import React from 'react'
import {
  GraduationCap,
  Home,
  Users,
  BookOpen,
  Calendar,
  Layers,
  CalendarDays,
  FileText,
  Bell,
  ShieldCheck,
  Settings,
  LogOut
} from 'lucide-react'
import type { AdminNavTab } from '../types'
import harvardLogo from '../assets/Harvard-Logo.png'

interface AdminSidebarProps {
  activeTab: AdminNavTab
  setActiveTab: (tab: AdminNavTab) => void
  onSwitchPortal: () => void
  onLogout?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const managementItems = [
    { id: 'students' as AdminNavTab, label: 'Sinh viên', icon: Users },
    { id: 'teachers' as AdminNavTab, label: 'Giảng viên', icon: GraduationCap },
    { id: 'subjects' as AdminNavTab, label: 'Môn học', icon: BookOpen },
    { id: 'semesters' as AdminNavTab, label: 'Học kỳ', icon: Calendar },
    { id: 'sections' as AdminNavTab, label: 'Lớp học phần', icon: Layers },
    { id: 'schedule' as AdminNavTab, label: 'Lịch học', icon: CalendarDays },
    { id: 'requests' as AdminNavTab, label: 'Đơn từ', icon: FileText },
    { id: 'notifications' as AdminNavTab, label: 'Thông báo', icon: Bell }
  ]

  const systemItems = [
    { id: 'accounts' as AdminNavTab, label: 'Tài khoản người dùng', icon: ShieldCheck },
    { id: 'settings' as AdminNavTab, label: 'Cài đặt', icon: Settings }
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
            Admin Portal
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2 space-y-4">
        {/* Top: Tổng quan */}
        <div>
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Tổng quan</span>
          </button>
        </div>

        {/* Section: QUẢN LÝ HỌC VỤ */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Quản lý học vụ
          </div>
          <div className="space-y-1">
            {managementItems.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section: HỆ THỐNG */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Hệ thống
          </div>
          <div className="space-y-1">
            {systemItems.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Logout action */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              if (onLogout) onLogout()
              else window.location.reload()
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Bottom Campus Card */}
      <div className="p-3 border-t border-slate-100 mt-auto">
        <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 p-2.5">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop&q=80"
            alt="University Campus"
            className="w-full h-18 object-cover rounded-lg"
          />
          <div className="mt-2 flex items-start justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800 leading-tight">Harvard University</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Hệ thống quản lý học vụ</div>
              <div className="text-[10px] text-slate-500 font-medium">Cambridge, MA</div>
            </div>
            <span className="text-[9px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
