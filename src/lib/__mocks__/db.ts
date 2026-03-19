import { vi } from 'vitest'

const prisma = {
  account: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
  aIGenerationLog: {
    create: vi.fn(),
  },
  parrilla: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  parrillaEntry: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  campaign: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  campaignMetrics: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  },
  accountDocument: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
}

export default prisma
