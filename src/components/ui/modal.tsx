'use client'

import { Fragment, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-50 w-full rounded-xl border border-white/10 bg-[#12121A] p-6 shadow-2xl',
          sizeClasses[size],
          className
        )}
      >
        {(title || description) && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              {title && (
                <h2 className="text-lg font-semibold text-[#FAFAFA]">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-[#94A3B8] hover:bg-white/5 hover:text-[#FAFAFA] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {description && (
              <p className="mt-1 text-sm text-[#94A3B8]">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
