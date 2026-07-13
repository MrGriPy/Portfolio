import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { playBlip } from '../audio.js'

// ============================================================================
// MENU DE JEU VIDÉO DANS LE VIDE — plus de système solaire.
// Chaque section est un écran CRT flottant au-dessus d'une grille rétro
// infinie. Survol : l'écran s'allume orange. Clic : burst de particules,
// la caméra s'approche, le panneau s'ouvre. Poussière spatiale ambiante.
//
// Optimisations : aucune allocation dans les boucles useFrame (vecteurs
// pré-alloués), géométries/matériaux partagés, labels rendus en texture
// canvas (aucun DOM dans la scène), dpr plafonné à 1.5.
// ============================================================================

// --- Scratch vectors réutilisés (zéro GC pendant le rendu) ---
const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()
const _v3 = new THREE.Vector3()
const _q1 = new THREE.Quaternion()

// --- Géométries & matériaux partagés entre tous les écrans ---
const tvBodyGeo = new THREE.BoxGeometry(1.9, 1.35, 0.42)
// Renflement arrière du tube : tronc pyramidal (cylindre à 4 pans alignés)
const tvHumpGeo = new THREE.CylinderGeometry(0.95, 0.66, 0.5, 4, 1)
tvHumpGeo.rotateY(Math.PI / 4)
tvHumpGeo.rotateX(Math.PI / 2)
const antennaGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.8, 4)
const footGeo = new THREE.BoxGeometry(0.18, 0.12, 0.4)
const knobGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.05, 10)
knobGeo.rotateX(Math.PI / 2)
const slitGeo = new THREE.BoxGeometry(0.2, 0.022, 0.02)
// Dalle segmentée : le renflement du verre est fait dans le vertex shader
const screenGeo = new THREE.PlaneGeometry(1.44, 1.0, 12, 9)
// Position de la dalle dans le repère du téléviseur (partagée avec la caméra).
// Décollée franchement de la façade (0.24 vs 0.21) : à grande distance, un
// écart d'1 mm passe sous la précision du depth buffer et la façade recouvre
// la dalle en dehors du bombement — c'était l'ellipse noire sur les télés
const SCREEN_LOCAL = new THREE.Vector3(-0.14, 0, 0.24)

const tvBodyMat = new THREE.MeshStandardMaterial({ color: '#2c2c2c', flatShading: true })
const tvDetailMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', flatShading: true })
const ledGeo = new THREE.BoxGeometry(0.06, 0.06, 0.03)
const ledMat = new THREE.MeshBasicMaterial({ color: '#ff4d00' })

// Texture 1x1 transparente en attendant le chargement de la police
const BLANK_TEX = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1)
BLANK_TEX.needsUpdate = true

// Promesse de police partagée par tous les écrans. document.fonts.load peut
// rejeter ou ne jamais correspondre : garde-fou de 2,5 s pour toujours dessiner.
let fontPromise = null
function whenFontReady() {
  if (!fontPromise) {
    const load = document.fonts
      .load('96px "VT323"')
      .then(() => document.fonts.ready)
      .catch(() => {})
    fontPromise = Promise.race([load, new Promise((r) => setTimeout(r, 2500))])
  }
  return fontPromise
}

// Label de section dessiné en canvas
function makeLabelTexture(label) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, 512, 256)
  ctx.font = '96px "VT323", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(label.toUpperCase(), 256, 128)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// --- Shader d'écran : neige TV + scanlines + label, teinte selon l'état ---
