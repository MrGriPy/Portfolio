import { CONTACT } from '../data/content.js'
import { TypedText } from './TypedText.jsx'
import { useState, useEffect } from 'react'

// Contact : chaque élément apparaît progressivement avec effet machine à écrire
export function ContactContent() {
  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [showLinkedIn, setShowLinkedIn] = useState(false)
  const [showGithub, setShowGithub] = useState(false)
  const [showCV, setShowCV] = useState(false)

  useEffect(() => {
    const introTime = CONTACT.intro.length * 25 + 1000
    
    const phoneTimer = setTimeout(() => setShowPhone(true), introTime)
    const emailTimer = setTimeout(() => setShowEmail(true), introTime + 2500)
    const linkedinTimer = setTimeout(() => setShowLinkedIn(true), introTime + 5000)
    const githubTimer = setTimeout(() => setShowGithub(true), introTime + 7500)
    const cvTimer = setTimeout(() => setShowCV(true), introTime + 10000)

    return () => {
      clearTimeout(phoneTimer)
      clearTimeout(emailTimer)
      clearTimeout(linkedinTimer)
      clearTimeout(githubTimer)
      clearTimeout(cvTimer)
    }
  }, [])

  return (
    <>
      <TypedText text={CONTACT.intro} />
      
      <span className="contact-block">
        <span className="contact-block__ghost" aria-hidden="true">
          {`\n\nTéléphone : ${CONTACT.phone}\nE-mail : ${CONTACT.email}\nLinkedIn : ${CONTACT.linkedin.label}\nGithub : ${CONTACT.github.label}\nMon CV : Télécharger le CV`}
        </span>
        <span className="contact-block__live">
          {showPhone && (
            <span className="contact-line">
              <TypedText text={`\n\nTéléphone : `}>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="contact-link">{CONTACT.phone}</a>
              </TypedText>
            </span>
          )}
          
          {showEmail && (
            <span className="contact-line">
              <TypedText text={`\nE-mail : `}>
                <a href={`mailto:${CONTACT.email}`} className="contact-link">{CONTACT.email}</a>
              </TypedText>
            </span>
          )}
          
          {showLinkedIn && (
            <span className="contact-line">
              <TypedText text={`\nLinkedIn : `}>
                <a href={CONTACT.linkedin.url} target="_blank" rel="noreferrer" className="contact-link">{CONTACT.linkedin.label}</a>
              </TypedText>
            </span>
          )}
          
          {showGithub && (
            <span className="contact-line">
              <TypedText text={`\nGithub : `}>
                <a href={CONTACT.github.url} target="_blank" rel="noreferrer" className="contact-link">{CONTACT.github.label}</a>
              </TypedText>
            </span>
          )}
          
          {showCV && (
            <span className="contact-line">
              <TypedText text={`\nMon CV : `}>
                <a href={CONTACT.cv} download className="contact-link">Télécharger le CV</a>
              </TypedText>
            </span>
          )}
        </span>
      </span>
    </>
  )
}
