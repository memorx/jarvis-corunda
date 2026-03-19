import { describe, it, expect, vi, afterEach } from 'vitest'

describe('supabase', () => {
  afterEach(() => {
    vi.resetModules()
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
  })

  describe('getSupabaseUrl', () => {
    it('retorna placeholder cuando no hay env var', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      vi.resetModules()

      const { getSupabaseUrl } = await import('@/lib/supabase')
      expect(getSupabaseUrl()).toBe('https://placeholder.supabase.co')
    })

    it('retorna la URL de la env var cuando está seteada', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://my-project.supabase.co'
      vi.resetModules()

      const { getSupabaseUrl } = await import('@/lib/supabase')
      expect(getSupabaseUrl()).toBe('https://my-project.supabase.co')
    })
  })

  describe('getPublicUrl', () => {
    it('construye URL pública correctamente', async () => {
      const { getPublicUrl } = await import('@/lib/supabase')
      const url = getPublicUrl('assets', 'images/test.png')

      expect(url).toContain('/storage/v1/object/public/assets/images/test.png')
    })
  })

  describe('uploadToStorage', () => {
    it('retorna placeholder de no configurado', async () => {
      const { uploadToStorage } = await import('@/lib/supabase')
      const result = await uploadToStorage('bucket', 'path/file.png', Buffer.from(''), 'image/png')

      expect(result).toEqual({ url: null, error: 'Supabase not configured yet' })
    })
  })
})