const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Verre bombé du tube cathodique
    vec3 pos = position;
    vec2 c = uv - 0.5;
    pos.z += 0.07 * max(0.0, 1.0 - dot(c, c) * 2.6);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const screenFragment = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uLit;     // 0 → repos, 1 → survol/visite
  uniform float uFocused; // 1 quand la section est ouverte
  uniform float uOn;      // 0 → éteinte (vol d'approche), 1 → allumée

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Neige analogique, pixellisée grossièrement
    float snow = hash(floor(vUv * vec2(120.0, 68.0)) + floor(uTime * 22.0));
    vec3 col = vec3(snow) * (0.15 + uLit * 0.08);

    // Label
    vec4 txt = texture2D(uTex, vUv);
    vec3 textColor = mix(vec3(0.95), vec3(1.0, 0.62, 0.08), uLit);
    textColor = mix(textColor, vec3(1.0, 0.88, 0.35), uFocused);
    col += txt.a * textColor * (0.95 + 0.45 * uFocused);

    // Scanlines + courbure lumineuse d'écran cathodique
    col *= 0.86 + 0.14 * sin(vUv.y * 320.0 + uTime * 7.0);
    vec2 d = vUv - 0.5;
    col *= 1.0 - dot(d, d) * 1.1;

    // Allumage : éteint pendant le vol d'approche, flash à la mise sous tension
    col *= uOn;

    // Coins arrondis de la dalle, le châssis fait office de bezel
    vec2 q = abs(vUv - 0.5) - 0.41;
    float sd = length(max(q, vec2(0.0))) - 0.09;
    float mask = 1.0 - smoothstep(-0.02, 0.005, sd);

    gl_FragColor = vec4(col * mask, 1.0);
  }
