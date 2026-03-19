import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CalendarView } from '../parrilla/calendar-view'

const mockEntries = [
  {
    id: '1',
    publishDate: '2025-03-10T12:00:00Z',
    platform: 'META_FEED',
    contentType: 'STATIC_IMAGE',
    headline: 'Promo de Marzo',
    visualConcept: null,
    status: 'DRAFT',
  },
  {
    id: '2',
    publishDate: '2025-03-10T12:00:00Z',
    platform: 'TIKTOK',
    contentType: 'VIDEO_SHORT',
    headline: null,
    visualConcept: 'Video concept',
    status: 'DRAFT',
  },
  {
    id: '3',
    publishDate: '2025-03-15T12:00:00Z',
    platform: 'GOOGLE_DISPLAY',
    contentType: 'STATIC_IMAGE',
    headline: 'Banner Google',
    visualConcept: null,
    status: 'APPROVED',
  },
]

describe('CalendarView', () => {
  it('renderiza los 7 días de la semana como headers', () => {
    render(
      <CalendarView entries={[]} month={3} year={2025} onEntryClick={() => {}} />
    )

    expect(screen.getByText('Lun')).toBeDefined()
    expect(screen.getByText('Mar')).toBeDefined()
    expect(screen.getByText('Mié')).toBeDefined()
    expect(screen.getByText('Jue')).toBeDefined()
    expect(screen.getByText('Vie')).toBeDefined()
    expect(screen.getByText('Sáb')).toBeDefined()
    expect(screen.getByText('Dom')).toBeDefined()
  })

  it('muestra el nombre del mes y año', () => {
    render(
      <CalendarView entries={[]} month={3} year={2025} onEntryClick={() => {}} />
    )

    expect(screen.getByText('Marzo 2025')).toBeDefined()
  })

  it('renderiza entries en el día correcto', () => {
    render(
      <CalendarView entries={mockEntries} month={3} year={2025} onEntryClick={() => {}} />
    )

    // Entries appear in both desktop and mobile, so use getAllByText
    const promoElements = screen.getAllByText('Promo de Marzo')
    expect(promoElements.length).toBeGreaterThanOrEqual(1)

    const bannerElements = screen.getAllByText('Banner Google')
    expect(bannerElements.length).toBeGreaterThanOrEqual(1)
  })

  it('click en entry llama onEntryClick', () => {
    const onEntryClick = vi.fn()
    render(
      <CalendarView entries={mockEntries} month={3} year={2025} onEntryClick={onEntryClick} />
    )

    // Click the first occurrence (desktop view)
    const promoElements = screen.getAllByText('Promo de Marzo')
    fireEvent.click(promoElements[0])
    expect(onEntryClick).toHaveBeenCalledWith(mockEntries[0])
  })

  it('entry sin headline muestra visualConcept', () => {
    render(
      <CalendarView entries={mockEntries} month={3} year={2025} onEntryClick={() => {}} />
    )

    const videoElements = screen.getAllByText('Video concept')
    expect(videoElements.length).toBeGreaterThanOrEqual(1)
  })

  it('navega al mes siguiente', () => {
    render(
      <CalendarView entries={[]} month={3} year={2025} onEntryClick={() => {}} />
    )

    expect(screen.getByText('Marzo 2025')).toBeDefined()

    // Next month button is the second navigation button
    const navButtons = screen.getByText('Marzo 2025').parentElement!
    const nextButton = navButtons.querySelectorAll('button')[1]
    fireEvent.click(nextButton)

    expect(screen.getByText('Abril 2025')).toBeDefined()
  })
})
