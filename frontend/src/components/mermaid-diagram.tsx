import DOMPurify from 'dompurify'
import mermaid from 'mermaid'
import { useEffect, useId, useState } from 'react'

import { cn } from '@/lib/utils'

type MermaidDiagramProps = {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const id = useId().replace(/:/g, '')
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: {
        background: '#050506',
        mainBkg: '#121216',
        secondBkg: '#18181d',
        tertiaryColor: '#202027',
        primaryColor: '#1a1a20',
        primaryTextColor: '#f3f1ec',
        primaryBorderColor: '#6f6f77',
        secondaryColor: '#111114',
        secondaryTextColor: '#f3f1ec',
        secondaryBorderColor: '#3a3a42',
        lineColor: '#a7a6ad',
        textColor: '#f3f1ec',
        actorBkg: '#15151a',
        actorBorder: '#777780',
        actorTextColor: '#f3f1ec',
        labelTextColor: '#f3f1ec',
        noteBkgColor: '#17171c',
        noteTextColor: '#f3f1ec',
        fontFamily: 'Georgia, Cambria, Times New Roman, serif',
      },
    })

    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg: nextSvg }) => {
        if (!alive) return
        setSvg(nextSvg)
        setError('')
      })
      .catch((renderError: unknown) => {
        if (!alive) return
        setError(renderError instanceof Error ? renderError.message : 'Mermaid render failed')
      })

    return () => {
      alive = false
    }
  }, [chart, id])

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div
      className={cn('mermaid min-h-[360px] overflow-auto rounded-lg border bg-card p-4', className)}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svg) }}
    />
  )
}