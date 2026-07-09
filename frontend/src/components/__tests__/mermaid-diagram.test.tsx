import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MermaidDiagram } from '../mermaid-diagram'
import DOMPurify from 'dompurify'

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg>mock-svg</svg>' }),
  },
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn().mockImplementation((val) => val),
  },
}))

describe('MermaidDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders svg and calls DOMPurify sanitization', async () => {
    const { container } = render(<MermaidDiagram chart="graph TD; A-->B;" />)
    
    await waitFor(() => {
      expect(container.querySelector('svg')).toBeTruthy()
    })
    
    expect(DOMPurify.sanitize).toHaveBeenCalled()
  })
})
