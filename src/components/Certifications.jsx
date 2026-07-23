import { useState } from 'react'
import { CERTIFICATIONS_TEXT, CERTIFICATIONS } from '../data/content.js'
import { TypedText } from './TypedText.jsx'
import { playClick } from '../audio.js'

// Certifications : liste cliquable qui affiche le document (PDF ou image)
// dans un lecteur intégré, avec un bouton retour à la liste.
export function Certifications() {
  const [activeId, setActiveId] = useState(null)
  const active = CERTIFICATIONS.find((c) => c.id === activeId)

  function open(id) {
    playClick()
    setActiveId(id)
  }

  function back() {
    playClick()
    setActiveId(null)
  }

  if (active) {
    return (
      <div className="certifications-viewer">
        <button
          type="button"
          className="certifications-back"
          onClick={back}
          aria-label="Retour à la liste des certifications"
        >
          ◀ Retour
        </button>
        {active.type === 'pdf' ? (
          <iframe
            src={`${active.src}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
            title={active.name}
            className="certifications-iframe"
            aria-label={`Document ${active.name}`}
          />
        ) : (
          <img
            src={active.src}
            alt={active.name}
            className="certifications-image"
          />
        )}
      </div>
    )
  }

  return (
    <div className="certifications">
      <TypedText text={CERTIFICATIONS_TEXT}>
        <div className="certifications-list">
          {CERTIFICATIONS.map((cert) => (
            <button
              key={cert.id}
              type="button"
              className="certifications-item"
              onClick={() => open(cert.id)}
              aria-label={`Afficher le document ${cert.name}`}
            >
              <span className="certifications-item__name">{cert.name}</span>
              <span className="certifications-item__desc">{cert.desc}</span>
            </button>
          ))}
        </div>
      </TypedText>
    </div>
  )
}
