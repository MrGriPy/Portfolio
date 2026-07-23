import { useTypewriter } from '../hooks/useTypewriter.js'
import { useState, useEffect } from 'react'

// Texte tapé à la machine, sauts de ligne préservés (white-space en CSS).
// Un "fantôme" invisible réserve la place du texte complet dès le départ :
// le bloc ne bouge plus pendant la frappe, les lignes se remplissent vers
// le bas par-dessus l'espace déjà réservé.
export function TypedText({ text, children }) {
  const { displayed, done, skip } = useTypewriter(text)
  const [showChildren, setShowChildren] = useState(skip)

  useEffect(() => {
    if (done && !showChildren) {
      const timer = setTimeout(() => {
        setShowChildren(true)
      }, skip ? 0 : 1000) // Pas de délai si le texte a déjà été tapé
      return () => clearTimeout(timer)
    }
  }, [done, showChildren, skip])

  return (
    <>
      <p className="typed-text">
        <span className="typed-text__ghost" aria-hidden="true">
          {text}
        </span>
        <span className="typed-text__live">{displayed}</span>
      </p>
      {showChildren && children}
    </>
  )
}