`

// --- Écran CRT flottant = une section du portfolio ---
// Entrée en scène : arrive du fond du fog, se positionne, puis s'allume
const ENTRY_FLIGHT = 1.5 // durée du vol d'approche (s)
const ENTRY_STAGGER = 0.18 // décalage entre télés (s)

function ScreenTV({ cfg, index, focused, animate, onSelect, registerRef }) {
  const group = useRef(null)
  const inner = useRef(null)
  const screenMat = useRef(null)
  const clock = useRef(0)
  const power = useRef(0)
  const ledRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  // Le label est appliqué directement sur le matériau via la ref : R3F copie
  // l'objet uniforms à la création du matériau, muter l'objet mémoïsé ne
  // l'atteint donc jamais (même chemin que uTime dans useFrame).
  useEffect(() => {
    let alive = true
    const apply = (t) => {
      if (screenMat.current) screenMat.current.uniforms.uTex.value = t
    }
    let tex = makeLabelTexture(cfg.label)
    apply(tex)
    whenFontReady().then(() => {
      if (!alive) return
      const old = tex
      tex = makeLabelTexture(cfg.label)
      apply(tex)
      old.dispose()
    })
    return () => {
      alive = false
      apply(BLANK_TEX)
      tex.dispose()
    }
  }, [cfg.label])

  useEffect(() => {
    registerRef(cfg.id, group.current)
  }, [cfg.id, registerRef])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  const uniforms = useMemo(
    () => ({
      uTex: { value: BLANK_TEX },
      uTime: { value: Math.random() * 100 },
      uLit: { value: 0 },
      uFocused: { value: 0 },
      uOn: { value: 0 },
    }),
    [],
  )

  useFrame((_, delta) => {
    // Vol d'approche : la télé émerge du fog et rejoint sa place (échelonné),
    // en mouvement réduit tout est déjà en place
    if (animate) clock.current += delta
    else if (clock.current < 100) clock.current = 100
    const k = Math.min(Math.max((clock.current - index * ENTRY_STAGGER) / ENTRY_FLIGHT, 0), 1)
    const e = 1 - Math.pow(1 - k, 3)
    group.current.position.set(
      cfg.position[0],
      cfg.position[1] - (1 - e) * 1.4,
      cfg.position[2] - (1 - e) * 34,
    )
    // Tournoiement pendant le vol (sens alterné), qui décélère avec
    // l'ease-out et se cale exactement face à la caméra à l'arrivée
    const spinDir = index % 2 === 0 ? 1 : -1
    group.current.rotation.set(
      (1 - e) * 0.35 * spinDir,
      cfg.yaw + (1 - e) * Math.PI * 2.5 * spinDir,
      (1 - e) * 0.5 * spinDir,
    )
    // Mise sous tension une fois positionnée
    if (e >= 1 && power.current < 1) {
      if (power.current === 0) playBlip()
      power.current = animate ? Math.min(1, power.current + delta * 2.4) : 1
    }
    if (ledRef.current) ledRef.current.visible = power.current > 0.4

    const mat = screenMat.current
    if (mat) {
      if (animate || hovered) mat.uniforms.uTime.value += delta
      // Sur-brillance passagère à l'allumage, comme un tube qui chauffe
      const p = power.current
      mat.uniforms.uOn.value = p * (1 + 2.2 * (1 - p))
      // Transitions douces d'allumage, sans re-render React
      const litTarget = hovered || focused ? 1 : 0
      mat.uniforms.uLit.value += (litTarget - mat.uniforms.uLit.value) * 0.12
      const focusTarget = focused ? 1 : 0
      mat.uniforms.uFocused.value += (focusTarget - mat.uniforms.uFocused.value) * 0.1
    }
    if (inner.current) {
      if (focused) {
        // La télé se stabilise pour accueillir la caméra dans son écran
        inner.current.position.y *= 0.88
        inner.current.rotation.z *= 0.88
        inner.current.rotation.x *= 0.88
      } else if (animate) {
        // Flottement : bob vertical + très légère oscillation d'assiette
        const t = performance.now() * 0.001
        inner.current.position.y = Math.sin(t * cfg.bobSpeed + cfg.phase) * 0.12
        inner.current.rotation.z = Math.sin(t * 0.4 + cfg.phase) * 0.02
        inner.current.rotation.x = Math.sin(t * 0.3 + cfg.phase * 2.0) * 0.015
      }
    }
  })

  return (
    <group
      ref={group}
      position={[cfg.position[0], cfg.position[1] - 1.4, cfg.position[2] - 34]}
      rotation={[0, cfg.yaw, 0]}
    >
      <group ref={inner} scale={cfg.scale || 1}>
        {/* Corps du téléviseur */}
        <mesh
          geometry={tvBodyGeo}
          material={tvBodyMat}
          onClick={(e) => {
            e.stopPropagation()
            if (power.current < 1) return // pas encore allumée
            group.current.getWorldPosition(_v1)
            onSelect(cfg.id, _v1)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            if (power.current < 0.6) return
            if (!hovered) playBlip()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
        />
        {/* Écran */}
        <mesh geometry={screenGeo} position={SCREEN_LOCAL}>
          <shaderMaterial
            ref={screenMat}
            vertexShader={screenVertex}
            fragmentShader={screenFragment}
            uniforms={uniforms}
          />
        </mesh>
        {/* Tube arrière, pieds, boutons, grille son, LED : silhouette cathodique */}
        <mesh geometry={tvHumpGeo} material={tvBodyMat} position={[0, 0, -0.46]} />
        <mesh geometry={footGeo} material={tvDetailMat} position={[-0.62, -0.735, 0.02]} />
        <mesh geometry={footGeo} material={tvDetailMat} position={[0.62, -0.735, 0.02]} />
        <mesh geometry={knobGeo} material={tvDetailMat} position={[0.76, 0.34, 0.225]} />
        <mesh geometry={knobGeo} material={tvDetailMat} position={[0.76, 0.14, 0.225]} />
        <mesh geometry={slitGeo} material={tvDetailMat} position={[0.76, -0.06, 0.215]} />
        <mesh geometry={slitGeo} material={tvDetailMat} position={[0.76, -0.13, 0.215]} />
        <mesh geometry={slitGeo} material={tvDetailMat} position={[0.76, -0.2, 0.215]} />
        <mesh
          ref={ledRef}
          geometry={ledGeo}
          material={ledMat}
          position={[0.76, -0.45, 0.215]}
          visible={false}
        />
        <mesh
          geometry={antennaGeo}
          material={tvDetailMat}
          position={[-0.28, 0.95, 0]}
          rotation={[0, 0, 0.5]}
        />
        <mesh
          geometry={antennaGeo}
          material={tvDetailMat}
          position={[0.28, 0.95, 0]}
          rotation={[0, 0, -0.5]}
        />
      </group>
    </group>
  )
}

// --- Grille rétro infinie sous le menu (l'horizon "jeu vidéo") ---
// Hauteur du plan de la grille, partagée avec la zone d'exclusion des télés
const GRID_Y = -1.5

function RetroGrid({ animate }) {
  const mat = useRef(null)

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((_, delta) => {
    if (mat.current && animate) mat.current.uniforms.uTime.value += delta
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, GRID_Y, 0]}>
      <planeGeometry args={[130, 130]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec2 vPos;
          void main() {
            vPos = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          precision mediump float;
          varying vec2 vPos;
          uniform float uTime;

          void main() {
            // Défilement lent vers la caméra, façon écran titre d'arcade
            vec2 p = vec2(vPos.x, vPos.y + uTime * 0.9);
            vec2 g = abs(fract(p / 2.2) - 0.5);
            float line = smoothstep(0.44, 0.5, max(g.x, g.y));
            float fade = exp(-length(vPos) * 0.045);
            vec3 col = vec3(1.0, 0.55, 0.08) * line * fade;
            gl_FragColor = vec4(col, line * fade * 0.75);
          }
        `}
      />
    </mesh>
  )
}

