import { ROLE_PERMISSIONS } from './constants'

/**
 * Verifica si un rol tiene un permiso específico.
 *
 * Soporta wildcards:
 * - '*' → acceso total (SUPERADMIN)
 * - 'parrillas:*' → cualquier acción sobre parrillas
 * - 'parrillas:read' → solo lectura de parrillas
 *
 * Soporta :own suffix:
 * - 'parrillas:read:own' matchea 'parrillas:read' (la restricción :own se aplica en el handler)
 */
export function hasPermission(role: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false

  // Wildcard total — SUPERADMIN
  if (permissions.includes('*')) return true

  // Match exacto
  if (permissions.includes(permission)) return true

  // Wildcard por recurso: 'parrillas:*' matchea 'parrillas:read', 'parrillas:edit', etc.
  const [resource] = permission.split(':')
  if (permissions.includes(`${resource}:*`)) return true

  // Match parcial con :own suffix — el filtrado real se hace en la query
  // 'parrillas:read:own' matchea 'parrillas:read' (la restricción :own se aplica en el handler)
  const ownPermission = `${permission}:own`
  if (permissions.includes(ownPermission)) return true

  return false
}
