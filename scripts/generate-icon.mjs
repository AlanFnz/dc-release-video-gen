// generates resources/icon.png by embedding the Tactic Round font directly
// into an SVG and rasterizing with sharp — no browser or font-loading races
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const fontPath = join(root, 'src/renderer/src/assets/fonts/TacticRound.otf')
const destPath = join(root, 'resources/icon.png')

const fontB64 = readFileSync(fontPath).toString('base64')

const size = 1024
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <style>
      @font-face {
        font-family: 'Tactic Round';
        font-weight: 600;
        src: url('data:font/otf;base64,${fontB64}') format('opentype');
      }
    </style>
  </defs>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#0a0a0a"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 20}"
    fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="6"/>
  <text
    x="${size / 2}" y="${size / 2 + 20}"
    font-family="Tactic Round, sans-serif"
    font-weight="600"
    font-size="430"
    text-anchor="middle"
    dominant-baseline="middle"
    fill="white">DC</text>
</svg>
`.trim()

if (!existsSync(dirname(destPath))) mkdirSync(dirname(destPath), { recursive: true })

await sharp(Buffer.from(svg)).png().toFile(destPath)
console.log(`icon written to ${destPath}`)
