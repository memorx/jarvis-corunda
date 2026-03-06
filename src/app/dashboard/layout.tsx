import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Sidebar
        user={{
          name: session.user.name || '',
          email: session.user.email || '',
          role: (session.user as any).role || 'COMMUNITY',
          image: session.user.image,
        }}
      />
      <main className="pl-[260px] transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
