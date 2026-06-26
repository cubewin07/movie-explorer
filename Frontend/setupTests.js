// Vitest global test setup.
// Registers custom matchers for DOM assertions and accessibility audits so they
// are available in every test file without per-file imports.
import '@testing-library/jest-dom/vitest'
import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'

// `toHaveNoViolations` is already a matchers object ({ toHaveNoViolations: fn }),
// so it is spread directly into Vitest's expect.
expect.extend(toHaveNoViolations)
