'use client'

import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Image, Video } from 'lucide-react'
import { useState } from 'react'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/constants'

interface CalendarEntry {
  id: string
  publishDate: string
  platform: string
  contentType: string
  headline: string | null
  visualConcept: string | null
  status: string
}

interface CalendarViewProps {
  entries: CalendarEntry[]
  month: number // 1-12
  year: number
  onEntryClick: (entry: CalendarEntry) => void
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfWeek(month: number, year: number) {
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function getPlatformColor(platform: string) {
  if (platform.startsWith('META')) return 'bg-blue-500/20 text-blue-400'
  if (platform.startsWith('GOOGLE')) return 'bg-emerald-500/20 text-emerald-400'
  if (platform === 'TIKTOK') return 'bg-violet-500/20 text-violet-400'
  if (platform === 'YOUTUBE_SHORTS') return 'bg-red-500/20 text-red-400'
  if (platform === 'LINKEDIN') return 'bg-sky-500/20 text-sky-400'
  return 'bg-white/10 text-[#94A3B8]'
}

export function CalendarView({ entries, month, year, onEntryClick }: CalendarViewProps) {
  const [viewMonth, setViewMonth] = useState(month)
  const [viewYear, setViewYear] = useState(year)

  const daysInMonth = getDaysInMonth(viewMonth, viewYear)
  const firstDay = getFirstDayOfWeek(viewMonth, viewYear)
  const today = new Date()
  const isCurrentMonth = today.getMonth() + 1 === viewMonth && today.getFullYear() === viewYear

  // Previous month days to fill the first week
  const prevMonthDays = getDaysInMonth(viewMonth === 1 ? 12 : viewMonth - 1, viewMonth === 1 ? viewYear - 1 : viewYear)

  // Build grid cells
  const cells: { day: number; inMonth: boolean }[] = []

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inMonth: false })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true })
  }

  // Next month padding
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, inMonth: false })
    }
  }

  // Group entries by day
  const entriesByDay: Record<number, CalendarEntry[]> = {}
  for (const entry of entries) {
    const date = new Date(entry.publishDate)
    if (date.getMonth() + 1 === viewMonth && date.getFullYear() === viewYear) {
      const day = date.getDate()
      if (!entriesByDay[day]) entriesByDay[day] = []
      entriesByDay[day].push(entry)
    }
  }

  function prevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]

  return (
    <div>
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-[#FAFAFA] transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium text-[#FAFAFA]">
          {monthNames[viewMonth - 1]} {viewYear}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-[#94A3B8] hover:text-[#FAFAFA] transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Desktop: Full calendar grid */}
      <div className="hidden sm:block">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {WEEKDAYS.map(wd => (
            <div key={wd} className="text-center text-xs font-medium text-[#94A3B8] py-2">
              {wd}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px">
          {cells.map((cell, i) => {
            const isToday = isCurrentMonth && cell.inMonth && cell.day === today.getDate()
            const dayEntries = cell.inMonth ? (entriesByDay[cell.day] || []) : []

            return (
              <div
                key={i}
                className={`min-h-[100px] rounded-lg border p-1.5 transition-colors ${
                  isToday
                    ? 'border-cyan-500/50 bg-cyan-500/5'
                    : cell.inMonth
                    ? 'border-white/5 bg-white/[0.02]'
                    : 'border-transparent bg-transparent'
                }`}
              >
                <span className={`text-xs font-medium block mb-1 ${
                  isToday
                    ? 'text-cyan-400'
                    : cell.inMonth
                    ? 'text-[#94A3B8]'
                    : 'text-[#94A3B8]/30'
                }`}>
                  {cell.day}
                </span>
                <div className="space-y-1">
                  {dayEntries.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => onEntryClick(entry)}
                      className={`w-full flex items-center gap-1 rounded px-1.5 py-1 text-left transition-all hover:brightness-125 ${getPlatformColor(entry.platform)}`}
                    >
                      {['VIDEO_SHORT', 'VIDEO_LONG'].includes(entry.contentType) ? (
                        <Video className="h-3 w-3 shrink-0" />
                      ) : (
                        <Image className="h-3 w-3 shrink-0" />
                      )}
                      <span className="text-[10px] truncate">
                        {(entry.headline || entry.visualConcept || '').slice(0, 20)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: Only days with entries */}
      <div className="sm:hidden space-y-2">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1)
          .filter(day => entriesByDay[day]?.length)
          .map(day => {
            const isToday = isCurrentMonth && day === today.getDate()
            return (
              <div
                key={day}
                className={`rounded-lg border p-3 ${
                  isToday ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <span className={`text-xs font-medium block mb-2 ${isToday ? 'text-cyan-400' : 'text-[#94A3B8]'}`}>
                  {day} {monthNames[viewMonth - 1]}
                </span>
                <div className="space-y-1.5">
                  {entriesByDay[day].map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => onEntryClick(entry)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all hover:brightness-125 ${getPlatformColor(entry.platform)}`}
                    >
                      {['VIDEO_SHORT', 'VIDEO_LONG'].includes(entry.contentType) ? (
                        <Video className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Image className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="text-xs truncate flex-1">
                        {entry.headline || entry.visualConcept || 'Sin título'}
                      </span>
                      <Badge variant="secondary" className="text-[9px] shrink-0">
                        {PLATFORM_LABELS[entry.platform] || entry.platform}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        {Object.keys(entriesByDay).length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[#94A3B8]">No hay entradas programadas este mes</p>
          </div>
        )}
      </div>
    </div>
  )
}
