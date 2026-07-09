import { useEffect, useRef, useState } from 'react'
import { playBlip } from '../audio.js'

// Effet machine à écrire fidèle à Portfolio-old : 25 ms par caractère,
// blip sonore throttlé sur les caractères alphanumériques.
export function useTypewriter(text, speed = 25) {
  const [count, setCount] = useState(0)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setCount(0)
  }, [text])

  useEffect(() => {
    if (count >= text.length) return undefined
    timeoutRef.current = setTimeout(() => {
      const char = text[count]
      if (/[a-zA-Z0-9]/.test(char)) playBlip()
      setCount((c) => c + 1)
    }, speed)
    return () => clearTimeout(timeoutRef.current)
  }, [count, text, speed])

  return { displayed: text.slice(0, count), done: count >= text.length }
}
