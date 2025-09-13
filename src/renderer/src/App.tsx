import { useState, useEffect, useMemo } from 'react'
import { defaultConfig } from './lib/config'
import { loadStaticAssets, loadImageFromPath } from './lib/assets'
import { useExport } from './lib/useExport'
import type { Assets } from './lib/compositor'
import { PreviewCanvas } from './components/preview-canvas'
import { FileField, type FileFilter } from './components/file-field'
import { TextField } from './components/text-field'
import { ExportPanel } from './components/export-panel'

const IMAGE_FILTERS: FileFilter[] = [
  { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
]
const AUDIO_FILTERS: FileFilter[] = [
  { name: 'Audio', extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac'] },
]

const EMPTY_ASSETS: Assets = { background: null, vinylDisc: null, vinylLabel: null, textures: [] }

export default function App() {
  const config = defaultConfig

  // form state
  const [artistName, setArtistName] = useState('')
  const [trackName, setTrackName] = useState('')
  const [releaseName, setReleaseName] = useState('')
  const [backgroundPath, setBackgroundPath] = useState<string | null>(null)
  const [vinylLabelPath, setVinylLabelPath] = useState<string | null>(null)
  const [audioPath, setAudioPath] = useState<string | null>(null)
  const [duration, setDuration] = useState(config.duration)

  // loaded assets
  const [staticAssets, setStaticAssets] = useState<Omit<Assets, 'background' | 'vinylLabel'> | null>(null)
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [labelImage, setLabelImage] = useState<HTMLImageElement | null>(null)

  // load static assets once
  useEffect(() => {
    loadStaticAssets()
      .then(setStaticAssets)
      .catch((e) => console.error('failed to load static assets', e))
  }, [])

  // load background when path changes
  useEffect(() => {
    if (!backgroundPath) { setBgImage(null); return }
    loadImageFromPath(backgroundPath).then(setBgImage).catch(() => setBgImage(null))
  }, [backgroundPath])

  // load vinyl label when path changes
  useEffect(() => {
    if (!vinylLabelPath) { setLabelImage(null); return }
    loadImageFromPath(vinylLabelPath).then(setLabelImage).catch(() => setLabelImage(null))
  }, [vinylLabelPath])

  const assets: Assets = useMemo(() => ({
    background: bgImage,
    vinylDisc: staticAssets?.vinylDisc ?? null,
    vinylLabel: labelImage,
    textures: staticAssets?.textures ?? [],
  }), [bgImage, labelImage, staticAssets])

  const release = useMemo(() => ({
    artistName: artistName || 'Artist Name',
    trackName: trackName || 'Track Name',
    releaseName: releaseName || 'Release Name',
  }), [artistName, trackName, releaseName])

  const { state: exportState, startExport, reset } = useExport(config, assets)

  const canExport = Boolean(
    artistName && trackName && releaseName && backgroundPath && vinylLabelPath && audioPath
  )

  function handleExport() {
    if (!audioPath) return
    startExport(release, audioPath, duration)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ paddingTop: '28px' }}>
      {/* left panel — form */}
      <aside className="w-72 shrink-0 flex flex-col gap-5 overflow-y-auto border-r border-neutral-800 p-5">
        <h1 className="text-sm font-medium tracking-widest uppercase text-neutral-400">
          Vinyl Video Gen
        </h1>

        <section className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-neutral-600">images</p>
          <FileField
            label="Background"
            accept={IMAGE_FILTERS}
            value={backgroundPath}
            onChange={setBackgroundPath}
            placeholder="upload background image"
          />
          <FileField
            label="Vinyl Label"
            accept={IMAGE_FILTERS}
            value={vinylLabelPath}
            onChange={setVinylLabelPath}
            placeholder="upload vinyl center image"
          />
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-neutral-600">text</p>
          <TextField label="Artist" value={artistName} onChange={setArtistName} placeholder="Artist Name" />
          <TextField label="Track" value={trackName} onChange={setTrackName} placeholder="Track Name" />
          <TextField label="Release" value={releaseName} onChange={setReleaseName} placeholder="Release Name" />
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-neutral-600">audio</p>
          <FileField
            label="Soundtrack"
            accept={AUDIO_FILTERS}
            value={audioPath}
            onChange={setAudioPath}
            placeholder="upload audio file"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-neutral-500">
              Duration (seconds)
            </label>
            <input
              type="number"
              min={5}
              max={600}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-500 transition-colors"
            />
          </div>
        </section>

        <div className="mt-auto">
          <ExportPanel
            state={exportState}
            canExport={canExport}
            onExport={handleExport}
            onReset={reset}
          />
        </div>
      </aside>

      {/* right panel — preview */}
      <main className="flex-1 flex items-center justify-center bg-neutral-950 overflow-hidden p-6">
        {staticAssets ? (
          <PreviewCanvas config={config} assets={assets} release={release} />
        ) : (
          <p className="text-neutral-700 text-sm">loading assets…</p>
        )}
      </main>
    </div>
  )
}
