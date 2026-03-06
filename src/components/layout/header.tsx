'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md px-6">
      <div>
        {title && (
          <h1 className="text-xl font-semibold text-[#FAFAFA]">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
        </Button>
      </div>
    </header>
  )
}
