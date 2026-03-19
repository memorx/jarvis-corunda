'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, CheckCircle, LogOut, Zap } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

interface ClientSidebarProps {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

const clientNavigation = [
  { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mis Parrillas', href: '/dashboard/accounts', icon: CalendarDays },
  { name: 'Aprobaciones', href: '/dashboard/approvals', icon: CheckCircle },
]

export function ClientSidebar({ user }: ClientSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-white/5 bg-[#0A0A0F]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shrink-0">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#FAFAFA]">Koi Ads</h1>
          <p className="text-[10px] text-cyan-400 font-medium">Portal de Cliente</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {clientNavigation.map((item) => {
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
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-cyan-400')} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={user.name} src={user.image} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-[#FAFAFA] truncate">{user.name}</p>
            <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#94A3B8] hover:bg-white/5 hover:text-red-400 transition-colors mt-1"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
