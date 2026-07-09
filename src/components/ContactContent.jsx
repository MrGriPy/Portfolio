import { CONTACT } from '../data/content.js'
import { TypedText } from './TypedText.jsx'

// Contact : intro tapée à la machine, puis les liens apparaissent
// (dans l'ancienne version les liens étaient insérés d'un bloc, pareil ici).
export function ContactContent() {
  return (
    <TypedText text={CONTACT.intro}>
      <ul className="contact-links">
        <li>
          Téléphone : <span>{CONTACT.phone}</span>
        </li>
        <li>
          E-mail : <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </li>
        <li>
          LinkedIn :{' '}
          <a href={CONTACT.linkedin.url} target="_blank" rel="noreferrer">
            {CONTACT.linkedin.label}
          </a>
        </li>
        <li>
          Github :{' '}
          <a href={CONTACT.github.url} target="_blank" rel="noreferrer">
            {CONTACT.github.label}
          </a>
        </li>
        <li>
          Mon CV :{' '}
          <a href={CONTACT.cv} download>
            Télécharger le CV
          </a>
        </li>
      </ul>
    </TypedText>
  )
}
