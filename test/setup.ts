import { resetDB } from '@/lib/db'
import { beforeEach } from 'vitest'
beforeEach(() => resetDB())