// --- Poussière spatiale ambiante : particules dérivant lentement ---
const DUST_COUNT_DESKTOP = 500
const DUST_COUNT_MOBILE = 200

function Dust({ animate }) {
  const mat = useRef(null)
  const mobile = isMobile()
  const dustCount = mobile ? DUST_COUNT_MOBILE : DUST_COUNT_DESKTOP

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(dustCount * 3)
    const seeds = new Float32Array(dustCount)
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = Math.random() * 10 - 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18
      seeds[i] = Math.random() * Math.PI * 2
    }
    return { positions, seeds }
  }, [dustCount])

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((_, delta) => {
    if (mat.current && animate) mat.current.uniforms.uTime.value += delta
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute float aSeed;
          uniform float uTime;
          varying float vAlpha;

          void main() {
            vec3 pos = position;
            // Dérive ascendante bouclée + léger balancement latéral
            pos.y = mod(pos.y + 2.0 + uTime * (0.08 + aSeed * 0.02), 10.0) - 2.0;
            pos.x += sin(uTime * 0.25 + aSeed) * 0.4;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (1.6 + sin(aSeed) * 0.8) * (36.0 / -mv.z);
            vAlpha = 0.35 + 0.3 * sin(uTime * 0.8 + aSeed * 3.0);
          }
        `}
        fragmentShader={/* glsl */ `
          precision mediump float;
          varying float vAlpha;
          void main() {
            vec2 d = gl_PointCoord - 0.5;
            float a = smoothstep(0.5, 0.15, length(d)) * vAlpha;
            gl_FragColor = vec4(1.0, 0.75, 0.45, a);
          }
        `}
      />
    </points>
  )
}

// --- Étoiles lointaines ---
function Starfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(650 * 3)
    for (let i = 0; i < 650; i++) {
      const r = 40 + Math.random() * 25
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = Math.abs(r * Math.cos(phi)) - 8
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    return arr
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} sizeAttenuation color="#8f8f8f" depthWrite={false} fog={false} />
    </points>
  )
}

// --- Burst de particules à la sélection d'un écran ---
const BURST_COUNT = 110
const BURST_DURATION = 0.65

function SelectionBurst({ burstRef }) {
  const mat = useRef(null)

  const velocities = useMemo(() => {
    const arr = new Float32Array(BURST_COUNT * 3)
    for (let i = 0; i < BURST_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 1.6 + Math.random() * 2.6
      arr[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
      arr[i * 3 + 1] = Math.cos(phi) * speed
      arr[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed
    }
    return arr
  }, [])

  const positions = useMemo(() => new Float32Array(BURST_COUNT * 3), [])

  const uniforms = useMemo(
    () => ({
      uOrigin: { value: new THREE.Vector3(0, -100, 0) },
      uAge: { value: BURST_DURATION + 1 },
    }),
    [],
  )

  // Déclencheur imposé de l'extérieur, sans re-render
  useEffect(() => {
    burstRef.current = (origin) => {
      uniforms.uOrigin.value.copy(origin)
      uniforms.uAge.value = 0
    }
  }, [burstRef, uniforms])

  useFrame((_, delta) => {
    if (uniforms.uAge.value <= BURST_DURATION) uniforms.uAge.value += delta
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aVel" args={[velocities, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          attribute vec3 aVel;
          uniform vec3 uOrigin;
          uniform float uAge;
          varying float vAlpha;

          void main() {
            float t = clamp(uAge, 0.0, ${BURST_DURATION});
            vec3 pos = uOrigin + aVel * t - vec3(0.0, 1.2 * t * t, 0.0);
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            float life = 1.0 - t / ${BURST_DURATION};
            vAlpha = life;
            gl_PointSize = (2.2 * life + 0.4) * (40.0 / -mv.z);
          }
        `}
        fragmentShader={/* glsl */ `
          precision mediump float;
          varying float vAlpha;
          void main() {
            vec2 d = gl_PointCoord - 0.5;
            float a = smoothstep(0.5, 0.1, length(d)) * vAlpha;
            gl_FragColor = vec4(1.0, 0.72, 0.25, a);
          }
        `}
      />
    </points>
  )
}

