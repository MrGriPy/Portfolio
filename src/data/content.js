// Contenu repris de Portfolio-old (script.js), inchangé.

export const BIO_TEXT = `Bonjour, je m'appelle Thomas Vidal.

Je suis passionné par le développement web et la création numérique, notamment par la manière dont ces outils peuvent transformer la communication, l'expérience utilisateur et l'accès à l'information. Mon objectif à long terme est de travailler dans ce domaine pour concevoir des projets innovants.

Grâce à mon parcours en STI2D qui a été une étape clé après avoir surmonté une erreur de filière, j'ai réussi à intégrer le BUT MMI de Gustave Eiffel à Champs-sur-Marne. Ce parcours témoigne de ma détermination et de ma résilience, des qualités que je considère essentielles pour la réussite de mon parcours.

J'ai acquis des compétences techniques en HTML/CSS/JS, PHP, Premiere Pro, et After Effects. Travailler dans les domaines du web, de la communication ou de l'audiovisuel me permettrait d'exploiter ces compétences afin de les approfondir.`

// Projets triés par ordre alphabétique (titre affiché).
export const PROJECTS = [
  {
    id: 'apero',
    img: '/img/APERO.png',
    alt: "L'Apéro",
    url: 'https://www.youtube.com/watch?v=vl6RfXwczIs',
    desc: "L'APERO : Mini-projet dans lequel nous devions faire un montage scénarisé à partir de divers mouvements de caméra.",
  },
  {
    id: 'mario-64-file-game',
    img: 'https://super-mario-64-file-select-game.vercel.app/img/favicon.png',
    alt: 'Super Mario 64 File Select Game',
    url: 'https://super-mario-64-file-select-game.vercel.app/',
    desc: "MARIO 64 FILE GAME : Projet universitaire. Recréation de l'écran de sélection de Super Mario 64 : React Three Fiber pour manipuler le modèle 3D en temps réel à la souris (rotation, déformation du visage), TypeScript pour fiabiliser le code.",
  },
  {
    id: 'dreamwar',
    img: '/img/dreamwar.png',
    alt: 'Project Dreamwar',
    url: 'https://sites.google.com/view/thomasvidal/',
    desc: "PROJECT DREAMWAR : Petit projet perso sur l'idéation d'un univers de jeu.",
  },
  {
    id: 'regame-awake',
    img: 'https://regame-awake.vercel.app/Logo_ERA.png',
    alt: 'Regame Awake',
    url: 'https://regame-awake.vercel.app/',
    desc: "REGAME AWAKE : Projet universitaire. Jeu de plateau numérique multijoueur sur un écran : React pour orchestrer la logique de jeu (tours, objets, économie), Three.js pour le lancer de dés 3D, Framer Motion pour des animations d'interface fluides.",
  },
  {
    id: 'rule-makers',
    img: 'https://www.google.com/s2/favicons?domain=rule-makers.vercel.app&sz=128',
    alt: 'Rule Makers',
    url: 'https://rule-makers.vercel.app/',
    desc: "RULE MAKERS : Projet perso. Table virtuelle 100% front-end pour créer ses propres jeux de société : Canvas HTML5 pour dessiner avatars et plateaux, persistance JSON pour sauvegarder et partager ses parties, intégration IA (API Gemini) pour incarner un maître du jeu et jouer en solo.",
  },
  {
    id: 'vidal-et-fils',
    img: '/img/vidaletfils.PNG',
    alt: 'SCI Vidal et Fils',
    url: 'https://vidal.butmmi.o2switch.site/Vidal-et-Fils/',
    desc: 'SCI VIDAL ET FILS : Site de location ayant pour but de tester mes compétences en HTML, CSS, JavaScript, et PHP.',
  },
  {
    id: 'skylanders-collection',
    img: '/img/skylanders.webp',
    alt: 'Skylanders Collection',
    url: 'https://skylanderscollection.com',
    desc: "SKYLANDERS COLLECTION : Projet perso. Encyclopédie en ligne des figurines Skylanders : React/TypeScript pour explorer la base de fiches, back-end et base de données pour le suivi de collection de chaque utilisateur, SEO et monétisation pour construire une audience réelle.",
  },
  {
    id: 'systeme-solaire',
    img: 'https://solar-system-eta-five.vercel.app/favicon.jpg',
    alt: 'Système Solaire 3D',
    url: 'https://solar-system-eta-five.vercel.app/',
    desc: "SYSTÈME SOLAIRE : Projet perso. Simulation 3D du système solaire : Three.js/WebGL pour le rendu temps réel des orbites, caméra interactive pour explorer et suivre chaque planète, interface HUD pour contrôler la vitesse du temps et consulter les données.",
  },
  {
    id: 'vgs',
    img: '/img/vgslogo.png',
    alt: 'Video Game Stats',
    url: 'https://mrgripy.github.io/VGS/',
    desc: 'VIDEO GAME STATS : Site de statistiques qui démontre les clichés sur le Jeu Vidéo.',
  },
]

export const TESTIMONIALS = [
  {
    name: 'Sonia, Maîtresse de stage',
    text: "Thomas a su s'adapter rapidement à notre environnement professionnel. Très ponctuel et très sérieux, il a su aider l'équipe et s'en faire apprécier.",
  },
  {
    name: "Mariama, Manager Mc Donald's",
    text: 'Il essaye toujours de faire de son mieux en se montrant autonome et en se proposant pour toutes les tâches.',
  },
  {
    name: 'Anthony, Camarade de projet de refonte de site web',
    text: "Travailler avec Thomas sur des projets d'équipe est toujours agréable. Il est perfectionniste et apporte une vraie plus-value au travail collectif.",
  },
]

export const CERTIFICATIONS_TEXT = `Voici mes certifications. Cliquez sur l'une d'elles pour afficher le document.`

export const CERTIFICATIONS = [
  {
    id: 'opquast',
    name: 'Opquast',
    type: 'pdf',
    src: '/CERTIFICAT-OPQUAST-THOMAS-VIDAL.pdf',
    desc: 'Certification Opquast (avril 2025) : bonnes pratiques qualité web.',
  },
  {
    id: 'psc',
    name: 'PSC',
    type: 'image',
    src: '/ATTESTATION-PSC-THOMAS-VIDAL.jpg',
    desc: 'Prévention et Secours Civiques de niveau 1.',
  },
]

export const CONTACT = {
  intro: "En cas de besoin, n'hésitez pas à me contacter via les coordonnées ci-dessous :",
  phone: '+33 6 17 08 18 16',
  email: 'thomas.vidal0494@gmail.com',
  linkedin: {
    label: 'Thomas Vidal',
    url: 'https://www.linkedin.com/in/thomas-vidal-925a1a296/',
  },
  github: {
    label: 'Mr GriPy',
    url: 'https://github.com/MrGriPy',
  },
  // Déposer le fichier CV dans public/ sous ce nom pour activer le lien.
  cv: '/CV_Thomas-VIDAL.pdf',
}
