import React, { useState } from 'react'
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  CheckCircle2
} from 'lucide-react'
import harvardBg from '../assets/harvard-university-copy.webp'
import harvardLogo from '../assets/Harvard-Logo.png'
import type { PortalMode } from '../types'

interface LoginViewProps {
  onLoginSuccess: (mode: PortalMode, userName: string) => void
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin@harvard.edu')
  const [password, setPassword] = useState('••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ tài khoản và mật khẩu!')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    setTimeout(() => {
      setIsLoading(false)
      const lower = username.toLowerCase()
      if (lower.includes('annv') || lower.includes('teacher') || lower.includes('giangvien')) {
        onLoginSuccess('teacher', 'ThS. Nguyễn Văn An')
      } else {
        onLoginSuccess('admin', 'Nguyễn Văn Minh')
      }
    }, 600)
  }

  const handleQuickFill = (acc: 'admin' | 'teacher') => {
    if (acc === 'admin') {
      setUsername('admin@harvard.edu')
      setPassword('admin123')
    } else {
      setUsername('annv@harvard.edu')
      setPassword('teacher123')
    }
    setErrorMessage(null)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background with Harvard Image and Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={harvardBg}
          alt="Harvard Campus Background"
          className="w-full h-full object-cover object-center scale-105 transform animate-in fade-in zoom-in-95 duration-1000"
        />
        {/* Layered Gradient & Backdrop Blur Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90 pointer-events-none"></div>
      </div>

      {/* Top Floating Branding */}
      <header className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            src={harvardLogo}
            alt="Harvard Logo"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          />
          <div className="hidden sm:block">
            <span className="text-white font-extrabold text-lg tracking-tight drop-shadow-md">
              Harvard University
            </span>
            <span className="text-red-300 text-xs font-semibold ml-2 px-2 py-0.5 rounded-full bg-red-900/40 border border-red-500/30">
              Education Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Hệ thống Quản lý Đào tạo Đại học Harvard
          </span>
        </div>
      </header>

      {/* Main Login Card (Single Unified Form) */}
      <div className="relative z-10 w-full max-w-md my-auto pt-16 sm:pt-0">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/80 animate-in fade-in zoom-in-95 duration-500">
          {/* Logo Badge in card */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs mb-3 flex items-center justify-center">
              <img
                src={harvardLogo}
                alt="Logo"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Đăng Nhập Hệ Thống
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium max-w-xs">
              Cổng thông tin tích hợp quản lý đào tạo và học vụ Harvard University
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tài khoản / Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Nhập email tài khoản (VD: admin@harvard.edu)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault()
                    alert('Vui lòng liên hệ Phòng Đào tạo (support@harvard.edu) để cấp lại mật khẩu.')
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
              </label>

              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Phiên bản 2026
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Đăng Nhập Vào Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Hints */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
              ⚡ Điền nhanh tài khoản mẫu
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="py-2 px-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/90 text-blue-700 font-bold border border-blue-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('teacher')}
                className="py-2 px-2.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-700 font-bold border border-emerald-200/80 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giảng Viên</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-[11px] text-slate-300/80 drop-shadow flex items-center justify-center gap-3">
          <span>Bảo mật SSL 256-bit</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Hỗ trợ kỹ thuật
          </span>
          <span>•</span>
          <span>Harvard University © 2026</span>
        </div>
      </div>
    </div>
  )
}