// --- Télés d'ambiance : tunnel de CRT identiques aux principales. ---
// --- Chaque télé garde sa place sur son anneau, l'ensemble dérive vers ---
// --- la caméra au rythme de la grille et regagne le fond en bouclant. ---
const BG_RING_Z_DESKTOP = [8, 0, -8, -16, -24, -32, -40]
const BG_RING_Z_MOBILE = [0, -16, -32]
const BG_PER_RING_DESKTOP = 22
const BG_PER_RING_MOBILE = 12
const BG_TV_COUNT_DESKTOP = BG_RING_Z_DESKTOP.length * BG_PER_RING_DESKTOP
const BG_TV_COUNT_MOBILE = BG_RING_Z_MOBILE.length * BG_PER_RING_MOBILE
// Sortie derrière la caméra (z = 12) et spawn enfoui dans le fog (z = -44) :
// aucune apparition ni disparition visible, on les voit émerger de loin
const BG_FRONT = 12
const BG_DEPTH = 56
const BG_SPEED = 0.9 // même vitesse que le défilement de la grille

// Pièces du modèle dupliqué : [tx, ty, tz, rotZ] dans le repère du téléviseur
const BG_PARTS = [
  [0, 0, 0, 0], // corps
  [0, 0, -0.46, 0], // tube arrière
  [-0.14, 0, 0.24, 0], // dalle
  [-0.62, -0.735, 0.02, 0], // pied gauche
  [0.62, -0.735, 0.02, 0], // pied droit
  [-0.28, 0.95, 0, 0.5], // antenne gauche
  [0.28, 0.95, 0, -0.5], // antenne droite
  [0.76, 0.34, 0.225, 0], // molette haute
  [0.76, 0.14, 0.225, 0], // molette basse
  [0.76, -0.06, 0.215, 0], // fente haut-parleur
  [0.76, -0.13, 0.215, 0], // fente haut-parleur
  [0.76, -0.2, 0.215, 0], // fente haut-parleur
  [0.76, -0.45, 0.215, 0], // LED
]

