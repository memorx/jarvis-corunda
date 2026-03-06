'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Megaphone,
  BarChart3,
  Sparkles,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

interface SidebarProps {
  user: {
    name: string
    email: string
    role: string
    image?: string | null
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cuentas', href: '/dashboard/accounts', icon: Building2 },
  { name: 'Rendimiento', href: '/dashboard/performance', icon: BarChart3 },
  { name: 'AI Playground', href: '/dashboard/playground', icon: Sparkles },
  { name: 'Equipo', href: '/dashboard/team', icon: Users },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-[#0A0A0F] transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shrink-0">
          <Zap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-[#FAFAFA] truncate">
              Jarvis Corunda
            </h1>
            <p className="text-[10px] text-cyan-400 font-medium">AI Marketing Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#FAFAFA]'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-cyan-400')} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} src={user.image} size="sm" />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-[#FAFAFA] truncate">{user.name}</p>
              <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
            </div>
          )}
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#94A3B8] hover:bg-white/5 hover:text-red-400 transition-colors mt-1',
            )}
            title={collapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </form>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#1A1A2E] text-[#94A3B8] hover:text-[#FAFAFA] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  )
}
