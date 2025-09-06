import { useEffect, useRef } from 'react'
import type { CompositionConfig } from '../lib/config'
import type { Assets, ReleaseData } from '../lib/compositor'
import { drawFrame } from '../lib/compositor'
import { makeGlitchState, tickGlitch, glitchIntensity } from '../lib/glitch'

interface PreviewCanvasProps {
  config: CompositionConfig
  assets: Assets
  release: ReleaseData
}

export function PreviewCanvas({ config, assets, release }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let glitchSt = makeGlitchState(config)

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now
      const t = (now - startRef.current) / 1000

      glitchSt = tickGlitch(glitchSt, t, config)
      const intensity = glitchIntensity(glitchSt, t, config)

      drawFrame(ctx, { t, glitch: glitchSt, glitchIntensity: intensity, release }, assets, config)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      startRef.current = null
    }
  }, [config, assets, release])

  return (
    <canvas
      ref={canvasRef}
      width={config.size.width}
      height={config.size.height}
      className="w-full h-full object-contain"
      style={{ imageRendering: 'auto' }}
    />
  )
}