function FloatingTVs({ animate }) {
  /* eslint-disable react-hooks/rules-of-hooks */
  const refs = Array.from({ length: BG_PARTS.length }, () => useRef(null))
  /* eslint-enable react-hooks/rules-of-hooks */
  const time = useRef(0)
  const filled = useRef(false)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const mobile = isMobile()
  const ringZ = mobile ? BG_RING_Z_MOBILE : BG_RING_Z_DESKTOP
  const perRing = mobile ? BG_PER_RING_MOBILE : BG_PER_RING_DESKTOP
  const tvCount = mobile ? BG_TV_COUNT_MOBILE : BG_TV_COUNT_DESKTOP

  const items = useMemo(() => {
    const list = []
    ringZ.forEach((ringZ, r) => {
      for (let j = 0; j < perRing; j++) {
        // Chaque télé garde sa place (x, y) sur l'anneau, seule la
        // profondeur défile — le bordel vient des orientations.
        // Les créneaux angulaires réguliers bornent l'écart maximal
        // entre voisines, la relaxation ci-dessous borne le minimal.
        const a = (j / perRing) * Math.PI * 2 + r * 0.31 + (Math.random() - 0.5) * 0.22
        const rn = 1 + (Math.random() - 0.5) * 0.24
        list.push({
          x: Math.cos(a) * 8.3 * rn,
          y: 1.6 + Math.sin(a) * 5.1 * rn,
          z0: ringZ + (Math.random() - 0.5) * 2.4,
          scale: 0.6 + Math.random() * 0.55,
          yaw: (Math.random() - 0.5) * 1.0,
          pitch: (Math.random() - 0.5) * 0.4,
          roll: (Math.random() - 0.5) * 0.7,
          spin: (Math.random() - 0.5) * 0.06,
          bob: 0.4 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
        })
      }
    })

    // Anti-encastrement : écartement itératif par paires, distance minimale
    // proportionnelle aux tailles. La profondeur est comparée modulo la
    // boucle du tunnel (une télé du fond peut côtoyer une télé de tête).
    for (let iter = 0; iter < 4; iter++) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const A = list[i]
          const B = list[j]
          let dx = A.x - B.x
          let dy = A.y - B.y
          let dz = ((A.z0 - B.z0) % BG_DEPTH + BG_DEPTH) % BG_DEPTH
          if (dz > BG_DEPTH / 2) dz -= BG_DEPTH
          const dmin = 1.35 * (A.scale + B.scale) + 0.3
          const d2 = dx * dx + dy * dy + dz * dz
          if (d2 >= dmin * dmin) continue
          const d = Math.sqrt(d2) || 0.001
          const push = ((dmin - d) / d) * 0.5
          A.x += dx * push
          A.y += dy * push
          A.z0 += dz * push
          B.x -= dx * push
          B.y -= dy * push
          B.z0 -= dz * push
        }
      }
      // Re-projection dans la bande elliptique : le couloir central du menu
      // reste inviolable même après écartement
      for (const it of list) {
        const u = it.x / 8.3
        const v = (it.y - 1.6) / 5.1
        const rn = Math.hypot(u, v) || 0.001
        const cl = Math.min(Math.max(rn, 0.86), 1.34)
        if (cl !== rn) {
          it.x *= cl / rn
          it.y = 1.6 + (it.y - 1.6) * (cl / rn)
        }
        // Jamais à travers la grille (y = -1.5) : toute télé dont
        // l'encombrement (taille + bob) chevauche le plan est repoussée
        // du côté le plus proche, entièrement au-dessus ou en dessous
        const m = 1.35 * it.scale + 0.35
        const dyG = it.y - GRID_Y
        if (Math.abs(dyG) < m) it.y = GRID_Y + (dyG >= 0 ? m : -m)
      }
    }
    return list
  }, [])

  const seeds = useMemo(() => {
    const arr = new Float32Array(tvCount)
    for (let i = 0; i < tvCount; i++) arr[i] = Math.random() * 10
    return arr
  }, [tvCount])

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((_, delta) => {
    const meshes = refs.map((r) => r.current)
    if (meshes.some((m) => !m)) return
    if (animate) time.current += delta
    else if (filled.current) return // scène figée : matrices déjà en place
    filled.current = true
    const t = time.current
    meshes[2].material.uniforms.uTime.value = t

    for (let i = 0; i < tvCount; i++) {
      const it = items[i]
      // L'anneau coulisse vers la caméra et redisparaît au fond du tunnel
      const raw = it.z0 + t * BG_SPEED
      const z = BG_FRONT - ((((BG_FRONT - raw) % BG_DEPTH) + BG_DEPTH) % BG_DEPTH)
      const y = it.y + Math.sin(t * it.bob + it.phase) * 0.18
      const yaw = it.yaw + t * it.spin
      for (let p = 0; p < BG_PARTS.length; p++) {
        const part = BG_PARTS[p]
        dummy.position.set(it.x, y, z)
        dummy.rotation.set(it.pitch, yaw, it.roll)
        dummy.scale.setScalar(it.scale)
        // translateX/Y/Z n'applique PAS le scale de l'objet : les offsets
        // doivent être mis à l'échelle de la télé, sinon les pièces se
        // détachent du châssis sur les petites instances
        dummy.translateX(part[0] * it.scale)
        dummy.translateY(part[1] * it.scale)
        dummy.translateZ(part[2] * it.scale)
        if (part[3] !== 0) dummy.rotateZ(part[3])
        dummy.updateMatrix()
        meshes[p].setMatrixAt(i, dummy.matrix)
      }
    }
    meshes.forEach((m) => {
      m.instanceMatrix.needsUpdate = true
    })
  })

  return (
    <group>
      <instancedMesh
        ref={refs[0]}
        args={[tvBodyGeo, tvBodyMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[1]}
        args={[tvHumpGeo, tvBodyMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[3]}
        args={[footGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[4]}
        args={[footGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[5]}
        args={[antennaGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[6]}
        args={[antennaGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[7]}
        args={[knobGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[8]}
        args={[knobGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[9]}
        args={[slitGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[10]}
        args={[slitGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[11]}
        args={[slitGeo, tvDetailMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={refs[12]}
        args={[ledGeo, ledMat, tvCount]}
        frustumCulled={false}
      />
      <instancedMesh ref={refs[2]} args={[undefined, undefined, tvCount]} frustumCulled={false}>
        <planeGeometry args={[1.44, 1.0, 12, 9]}>
          <instancedBufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </planeGeometry>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={/* glsl */ `
            attribute float aSeed;
            varying vec2 vUv;
            varying float vSeed;
            varying float vFogDepth;
            void main() {
              vUv = uv;
              vSeed = aSeed;
              vec3 pos = position;
              vec2 c = uv - 0.5;
              pos.z += 0.07 * max(0.0, 1.0 - dot(c, c) * 2.6);
              vec4 mv = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
              vFogDepth = -mv.z;
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={/* glsl */ `
            precision mediump float;
            varying vec2 vUv;
            varying float vSeed;
            varying float vFogDepth;
            uniform float uTime;

            float hash(vec2 p) {
              return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
              // Copie exacte de l'écran principal au repos (même grain,
              // même luminosité), seul vSeed désynchronise la neige
              float snow = hash(floor(vUv * vec2(120.0, 68.0)) + floor(uTime * 22.0) + vSeed);
              vec3 col = vec3(snow) * 0.15;
              col *= 0.86 + 0.14 * sin(vUv.y * 320.0 + uTime * 7.0);
              vec2 d = vUv - 0.5;
              col *= 1.0 - dot(d, d) * 1.1;
              vec2 q = abs(vUv - 0.5) - 0.41;
              float sd = length(max(q, vec2(0.0))) - 0.09;
              float mask = 1.0 - smoothstep(-0.02, 0.005, sd);
              // Même fog noir que la scène : émergence en douceur
              col *= 1.0 - smoothstep(16.0, 42.0, vFogDepth);
              gl_FragColor = vec4(col * mask, 1.0);
            }
          `}
        />
      </instancedMesh>
    </group>
  )
}

// --- Caméra : vue menu ↔ plongée dans l'écran choisi + parallax souris ---
function CameraRig({ focusedId, tvRefs, animate, onArrived }) {
  const { camera } = useThree()
  const pos = useRef(new THREE.Vector3(0, 1.7, 10.5))
  const look = useRef(new THREE.Vector3(0, 1.1, 0))
  const arrived = useRef(null)
  const mobile = isMobile()

  useFrame((state) => {
    let tv = null
    
    if (mobile) {
      // Mobile: use direct camera positioning instead of TV references
      if (focusedId) {
        // Direct camera positioning for mobile zoom
        const targetPos = new THREE.Vector3(0, 1.8, -3.5)
        const targetLook = new THREE.Vector3(0, 1.8, -4.0)
        
        if (animate) {
          pos.current.lerp(targetPos, 0.045)
          look.current.lerp(targetLook, 0.045)
        } else {
          pos.current.copy(targetPos)
          look.current.copy(targetLook)
        }
        
        // Trigger arrived callback for mobile
        if (!arrived.current && pos.current.distanceTo(targetPos) < 0.1) {
          arrived.current = true
          onArrived()
        }
      } else {
        // Reset to mobile default position
        const defaultPos = new THREE.Vector3(0, 1.7, 3.5)
        const defaultLook = new THREE.Vector3(0, 1.1, 0)
        
        if (animate) {
          pos.current.lerp(defaultPos, 0.045)
          look.current.lerp(defaultLook, 0.045)
        } else {
          pos.current.copy(defaultPos)
          look.current.copy(defaultLook)
        }
        
        arrived.current = null
      }
      
      camera.position.copy(pos.current)
      camera.lookAt(look.current)
      return
    } else {
      // Desktop: use original TV reference system
      tv = focusedId ? tvRefs.current[focusedId] : null
    }

    if (tv) {
      // Centre de l'écran en monde (le groupe externe ne subit pas le bob,
      // et la télé focus se stabilise pendant le trajet)
      tv.getWorldPosition(_v1)
      tv.getWorldQuaternion(_q1)
      _v1.add(_v2.copy(SCREEN_LOCAL).applyQuaternion(_q1))
      // Distance telle que l'écran (1.44 × 1.0) déborde du viewport
      const halfTan = Math.tan((camera.fov * Math.PI) / 360)
      const dist =
        0.94 * Math.min(1 / (2 * halfTan), 1.44 / (2 * halfTan * camera.aspect))
      _v2.set(0, 0, 1).applyQuaternion(_q1)
      _v3.copy(_v1).addScaledVector(_v2, dist)
      pos.current.lerp(_v3, animate ? 0.07 : 1)
      look.current.lerp(_v1, animate ? 0.07 : 1)
      // Fin de course : on prévient l'appli pour allumer la "chaîne"
      if (arrived.current !== focusedId && pos.current.distanceTo(_v3) < 0.04) {
        arrived.current = focusedId
        onArrived(focusedId)
      }
    } else {
      arrived.current = null
      // Vue d'ensemble + parallax souris
      _v3.set(state.pointer.x * 0.9, 1.7 + state.pointer.y * 0.45, 10.5)
      pos.current.lerp(_v3, animate ? 0.045 : 1)
      _v2.set(state.pointer.x * 0.4, 1.1, 0)
      look.current.lerp(_v2, animate ? 0.045 : 1)
    }

    camera.position.copy(pos.current)
    camera.lookAt(look.current)
  })

  return null
}

// Mobile detection helper
const isMobile = () => {
  return typeof window !== 'undefined' && window.innerWidth <= 768;
}

export function Scene3D({ sections, focusedId, zoomed, onSelect, onArrived, animate, interactive }) {
  const tvRefs = useRef({})
  const burstRef = useRef(() => {})
  const mobile = isMobile()

  function registerRef(id, ref) {
    tvRefs.current[id] = ref
  }

  function handleSelect(id, worldPos) {
    burstRef.current(worldPos)
    onSelect(id)
  }

  return (
    <div className="scene-3d">
      <Canvas
        dpr={mobile ? [1, 1] : [1, 1.5]}
        gl={{ 
          antialias: !mobile, 
          powerPreference: mobile ? 'default' : 'high-performance',
          alpha: false 
        }}
        camera={{ position: [0, 1.7, mobile ? 3.5 : 10.5], fov: mobile ? 55 : 55 }}
        touches={{
          enabled: true,
          preventDefault: mobile
        }}
      >
        <color attach="background" args={['#000000']} />
        {/* Fog noir lointain : les télés émergent progressivement du fond */}
        <fog attach="fog" args={['#000000', 16, 42]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 8]} intensity={0.85} color="#ffd9a0" />

        <Starfield />
        <Dust animate={animate} />
        <RetroGrid animate={animate} />
        <FloatingTVs animate={animate} />
        <SelectionBurst burstRef={burstRef} />

        <group>
          {interactive && (
            mobile ? (
              // Mobile: show only one TV that works independently
              <ScreenTV
                key="mobile-tv"
                cfg={{
                  id: 'mobile-tv',
                  label: focusedId && zoomed ? sections.find(s => s.id === focusedId)?.label || 'Portfolio' : 'Portfolio',
                  position: [0, 1.8, -4.0],
                  yaw: 0,
                  bobSpeed: 0.8,
                  phase: 0,
                  scale: 1.5
                }}
                index={0}
                focused={!!focusedId}
                animate={animate}
                onSelect={() => {}} // Mobile TV doesn't trigger camera - camera is controlled by focusedId
                registerRef={registerRef}
              />
            ) : (
              // Desktop: show all TVs normally
              sections.map((cfg, i) => (
                <ScreenTV
                  key={cfg.id}
                  cfg={cfg}
                  index={i}
                  focused={focusedId === cfg.id}
                  animate={animate}
                  onSelect={handleSelect}
                  registerRef={registerRef}
                />
              ))
            )
          )}
        </group>

        <CameraRig
          focusedId={focusedId}
          tvRefs={tvRefs}
          animate={animate}
          onArrived={onArrived}
        />
      </Canvas>
    </div>
  )
}
