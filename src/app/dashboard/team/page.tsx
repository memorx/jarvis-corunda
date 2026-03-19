'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Users, Mail, Shield } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/constants'
import { useToast } from '@/components/ui/toast'

const ROLES = Object.keys(ROLE_LABELS)

function getRoleVariant(role: string) {
  const map: Record<string, any> = {
    SUPERADMIN: 'error',
    MANAGER: 'warning',
    COMMUNITY: 'default',
    TRAFFIC: 'orange',
    DESIGNER: 'success',
    PRODUCER: 'success',
    CLIENT: 'secondary',
  }
  return map[role] || 'secondary'
}

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'COMMUNITY' })
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  function fetchUsers() {
    setFetchError(null)
    setLoading(true)
    fetch('/api/users')
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar usuarios')
        return r.json()
      })
      .then(setUsers)
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowCreate(false)
        setForm({ name: '', email: '', password: '', role: 'COMMUNITY' })
        toast('success', 'Miembro creado exitosamente')
        const data = await fetch('/api/users').then(r => r.json())
        setUsers(data)
      } else {
        const err = await res.json()
        setError(err.error)
        toast('error', err.error || 'Error al crear miembro')
      }
    } catch (err: any) {
      setError(err.message)
      toast('error', err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Header title="Equipo" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[#94A3B8]">Gestiona los miembros del equipo y sus roles</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Nuevo Miembro
          </Button>
        </div>

        {fetchError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
            <Button variant="secondary" size="sm" className="mt-2" onClick={fetchUsers}>
              Reintentar
            </Button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-16" /></CardContent></Card>)}
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user: any) => (
              <Card key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar name={user.name} src={user.avatar} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#FAFAFA] truncate">{user.name}</h3>
                      <p className="text-xs text-[#94A3B8] truncate flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getRoleVariant(user.role)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-2">
                        {user._count?.assignedAccounts || 0} cuentas asignadas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Miembro" description="Invita a un nuevo miembro al equipo">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <Input label="Contraseña" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#94A3B8]">Rol</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="flex h-10 w-full rounded-lg border border-white/10 bg-[#1A1A2E] px-3 py-2 text-sm text-[#FAFAFA] focus:border-cyan-400/50 focus:outline-none">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3"><p className="text-sm text-red-400">{error}</p></div>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Creando...' : 'Crear Miembro'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
