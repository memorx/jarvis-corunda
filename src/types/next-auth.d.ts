import { UserRole } from '@/generated/prisma/client'
import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: UserRole
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
