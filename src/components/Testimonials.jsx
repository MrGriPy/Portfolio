import { useState } from 'react'
import { TESTIMONIALS } from '../data/content.js'
import { TypedText } from './TypedText.jsx'
import { playClick } from '../audio.js'

// Témoignages avec navigation précédent/suivant, comme dans Portfolio-old.
export function Testimonials() {
  const [index, setIndex] = useState(0)
  const { name, text } = TESTIMONIALS[index]

  function go(delta) {
    playClick()
    setIndex((i) => Math.min(Math.max(i + delta, 0), TESTIMONIALS.length - 1))
  }

  return (
    <div className="testimonial">
      <div className="testimonial-name">{name} :</div>
      <TypedText text={text} key={index} />
      <div className="testimonial-nav">
        <button type="button" onClick={() => go(-1)} disabled={index === 0}>
          ◀ Précédent
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === TESTIMONIALS.length - 1}
        >
          Suivant ▶
        </button>
      </div>
    </div>
  )
}
