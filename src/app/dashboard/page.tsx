import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Megaphone,
  CalendarDays,
  DollarSign,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  const stats = [
    {
      title: 'Cuentas Activas',
      value: '4',
      change: '+2 este mes',
      icon: Building2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Campañas Activas',
      value: '12',
      change: '+3 esta semana',
      icon: Megaphone,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Contenido Pendiente',
      value: '28',
      change: '8 para revisar',
      icon: CalendarDays,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Gasto Mensual',
      value: '$45,200',
      change: '+12% vs mes anterior',
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ]

  const recentActivity = [
    { text: 'Parrilla "Marzo 2026 - Koi" creada', time: 'Hace 2 horas', type: 'create' },
    { text: 'Campaña "Amanti Spring" aprobada', time: 'Hace 5 horas', type: 'approve' },
    { text: '15 copies generados para Xplora Bike', time: 'Hace 1 día', type: 'ai' },
    { text: 'Cliente PEMT aprobó parrilla de Febrero', time: 'Hace 2 días', type: 'approve' },
    { text: 'Nuevas métricas importadas para 3 campañas', time: 'Hace 3 días', type: 'metrics' },
  ]

  return (
    <>
      <Header title={`¡Hola, ${session?.user?.name || 'usuario'}!`} />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#94A3B8]">{stat.title}</p>
                    <p className="mt-1 text-2xl font-bold text-[#FAFAFA]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8] flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} rounded-xl p-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/accounts" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <Plus className="h-4 w-4 text-cyan-400" />
                  Nueva Parrilla
                </Button>
              </Link>
              <Link href="/dashboard/accounts" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <Megaphone className="h-4 w-4 text-orange-400" />
                  Nueva Campaña
                </Button>
              </Link>
              <Link href="/dashboard/playground" className="block">
                <Button variant="secondary" className="w-full justify-start gap-3">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  AI Playground
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-[#FAFAFA]">{activity.text}</p>
                      <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
