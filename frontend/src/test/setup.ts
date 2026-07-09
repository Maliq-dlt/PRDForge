import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch globally
;(globalThis as any).fetch = vi.fn()
