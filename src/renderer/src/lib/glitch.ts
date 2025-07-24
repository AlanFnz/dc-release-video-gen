import type { CompositionConfig } from './config'

export interface GlitchState {
  // time of next scheduled glitch hit
  nextGlitchAt: number
  // when the current glitch hit started (null = none active)
  glitchStartedAt: number | null
  // how long the current hit lasts
  glitchDuration: number
}

export function makeGlitchState(config: CompositionConfig): GlitchState {
  return {
    nextGlitchAt: config.glitch.revealDuration + randomBetween(config.glitch.intervalMin, config.glitch.intervalMax),
    glitchStartedAt: null,
    glitchDuration: 0,
  }
}

// call once per frame to advance the glitch state machine
export function tickGlitch(state: GlitchState, t: number, config: CompositionConfig): GlitchState {
  let { nextGlitchAt, glitchStartedAt, glitchDuration } = state

  // end active hit
  if (glitchStartedAt !== null && t > glitchStartedAt + glitchDuration) {
    glitchStartedAt = null
  }

  // start new hit
  if (glitchStartedAt === null && t >= nextGlitchAt) {
    glitchStartedAt = t
    glitchDuration = randomBetween(0.08, 0.22)
    nextGlitchAt = t + randomBetween(config.glitch.intervalMin, config.glitch.intervalMax)
  }

  return { nextGlitchAt, glitchStartedAt, glitchDuration }
}

// returns 0–1 glitch intensity at time t
export function glitchIntensity(state: GlitchState, t: number, config: CompositionConfig): number {
  const { revealDuration } = config.glitch

  // reveal phase: ramp in, hold, ramp out
  if (t < revealDuration) {
    const half = revealDuration * 0.5
    if (t < half * 0.3) return t / (half * 0.3)          // fast ramp in
    if (t < half) return 1                                 // hold at full
    return 1 - (t - half) / (revealDuration - half)       // ramp out
  }

  // periodic hit
  if (state.glitchStartedAt !== null) {
    const progress = (t - state.glitchStartedAt) / state.glitchDuration
    // triangle wave: peak at 50%
    return progress < 0.5 ? progress * 2 : (1 - progress) * 2
  }

  return 0
}

export interface GlitchTextOptions {
  text: string
  x: number
  y: number
  font: string
  color: string
  align: CanvasTextAlign
  intensity: number    // 0–1
  rgbOffset: number
  glowBlur: number
  glowOpacity: number
}

// draws text with rgb-split + glow at the given intensity
export function drawGlitchText(ctx: CanvasRenderingContext2D, opts: GlitchTextOptions): void {
  const { text, x, y, font, color, align, intensity, rgbOffset, glowBlur, glowOpacity } = opts
  if (intensity <= 0) {
    // plain text, no effect
    ctx.save()
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(text, x, y)
    ctx.restore()
    return
  }

  const offset = rgbOffset * intensity

  ctx.save()
  ctx.font = font
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'

  // glow pass
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = glowBlur * intensity
  ctx.globalAlpha = glowOpacity * intensity
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()

  // red channel (shift left)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.85
  ctx.fillStyle = '#ff0000'
  ctx.fillText(text, x - offset, y)
  ctx.restore()

  // green channel (center, slightly up)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.85
  ctx.fillStyle = '#00ff00'
  ctx.fillText(text, x, y - offset * 0.4)
  ctx.restore()

  // blue channel (shift right)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.85
  ctx.fillStyle = '#0000ff'
  ctx.fillText(text, x + offset, y)
  ctx.restore()

  // base white text on top
  ctx.globalAlpha = 1
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
  ctx.restore()
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
