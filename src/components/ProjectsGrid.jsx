import { useState } from 'react'
import { PROJECTS } from '../data/content.js'
import { playClick } from '../audio.js'

// Grille de projets : icônes seules sur toute la largeur, la description du
// projet survolé (ou focus clavier) s'affiche dans un panneau partagé en
// dessous — les descriptions ne poussent plus la grille, donc pas de scroll.
export function ProjectsGrid() {
  const [activeId, setActiveId] = useState(null)
  const active = PROJECTS.find((p) => p.id === activeId)

  return (
    <div className="projects-wrap">
      <div className="project-list" onMouseLeave={() => setActiveId(null)}>
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            className={`project-item${activeId === project.id ? ' project-item--active' : ''}`}
            onMouseEnter={() => setActiveId(project.id)}
          >
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              onClick={playClick}
              onFocus={() => setActiveId(project.id)}
              onBlur={() => setActiveId(null)}
              aria-label={`Ouvrir le projet : ${project.alt}`}
            >
              <img src={project.img} alt={project.alt} className="project-icon" />
            </a>
            <div className="project-name">{project.alt}</div>
          </div>
        ))}
      </div>
      <div className="project-desc-panel" aria-live="polite">
        {active ? active.desc : 'Survolez un projet pour voir sa description — cliquez pour le visiter.'}
      </div>
    </div>
  )
}
