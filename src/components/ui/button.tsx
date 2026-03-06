import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/25',
        secondary: 'bg-[#1A1A2E] text-[#FAFAFA] border border-white/10 hover:bg-[#16213E] hover:border-white/20',
        destructive: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
        ghost: 'text-[#94A3B8] hover:text-[#FAFAFA] hover:bg-white/5',
        link: 'text-cyan-400 underline-offset-4 hover:underline',
        orange: 'bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/25',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
