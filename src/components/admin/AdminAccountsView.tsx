import React, { useState } from 'react'
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  X,
  User,
  GraduationCap,
  Users,
  ShieldAlert
} from 'lucide-react'

interface UserAccount {
  id: string
  username: string
  fullName: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  status: 'active' | 'locked'
  lastLogin: string
  createdAt: string
  avatar: string
}

const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-1',
    username: 'admin.minh',
    fullName: 'Nguyễn Văn Minh',
    email: 'admin.minh@harvard.edu.vn',
    role: 'admin',
    status: 'active',
    lastLogin: '15/10/2026 07:45',
    createdAt: '01/01/2025',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'acc-2',
    username: 'gv.annguyen',
    fullName: 'ThS. Nguyễn Văn An',
    email: 'an.nguyen@harvard.edu.vn',
    role: 'teacher',
    status: 'active',
    lastLogin: '14/10/2026 18:20',
    createdAt: '15/08/2025',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'acc-3',
    username: 'gv.maitran',
    fullName: 'TS. Trần Thị Mai',
    email: 'mai.tran@harvard.edu.vn',
    role: 'teacher',
    status: 'active',
    lastLogin: '14/10/2026 16:10',
    createdAt: '10/09/2025',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'acc-4',
    username: 'stu.002',
    fullName: 'Nguyễn Văn B',
    email: 'new.student@example.com',
    role: 'student',
    status: 'active',
    lastLogin: '13/10/2026 21:05',
    createdAt: '01/09/2026',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'acc-5',
    username: 'stu.003',
    fullName: 'Trần Thị Mai Anh',
    email: 'maianh.tran@example.com',
    role: 'student',
    status: 'active',
    lastLogin: '14/10/2026 11:30',
    createdAt: '01/09/2025',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'acc-6',
    username: 'stu.009_suspend',
    fullName: 'Lê Văn Tạm Khóa',
    email: 'tamkhoa.le@example.com',
    role: 'student',
    status: 'locked',
    lastLogin: '01/09/2026 10:00',
    createdAt: '01/09/2025',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
]

export const AdminAccountsView: React.FC = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newAcc, setNewAcc] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'teacher' as 'admin' | 'teacher' | 'student',
    password: ''
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleToggleLock = (id: string) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === id) {
          const newStatus = acc.status === 'active' ? 'locked' : 'active'
          showToast(
            `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản ${acc.username}!`
          )
          return { ...acc, status: newStatus }
        }
        return acc
      })
    )
  }

  const handleResetPassword = (username: string) => {
    showToast(`Đã gửi email khôi phục mật khẩu tạm thời cho tài khoản ${username}!`)
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAcc.username || !newAcc.fullName || !newAcc.email) {
      alert('Vui lòng điền đầy đủ thông tin.')
      return
    }

    const created: UserAccount = {
      id: `acc-${Date.now()}`,
      username: newAcc.username,
      fullName: newAcc.fullName,
      email: newAcc.email,
      role: newAcc.role,
      status: 'active',
      lastLogin: 'Chưa đăng nhập',
      createdAt: '15/10/2026',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    }

    setAccounts([created, ...accounts])
    setIsModalOpen(false)
    showToast(`Đã tạo tài khoản [${created.username}] vai trò ${created.role.toUpperCase()} thành công!`)
    setNewAcc({
      username: '',
      fullName: '',
      email: '',
      role: 'teacher',
      password: ''
    })
  }

  const filteredAccounts = accounts.filter(acc => {
    const matchSearch =
      acc.username.toLowerCase().includes(search.toLowerCase()) ||
      acc.fullName.toLowerCase().includes(search.toLowerCase()) ||
      acc.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || acc.role === roleFilter
    const matchStatus = statusFilter === 'ALL' || acc.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            Quản Lý Tài Khoản Người Dùng & Phân Quyền Hệ Thống
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-12.5">
            Cấp quyền tài khoản quản trị viên, giảng viên và sinh viên, đặt lại mật khẩu và khóa tài khoản
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo tài khoản mới</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tổng tài khoản</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">1,350</span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-1">Đồng bộ SSO Harvard</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Quản trị viên (Admin)</span>
            <span className="text-2xl font-black text-rose-600 leading-tight">12</span>
            <span className="text-[10px] text-rose-500 font-medium block mt-1">Quyền Super Admin & Đào Tạo</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tài khoản Giảng viên</span>
            <span className="text-2xl font-black text-blue-600 leading-tight">86</span>
            <span className="text-[10px] text-blue-500 font-medium block mt-1">100% kích hoạt</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Tài khoản Sinh viên</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">1,252</span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">6 tài khoản đang khóa</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo username, họ tên, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="teacher">Giảng viên (Teacher)</option>
              <option value="student">Sinh viên (Student)</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Người dùng</th>
                <th className="py-3.5 px-4 font-bold">Tên đăng nhập</th>
                <th className="py-3.5 px-4 font-bold">Email</th>
                <th className="py-3.5 px-4 font-bold text-center">Vai trò</th>
                <th className="py-3.5 px-4 font-bold">Lần đăng nhập cuối</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img src={acc.avatar} alt={acc.fullName} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-slate-800">{acc.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{acc.username}</td>
                  <td className="py-3 px-4 text-slate-600">{acc.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        acc.role === 'admin'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : acc.role === 'teacher'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {acc.role === 'admin' ? 'Quản trị viên' : acc.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{acc.lastLogin}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        acc.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {acc.status === 'active' ? 'Hoạt động' : 'Đang khóa'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleResetPassword(acc.username)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                        title="Đặt lại mật khẩu"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleLock(acc.id)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${
                          acc.status === 'active'
                            ? 'text-slate-400 hover:text-rose-600'
                            : 'text-rose-500 hover:text-emerald-600'
                        }`}
                        title={acc.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {acc.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo tài khoản mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Cấp tài khoản người dùng mới</h3>
                  <p className="text-[11px] text-slate-400">Tạo tài khoản đăng nhập cho hệ thống Harvard</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên đăng nhập (Username)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: gv.namtran"
                    value={newAcc.username}
                    onChange={e => setNewAcc({ ...newAcc, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Vai trò phân quyền</label>
                  <select
                    value={newAcc.role}
                    onChange={e => setNewAcc({ ...newAcc, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500 bg-white"
                  >
                    <option value="student">Sinh viên (Student)</option>
                    <option value="teacher">Giảng viên (Teacher)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Họ và tên người dùng</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trần Hoàng Nam"
                  value={newAcc.fullName}
                  onChange={e => setNewAcc({ ...newAcc, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    required
                    placeholder="nam.tran@harvard.edu.vn"
                    value={newAcc.email}
                    onChange={e => setNewAcc({ ...newAcc, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Mật khẩu ban đầu</label>
                  <input
                    type="password"
                    placeholder="Mặc định: Harvard@2026"
                    value={newAcc.password}
                    onChange={e => setNewAcc({ ...newAcc, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  Tạo tài khoản
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
