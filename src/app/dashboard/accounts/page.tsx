'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Building2,
  Users,
  CalendarDays,
  Megaphone,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react'
import { PLATFORM_LABELS } from '@/lib/constants'

interface Account {
  id: string
  name: string
  brandName: string
  industry: string | null
  description: string | null
  brandColors: string[]
  platforms: string[]
  isActive: boolean
  _count: { parrillas: number; campaigns: number }
  users: { user: { id: string; name: string; avatar: string | null } }[]
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const [newAccount, setNewAccount] = useState({
    name: '',
    brandName: '',
    industry: '',
    description: '',
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/accounts')
      const data = await res.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setNewAccount({ name: '', brandName: '', industry: '', description: '' })
        fetchAccounts()
      }
    } catch (error) {
      console.error('Error creating account:', error)
    } finally {
      setCreating(false)
    }
  }

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Header title="Cuentas" />
      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar cuentas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#1A1A2E] py-2 pl-10 pr-4 text-sm text-[#FAFAFA] placeholder:text-[#94A3B8]/50 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-cyan-500/10 text-cyan-400' : 'text-[#94A3B8] hover:text-[#FAFAFA]'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-cyan-500/10 text-cyan-400' : 'text-[#94A3B8] hover:text-[#FAFAFA]'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Nueva Cuenta
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map((account) => (
              <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
                <Card className="h-full hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            backgroundColor: account.brandColors?.[0] || '#1A1A2E',
                          }}
                        >
                          {account.brandName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#FAFAFA] group-hover:text-cyan-400 transition-colors">
                            {account.brandName}
                          </h3>
                          <p className="text-xs text-[#94A3B8]">{account.industry || 'Sin industria'}</p>
                        </div>
                      </div>
                    </div>

                    {account.description && (
                      <p className="text-sm text-[#94A3B8] mb-4 line-clamp-2">
                        {account.description}
                      </p>
                    )}

                    {/* Platforms */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {account.platforms.slice(0, 4).map((p) => (
                        <Badge key={p} variant="secondary" className="text-[10px]">
                          {PLATFORM_LABELS[p] || p}
                        </Badge>
                      ))}
                      {account.platforms.length > 4 && (
                        <Badge variant="secondary" className="text-[10px]">
                          +{account.platforms.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {account._count.parrillas} parrillas
                      </span>
                      <span className="flex items-center gap-1">
                        <Megaphone className="h-3 w-3" />
                        {account._count.campaigns} campañas
                      </span>
                    </div>

                    {/* Team */}
                    {account.users.length > 0 && (
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                        <Users className="h-3 w-3 text-[#94A3B8] mr-1" />
                        <div className="flex -space-x-2">
                          {account.users.slice(0, 4).map((au) => (
                            <Avatar
                              key={au.user.id}
                              name={au.user.name}
                              src={au.user.avatar}
                              size="sm"
                              className="ring-2 ring-[#1A1A2E] h-6 w-6 text-[8px]"
                            />
                          ))}
                        </div>
                        {account.users.length > 4 && (
                          <span className="text-xs text-[#94A3B8] ml-1">
                            +{account.users.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* List View */}
        {!loading && viewMode === 'list' && (
          <Card>
            <div className="divide-y divide-white/5">
              {filteredAccounts.map((account) => (
                <Link
                  key={account.id}
                  href={`/dashboard/accounts/${account.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: account.brandColors?.[0] || '#1A1A2E' }}
                  >
                    {account.brandName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#FAFAFA]">{account.brandName}</h3>
                    <p className="text-sm text-[#94A3B8] truncate">{account.description || account.industry || ''}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-[#94A3B8]">
                    <span>{account._count.parrillas} parrillas</span>
                    <span>{account._count.campaigns} campañas</span>
                    <span>{account.users.length} miembros</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {!loading && filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-[#94A3B8]/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#FAFAFA] mb-1">
              {searchTerm ? 'Sin resultados' : 'Sin cuentas'}
            </h3>
            <p className="text-sm text-[#94A3B8]">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea tu primera cuenta para comenzar'}
            </p>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Cuenta"
        description="Agrega una nueva cuenta de cliente"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <Input
            id="name"
            label="Nombre de la cuenta"
            placeholder="Ej: Mi Cliente"
            value={newAccount.name}
            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
            required
          />
          <Input
            id="brandName"
            label="Nombre de la marca"
            placeholder="Ej: Mi Marca"
            value={newAccount.brandName}
            onChange={(e) => setNewAccount({ ...newAccount, brandName: e.target.value })}
            required
          />
          <Input
            id="industry"
            label="Industria"
            placeholder="Ej: Restaurante, E-commerce, etc."
            value={newAccount.industry}
            onChange={(e) => setNewAccount({ ...newAccount, industry: e.target.value })}
          />
          <Textarea
            id="description"
            label="Descripción"
            placeholder="¿Qué hace el cliente?"
            value={newAccount.description}
            onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creando...' : 'Crear Cuenta'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
