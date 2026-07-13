import { useEffect, useState } from 'react'
import { Scene3D } from './components/Scene3D.jsx'
import { TypedText } from './components/TypedText.jsx'
import { ProjectsGrid } from './components/ProjectsGrid.jsx'
import { Testimonials } from './components/Testimonials.jsx'
import { ContactContent } from './components/ContactContent.jsx'
import {
  playClick,
  playTvOn,
  playTvOff,
  startMusic,
  toggleMusic,
  isMusicStarted,
} from './audio.js'
import { BIO_TEXT, OPQUAST_TEXT } from './data/content.js'

// Mobile detection helper
const isMobile = () => {
  return typeof window !== 'undefined' && window.innerWidth <= 768;
}

// Desktop : chaque section = un écran CRT flottant, disposé en arc face à la caméra
const DESKTOP_SECTIONS = [
  { id: 'bio', label: 'Biographie', position: [-4.9, 2.3, -0.5], yaw: 0.42, bobSpeed: 0.9, phase: 0.4 },
  { id: 'projets', label: 'Projets', position: [-2.5, 0.7, 1.2], yaw: 0.22, bobSpeed: 1.1, phase: 2.5 },
  { id: 'temoignages', label: 'Témoignages', position: [0, 2.5, 0.2], yaw: 0, bobSpeed: 0.8, phase: 4.3 },
  { id: 'opquast', label: 'Opquast', position: [2.5, 0.7, 1.2], yaw: -0.22, bobSpeed: 1.05, phase: 1.3 },
  { id: 'contact', label: 'Contact', position: [4.9, 2.3, -0.5], yaw: -0.42, bobSpeed: 0.95, phase: 5.2 },
]

// Mobile : une seule TV qui change de contenu selon le bouton sélectionné
const MOBILE_SECTIONS = [
  { id: 'bio', label: 'Biographie', position: [0, 2.5, -0.5], yaw: 0, bobSpeed: 0.8, phase: 0, scale: 1.5 },
  { id: 'projets', label: 'Projets', position: [0, 2.5, -0.5], yaw: 0, bobSpeed: 0.8, phase: 0, scale: 1.5 },
  { id: 'temoignages', label: 'Témoignages', position: [0, 2.5, -0.5], yaw: 0, bobSpeed: 0.8, phase: 0, scale: 1.5 },
  { id: 'opquast', label: 'Opquast', position: [0, 2.5, -0.5], yaw: 0, bobSpeed: 0.8, phase: 0, scale: 1.5 },
  { id: 'contact', label: 'Contact', position: [0, 2.5, -0.5], yaw: 0, bobSpeed: 0.8, phase: 0, scale: 1.5 },
]

const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [entered, setEntered] = useState(false)
  const [section, setSection] = useState(null)
  const [zoomed, setZoomed] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // Dynamic responsive detection
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth
      const wasMobile = screenWidth <= 768
      const isMobileNow = newWidth <= 768
      
      setScreenWidth(newWidth)
      
      // Reset section when switching between modes to avoid conflicts
      if (wasMobile !== isMobileNow) {
        setSection(null)
        setZoomed(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [screenWidth])

  // Use appropriate sections based on device
  const mobile = screenWidth <= 768
  const SECTIONS = mobile ? MOBILE_SECTIONS : DESKTOP_SECTIONS
  const current = SECTIONS.find((s) => s.id === section)
  
  // Key to force re-render of 3D scene when layout changes
  const sceneKey = mobile ? 'mobile' : 'desktop'

  
  // Même déroulé que Portfolio-old : clic sur le titre → il glisse vers le
  // haut, le système solaire se déploie, la musique démarre (geste utilisateur).
  function enter() {
    if (entered) return
    setEntered(true)
    startMusic()
    setMusicOn(true)
  }

  function openSection(id) {
    playClick()
    // Use same behavior for both mobile and desktop
    setZoomed(false)
    setSection((prev) => (prev === id ? null : id))
  }

  // La caméra a fini sa course dans l'écran : la "chaîne" s'allume
  function handleArrived() {
    playTvOn()
    setZoomed(true)
  }

  function closeSection() {
    playTvOff()
    setZoomed(false)
    setSection(null)
  }

  // Échap éteint la chaîne et ramène au menu
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && section) closeSection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section])

  function handleSpeaker() {
    if (!isMusicStarted()) return
    setMusicOn(toggleMusic())
  }

  return (
    <>
      <Scene3D
        key={sceneKey}
        sections={SECTIONS}
        focusedId={entered ? section : null}
        zoomed={zoomed}
        onSelect={openSection}
        onArrived={handleArrived}
        animate={!REDUCED_MOTION && !zoomed}
        interactive={entered}
      />

      {!entered && (
        <button
          type="button"
          className="entry-button"
          onClick={enter}
          aria-label="Entrer dans le portfolio"
        >
          Découvrir
        </button>
      )}

      <button
        type="button"
        className={`title ${entered ? 'title--top' : ''}`}
        onClick={enter}
        disabled={entered}
      >
        Portfolio de <span className="name-group">Thomas Vidal</span>
      </button>

      
      {entered && current && zoomed && (
        <section className="tv-screen" aria-label={current.label}>
          <header className="tv-screen__header">
            <h2 className="tv-screen__title">{current.label}</h2>
            <button
              type="button"
              className="tv-screen__close"
              onClick={closeSection}
              aria-label="Éteindre et revenir au menu"
            >
              RETOUR [Échap]
            </button>
          </header>
          <div className="tv-screen__content" aria-live="polite">
            <div className="tv-screen__inner">
              {section === 'bio' && <TypedText text={BIO_TEXT} key="bio" />}
              {section === 'projets' && <ProjectsGrid />}
              {section === 'temoignages' && <Testimonials />}
              {section === 'opquast' && <TypedText text={OPQUAST_TEXT} key="opquast" />}
              {section === 'contact' && <ContactContent />}
            </div>
          </div>
        </section>
      )}

      {entered && !zoomed && (
        <nav className="button-container" aria-label="Sections du portfolio">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`btn ${section === s.id ? 'btn--active' : ''}`}
              onClick={() => openSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      )}

      <button
        type="button"
        className={`speaker ${entered ? '' : 'speaker--disabled'}`}
        onClick={handleSpeaker}
        aria-label={musicOn ? 'Couper la musique' : 'Remettre la musique'}
        aria-pressed={musicOn}
      >
        <img src={musicOn ? '/img/speaker.png' : '/img/nospeaker.png'} alt="" />
      </button>

      <div className="scanlines" aria-hidden="true" />
    </>
  )
}
