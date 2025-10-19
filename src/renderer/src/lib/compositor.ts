import type { CompositionConfig } from './config'
import { drawGlitchText, type GlitchState } from './glitch'

export interface FrameInput {
  t: number             // current time in seconds
  glitch: GlitchState
  glitchIntensity: number
  release: ReleaseData
}

export interface ReleaseData {
  artistName: string
  trackName: string
  releaseName: string
}

export interface Assets {
  background: HTMLImageElement | null
  vinylDisc: HTMLImageElement | null
  vinylLabel: HTMLImageElement | null
  textures: (HTMLImageElement | null)[]
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: FrameInput,
  assets: Assets,
  config: CompositionConfig
): void {
  const { width, height } = config.size
  const { t, release, glitchIntensity } = frame

  ctx.clearRect(0, 0, width, height)

  // 1. background
  if (assets.background) {
    ctx.drawImage(assets.background, 0, 0, width, height)
  } else {
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)
  }

  // 2. textures
  drawTextures(ctx, assets, config, width, height)

  // 3. vinyl disc
  drawVinyl(ctx, assets, config, t, width, height)

  // 4. text overlays
  drawText(ctx, frame, release, config, width, height, glitchIntensity)
}

function drawTextures(
  ctx: CanvasRenderingContext2D,
  assets: Assets,
  config: CompositionConfig,
  w: number,
  h: number
): void {
  for (let i = 0; i < config.textures.length; i++) {
    const tex = config.textures[i]
    const img = assets.textures[i]
    if (!img) continue

    ctx.save()
    ctx.globalAlpha = tex.opacity
    ctx.globalCompositeOperation = tex.blendMode
    ctx.drawImage(img, 0, 0, w, h)
    ctx.restore()
  }
}

function drawVinyl(
  ctx: CanvasRenderingContext2D,
  assets: Assets,
  config: CompositionConfig,
  t: number,
  w: number,
  h: number
): void {
  const { cx, cy, radiusFraction, labelRadiusFraction, degreesPerSecond } = config.vinyl
  const centerX = cx * w
  const centerY = cy * h
  const radius = radiusFraction * w
  const angle = (t * degreesPerSecond * Math.PI) / 180

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(angle)

  // clip to circle
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.clip()

  if (assets.vinylDisc) {
    ctx.drawImage(assets.vinylDisc, -radius, -radius, radius * 2, radius * 2)
  } else {
    // fallback: black disc with grooves
    ctx.fillStyle = '#111111'
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2)
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 2
    for (let r = radius * 0.15; r < radius; r += 8) {
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // vinyl center label (does not rotate relative to disc — both rotate together)
  if (assets.vinylLabel) {
    const lr = radius * labelRadiusFraction
    ctx.save()
    ctx.beginPath()
    ctx.arc(0, 0, lr, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(assets.vinylLabel, -lr, -lr, lr * 2, lr * 2)
    ctx.restore()
  }

  ctx.restore()
}

function drawText(
  ctx: CanvasRenderingContext2D,
  _frame: FrameInput,
  release: ReleaseData,
  config: CompositionConfig,
  w: number,
  h: number,
  intensity: number
): void {
  const { font, layout, glitch } = config
  const px = (size: number) => `${Math.round(size * (w / 1500))}px`

  const entries: Array<{
    text: string
    pos: typeof layout.labelName
    size: number
    useGlitch: boolean
  }> = [
    { text: config.labelName,      pos: layout.labelName,   size: font.labelSize,   useGlitch: false },
    { text: release.releaseName,   pos: layout.releaseName, size: font.releaseSize, useGlitch: false },
    { text: release.artistName,    pos: layout.artistName,  size: font.artistSize,  useGlitch: true },
    { text: release.trackName,     pos: layout.trackName,   size: font.trackSize,   useGlitch: true },
  ]

  for (const entry of entries) {
    drawGlitchText(ctx, {
      text: entry.text,
      x: entry.pos.x * w,
      y: entry.pos.y * h,
      font: `${px(entry.size)} '${font.family}', sans-serif`,
      color: font.color,
      align: entry.pos.align,
      intensity: entry.useGlitch ? intensity : 0,
      rgbOffset: glitch.rgbOffset * (w / 1500),
      glowBlur: glitch.glowBlur * (w / 1500),
      glowOpacity: glitch.glowOpacity,
    })
  }
}
