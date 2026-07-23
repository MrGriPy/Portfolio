// Gestion audio : mêmes sons que Portfolio-old (clic, blip, musique de fond).
// La musique ne démarre qu'au clic sur le titre, comme dans l'original.

const cq80Url = '/CQ-80.mp3'

const clickSound = new Audio('/clic.wav')

export function playClick() {
  clickSound.currentTime = 0
  clickSound.play().catch(() => {})
}

// Blip de machine à écrire, throttlé comme dans l'original (50 ms mini)
const blipSound = new Audio('/blip.wav')
let lastBlipTime = 0

export function playBlip() {
  const now = Date.now()
  if (now - lastBlipTime < 50) return
  lastBlipTime = now
  blipSound.currentTime = 0
  blipSound.play().catch(() => {})
}

// Musique de fond
const music = new Audio('/background.wav')
music.loop = true

let musicStarted = false
let musicPlaying = false

export function startMusic() {
  if (musicStarted) return
  musicStarted = true
  musicPlaying = true
  // Précharge le jingle CQ-80 pendant qu'on est sûr d'avoir un geste utilisateur
  ensureCq80()
  music.play().catch(() => {
    musicStarted = false
    musicPlaying = false
  })
}

export function toggleMusic() {
  if (!musicStarted) return musicPlaying
  if (musicPlaying) {
    music.pause()
  } else {
    music.play().catch(() => {})
  }
  musicPlaying = !musicPlaying
  return musicPlaying
}

export function isMusicStarted() {
  return musicStarted
}

// --- Jingle CQ-80, découpé au Web Audio pour un découpage précis : ---
// --- allumage de la chaîne = secondes 0 à 2, retour au menu = 2 à 4. ---
let audioCtx = null
let cq80Buffer = null
let cq80Loading = null
let cq80Source = null

function ensureCq80() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  // Réveillé dès le préchargement (geste utilisateur) : zéro latence au 1er jingle
  if (audioCtx.state === 'suspended') audioCtx.resume()
  if (!cq80Loading) {
    cq80Loading = fetch(cq80Url)
      .then((r) => r.arrayBuffer())
      .then((buf) => audioCtx.decodeAudioData(buf))
      .then((decoded) => {
        cq80Buffer = decoded
      })
      .catch(() => {
        cq80Loading = null
      })
  }
  return cq80Loading
}

function playCq80Segment(offset, duration) {
  ensureCq80().then(() => {
    if (!cq80Buffer) return
    if (audioCtx.state === 'suspended') audioCtx.resume()
    // Un seul segment à la fois : coupe le précédent si on enchaîne vite
    if (cq80Source) {
      try {
        cq80Source.stop()
      } catch {
        /* déjà terminé */
      }
    }
    const src = audioCtx.createBufferSource()
    src.buffer = cq80Buffer
    src.connect(audioCtx.destination)
    src.start(0, offset, duration)
    cq80Source = src
  })
}

// Le fichier CQ-80 contient ~0,5 s d'amorce avant le son utile : les deux
// fenêtres de lecture sont décalées d'autant pour partir immédiatement
const CQ80_LAG = 0.5

// Allumage de la télé (arrivée de la caméra dans l'écran)
export function playTvOn() {
  playCq80Segment(CQ80_LAG, 1.8)
}

// Extinction / retour au menu
export function playTvOff() {
  playCq80Segment(2 + CQ80_LAG, 2)
}
