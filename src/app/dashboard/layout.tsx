import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { ClientSidebar } from '@/components/layout/client-sidebar'
import { ToastProvider } from '@/components/ui/toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/')
  }

  const role = (session.user as any).role

  if (role === 'CLIENT') {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <ClientSidebar
          user={{
            name: session.user.name || '',
            email: session.user.email || '',
            image: session.user.image,
          }}
        />
        <main className="pl-[260px] transition-all duration-300">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Sidebar
        user={{
          name: session.user.name || '',
          email: session.user.email || '',
          role: role || 'COMMUNITY',
          image: session.user.image,
        }}
      />
      <main className="pl-[260px] transition-all duration-300">
        <ToastProvider>
          {children}
        </ToastProvider>
      </main>
    </div>
  )
}
