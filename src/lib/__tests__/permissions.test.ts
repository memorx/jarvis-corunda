import { describe, it, expect } from 'vitest'
import { hasPermission } from '../permissions'

describe('hasPermission', () => {
  describe('SUPERADMIN (wildcard total)', () => {
    it('tiene acceso a accounts:read', () => {
      expect(hasPermission('SUPERADMIN', 'accounts:read')).toBe(true)
    })

    it('tiene acceso a cualquier permiso arbitrario', () => {
      expect(hasPermission('SUPERADMIN', 'anything:anything')).toBe(true)
    })

    it('tiene acceso a team:write', () => {
      expect(hasPermission('SUPERADMIN', 'team:write')).toBe(true)
    })
  })

  describe('MANAGER (wildcards por recurso)', () => {
    it('tiene accounts:read (permiso exacto)', () => {
      expect(hasPermission('MANAGER', 'accounts:read')).toBe(true)
    })

    it('tiene accounts:write (permiso exacto)', () => {
      expect(hasPermission('MANAGER', 'accounts:write')).toBe(true)
    })

    it('tiene parrillas:read (por parrillas:*)', () => {
      expect(hasPermission('MANAGER', 'parrillas:read')).toBe(true)
    })

    it('tiene parrillas:edit (por parrillas:*)', () => {
      expect(hasPermission('MANAGER', 'parrillas:edit')).toBe(true)
    })

    it('tiene parrillas:create (por parrillas:*)', () => {
      expect(hasPermission('MANAGER', 'parrillas:create')).toBe(true)
    })

    it('tiene team:read (permiso exacto)', () => {
      expect(hasPermission('MANAGER', 'team:read')).toBe(true)
    })

    it('NO tiene team:write (solo tiene team:read)', () => {
      expect(hasPermission('MANAGER', 'team:write')).toBe(false)
    })
  })

  describe('COMMUNITY', () => {
    it('tiene accounts:read', () => {
      expect(hasPermission('COMMUNITY', 'accounts:read')).toBe(true)
    })

    it('NO tiene accounts:write', () => {
      expect(hasPermission('COMMUNITY', 'accounts:write')).toBe(false)
    })

    it('tiene parrillas:create', () => {
      expect(hasPermission('COMMUNITY', 'parrillas:create')).toBe(true)
    })

    it('tiene parrillas:edit', () => {
      expect(hasPermission('COMMUNITY', 'parrillas:edit')).toBe(true)
    })

    it('tiene parrillas:read', () => {
      expect(hasPermission('COMMUNITY', 'parrillas:read')).toBe(true)
    })

    it('tiene playground:use (por playground:*)', () => {
      expect(hasPermission('COMMUNITY', 'playground:use')).toBe(true)
    })

    it('NO tiene campaigns:read', () => {
      expect(hasPermission('COMMUNITY', 'campaigns:read')).toBe(false)
    })

    it('NO tiene assets:upload', () => {
      expect(hasPermission('COMMUNITY', 'assets:upload')).toBe(false)
    })
  })

  describe('TRAFFIC', () => {
    it('tiene campaigns:read (por campaigns:*)', () => {
      expect(hasPermission('TRAFFIC', 'campaigns:read')).toBe(true)
    })

    it('tiene campaigns:write (por campaigns:*)', () => {
      expect(hasPermission('TRAFFIC', 'campaigns:write')).toBe(true)
    })

    it('tiene parrillas:read', () => {
      expect(hasPermission('TRAFFIC', 'parrillas:read')).toBe(true)
    })

    it('NO tiene parrillas:edit (solo read)', () => {
      expect(hasPermission('TRAFFIC', 'parrillas:edit')).toBe(false)
    })

    it('tiene playground:use (por playground:*)', () => {
      expect(hasPermission('TRAFFIC', 'playground:use')).toBe(true)
    })
  })

  describe('DESIGNER', () => {
    it('tiene parrillas:read', () => {
      expect(hasPermission('DESIGNER', 'parrillas:read')).toBe(true)
    })

    it('NO tiene parrillas:edit', () => {
      expect(hasPermission('DESIGNER', 'parrillas:edit')).toBe(false)
    })

    it('tiene assets:upload', () => {
      expect(hasPermission('DESIGNER', 'assets:upload')).toBe(true)
    })

    it('NO tiene playground:use', () => {
      expect(hasPermission('DESIGNER', 'playground:use')).toBe(false)
    })

    it('NO tiene campaigns:read', () => {
      expect(hasPermission('DESIGNER', 'campaigns:read')).toBe(false)
    })
  })

  describe('PRODUCER', () => {
    it('tiene parrillas:read', () => {
      expect(hasPermission('PRODUCER', 'parrillas:read')).toBe(true)
    })

    it('tiene assets:upload', () => {
      expect(hasPermission('PRODUCER', 'assets:upload')).toBe(true)
    })

    it('NO tiene playground:use', () => {
      expect(hasPermission('PRODUCER', 'playground:use')).toBe(false)
    })
  })

  describe('CLIENT', () => {
    it('tiene parrillas:read (por :own match)', () => {
      expect(hasPermission('CLIENT', 'parrillas:read')).toBe(true)
    })

    it('NO tiene parrillas:edit', () => {
      expect(hasPermission('CLIENT', 'parrillas:edit')).toBe(false)
    })

    it('tiene approvals:create', () => {
      expect(hasPermission('CLIENT', 'approvals:create')).toBe(true)
    })

    it('NO tiene accounts:read', () => {
      expect(hasPermission('CLIENT', 'accounts:read')).toBe(false)
    })

    it('NO tiene playground:use', () => {
      expect(hasPermission('CLIENT', 'playground:use')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('retorna false para rol desconocido', () => {
      expect(hasPermission('UNKNOWN_ROLE', 'anything')).toBe(false)
    })

    it('retorna false para rol vacío', () => {
      expect(hasPermission('', 'accounts:read')).toBe(false)
    })
  })
})
