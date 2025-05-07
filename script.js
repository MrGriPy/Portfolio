const clickSound = new Audio("clic.wav");
const buttons = document.querySelectorAll(".btn");
buttons.forEach(button => {
  button.addEventListener("click", () => {
    clickSound.currentTime = 0;
    clickSound.play();
  });
});

const typewriterSound = new Audio("blip.wav");

function stopOtherSounds() {
  const allSounds = [typewriterSound];
  allSounds.forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
}

let timeoutId;
let lastSoundTime = 0;

function typeWriter(text, elementId) {
  let i = 0;
  const speed = 25;
  const soundInterval = 50;
  const element = document.getElementById(elementId);
  const audio = new Audio("blip.wav");

  if (timeoutId) clearTimeout(timeoutId);
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      const now = Date.now();

      if (text.substring(i, i + 3) === "<a ") {
        const linkEnd = text.indexOf("</a>", i) + 4;
        const linkHTML = text.substring(i, linkEnd);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = linkHTML;
        const linkElement = tempDiv.firstChild;
        element.appendChild(linkElement);
        i = linkEnd;
      } else if (text[i] === "\n") {
        element.innerHTML += "<br>";
        i++;
      } else {
        const currentChar = text[i];
        element.innerHTML += currentChar;

        if (/[a-zA-Z0-9]/.test(currentChar) && now - lastSoundTime > soundInterval) {
          audio.currentTime = 0;
          audio.play();
          lastSoundTime = now;
        }
        i++;
      }
      timeoutId = setTimeout(type, speed);
    }
  }
  type();
}

document.getElementById("bio").addEventListener("click", () => {
  typeWriter(
    `Bonjour, je m'appelle Thomas Vidal.

Je suis passionné par le développement web et la création numérique, notamment par la manière dont ces outils peuvent transformer la communication, l'expérience utilisateur et l'accès à l'information. Mon objectif à long terme est de travailler dans ce domaine pour concevoir des projets innovants.

Grâce à mon parcours en STI2D qui a été une étape clé après avoir surmonté une erreur de filière, j'ai réussi à intégrer le BUT MMI de Gustave Eiffel à Champs-sur-Marne. Ce parcours témoigne de ma détermination et de ma résilience, des qualités que je considère essentielles pour la réussite de mon parcours.

J'ai acquis des compétences techniques en HTML/CSS/JS, PHP, Premiere Pro, et After Effects. Travailler dans les domaines du web, de la communication ou de l’audiovisuel me permettrait d'exploiter ces compétences afin de les approfondir.`,
    "textBox"
  );
});

document.getElementById("projets").addEventListener("click", () => {
  const projectHTML = `
    <div class="project-list">
      <div class="project-item">
        <img src="img/vidaletfils.PNG" alt="Projet 1" class="project-icon" onclick="window.open('https://vidal.butmmi.o2switch.site/Vidal-et-Fils/')" />
        <div class="project-description">SCI VIDAL ET FILS : Site de location ayant pour but de tester mes compétences en HTML, CSS, JavaScript, et PHP.</div>
      </div>
      <div class="project-item">
        <img src="img/vgslogo.png" alt="Projet 2" class="project-icon" onclick="window.open('https://mrgripy.github.io/VGS/')" />
        <div class="project-description">VIDEO GAME STATS : Site de statistiques qui démontre les clichés sur le Jeu Vidéo.</div>
      </div>
      <div class="project-item">
        <img src="img/APERO.png" alt="Projet 3" class="project-icon" onclick="window.open('https://www.youtube.com/watch?v=vl6RfXwczIs')" />
        <div class="project-description">L'APERO : Mini-projet dans lequel nous devions faire un montage scénarisé à partir de divers mouvements de caméra.</div>
      </div>
      <div class="project-item">
        <img src="img/portrait-chinois.png" alt="Projet 4" class="project-icon" onclick="window.open('https://mrgripy.github.io/portrait-chinois/')" />
        <div class="project-description">PORTRAIT CHINOIS : Site qui me permet de me présenter sous un autre angle, pour but de tester mes compétences en HTML, CSS, et JavaScript. Il s'agit d'un petit projet réalisé en début de première année.</div>
      </div>
      <div class="project-item">
        <img src="img/blog.png" alt="Projet 5" class="project-icon" onclick="window.open('https://github.com/MrGriPy/Mini-blog')" />
        <div class="project-description">MINI-BLOG : Site minimaliste qui permet un système de session utilisateur fonctionnelle et d'administration complet de l'administrateur du blog.</div>
      </div>
      <div class="project-item">
        <img src="img/dreamwar.png" alt="Projet 6" class="project-icon" onclick="window.open('https://sites.google.com/view/thomasvidal/')" />
        <div class="project-description">PROJECT DREAMWAR : Petit projet perso sur l'idéation d'un univers de jeu.</div>
      </div>
    </div>
  `;
  const textBox = document.getElementById("textBox");
  if (timeoutId) clearTimeout(timeoutId);
  textBox.innerHTML = projectHTML;
  scrollToTop(textBox);
});

const testimonials = [
  {
    name: "Sonia, Maîtresse de stage",
    text: "Thomas a su s'adapter rapidement à notre environnement professionnel. Très ponctuel et très sérieux, il a su aider l'équipe et s'en faire apprécier."
  },
  {
    name: "Mariama, Manager Mc Donald's",
    text: "Il essaye toujours de faire de son mieux en se montrant autonome et en se proposant pour toutes les tâches."
  },
  {
    name: "Anthony, Camarade de projet de refonte de site web",
    text: "Travailler avec Thomas sur des projets d'équipe est toujours agréable. Il est perfectionniste et apporte une vraie plus-value au travail collectif."
  }
];

let currentTestimonialIndex = 0;

document.getElementById("temoignages").addEventListener("click", () => {
  if (timeoutId) clearTimeout(timeoutId);
  scrollToTop(textBox);
  displayTestimonial(currentTestimonialIndex);
});

function displayTestimonial(index) {
  const { name, text } = testimonials[index];
  const textBox = document.getElementById("textBox");

  textBox.innerHTML = `
    <div class="testimonial">
      <div class="testimonial-name">${name} :</div>
      <div id="testimonial-text" class="reversed-text"></div> <br>
      <div class="testimonial-nav">
        <button id="prevBtn" ${index === 0 ? "disabled" : ""}>◀ Précédent</button>
        <button id="nextBtn" ${index === testimonials.length - 1 ? "disabled" : ""}>Suivant ▶</button>
      </div>
    </div>
  `;

  const testimonialText = document.getElementById("testimonial-text");
  typeWriter(text, "testimonial-text");

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (currentTestimonialIndex > 0) {
      clickSound.play();
      currentTestimonialIndex--;
      displayTestimonial(currentTestimonialIndex);
    }
  });

  document.getElementById("nextBtn")?.addEventListener("click", () => {
    if (currentTestimonialIndex < testimonials.length - 1) {
      clickSound.play();
      currentTestimonialIndex++;
      displayTestimonial(currentTestimonialIndex);
    }
});}

document.getElementById("opquast").addEventListener("click", () => {
  typeWriter(
    "En avril 2025, je passerai la certification Opquast, qui atteste des bonnes pratiques en matière de qualité web. L'accessibilité, la performance, et la qualité du contenu sur le web sont des aspects essentiels pour garantir une expérience utilisateur optimale. Elle complétera ainsi mon parcours et mes projets en ligne, en assurant que mes créations respectent les normes du développement web.",
    "textBox"
  );
});

function scrollToTop(element) {
  element.scrollTop = element.scrollHeight;
}

window.onload = initAnim;

document.getElementById("portfolioTitle").addEventListener("click", () => {
  const title = document.getElementById("portfolioTitle");
  title.style.animation = 'slideUpOnClick 1s forwards';
  document.getElementById("contentInterface").style.display = 'block';
  const contentInterface = document.getElementById("contentInterface");
  setTimeout(() => {
    contentInterface.style.display = 'block';
    contentInterface.classList.add('show');
  }, 100);
});

document.querySelector('.title').addEventListener('click', function() {
  this.classList.add('clicked');
});

function scrollToTop(element) {
  element.scrollTop = element.scrollHeight;
}

function initAnim() {
  var canvas = document.getElementById("fond");
  var maxx = window.innerWidth;
  var maxy = window.innerHeight;
  var halfx = maxx / 2;
  var halfy = maxy / 2;
  canvas.width = maxx;
  canvas.height = maxy;
  var context = canvas.getContext("2d");
  var dotCount = 200;
  var dots = [];
  for (var i = 0; i < dotCount; i++) {
    dots.push(new dot());
  }

  function render() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, maxx, maxy);
    for (var i = 0; i < dotCount; i++) {
      dots[i].draw();
      dots[i].move();
    }
    requestAnimationFrame(render);
  }

  function dot() {
    this.rad_x = 2 * Math.random() * halfx + 1;
    this.rad_y = 1.2 * Math.random() * halfy + 1;
    this.alpha = Math.random() * 360 + 1;
    this.speed = Math.random() * 100 < 50 ? 1 : -1;
    this.speed *= 0.1;
    this.size = Math.random() * 5 + 1;
    this.color = Math.floor(Math.random() * 256);
  }

  dot.prototype.draw = function () {
    var dx = halfx + this.rad_x * Math.cos((this.alpha / 180) * Math.PI);
    var dy = halfy + this.rad_y * Math.sin((this.alpha / 180) * Math.PI);
    context.fillStyle = "rgb(" + this.color + "," + this.color + "," + this.color + ")";
    context.fillRect(dx, dy, this.size, this.size);
  };

  dot.prototype.move = function () {
    this.alpha += this.speed;
    if (Math.random() * 100 < 50) {
      this.color += 1;
    } else {
      this.color -= 1;
    }
  };

  render();
}

window.onload = initAnim;

document.getElementById("portfolioTitle").addEventListener("click", () => {
  const title = document.getElementById("portfolioTitle");
  title.style.animation = 'slideUpOnClick 1s forwards';
  document.getElementById("contentInterface").style.display = 'block';
  const contentInterface = document.getElementById("contentInterface");
  setTimeout(() => {
    contentInterface.style.display = 'block';
    contentInterface.classList.add('show');
  }, 100);
});

const audio = new Audio("background.wav");
const speakerImage = document.createElement("img");
let isPlaying = false;

speakerImage.src = "img/speaker.png";
speakerImage.style.position = "fixed";
speakerImage.style.bottom = "20px";
speakerImage.style.right = "20px";
speakerImage.style.width = "50px";
speakerImage.style.height = "50px";
speakerImage.style.transition = "transform 0.2s";
speakerImage.style.cursor = "not-allowed";
speakerImage.style.opacity = "0.5";
document.body.appendChild(speakerImage);

function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    speakerImage.src = "img/nospeaker.png";
  } else {
    audio.play();
    speakerImage.src = "img/speaker.png";
  }
  isPlaying = !isPlaying;
}

speakerImage.addEventListener("click", () => {
  if (isPlaying || audio.currentTime > 0) {
    toggleMusic();
  }
});

speakerImage.addEventListener("mouseenter", () => {
  if (isPlaying || audio.currentTime > 0) {
    speakerImage.style.cursor = "pointer";
    speakerImage.style.transform = "scale(1.1)";
  }
});

speakerImage.addEventListener("mouseleave", () => {
  speakerImage.style.transform = "scale(1)";
});

const title = document.getElementById("portfolioTitle");
title.addEventListener("click", () => {
  if (!isPlaying) {
    audio.play();
    isPlaying = true;
    speakerImage.style.cursor = "pointer";
    speakerImage.style.opacity = "1";
  }
});

document.getElementById("contact").addEventListener("click", () => {
  typeWriter(
    `En cas de besoin, n'hésitez pas à me contacter via les coordonnées ci-dessous :

Téléphone : 
+33 6 17 08 18 16

E-mail : <a href="mailto:thomas.vidal0494@gmail.com" style="color:yellow; target="_blank">thomas.vidal0494@gmail.com</a>
LinkedIn : <a href="https://www.linkedin.com/in/thomas-vidal-925a1a296/" style="color:yellow; target="_blank">Thomas Vidal</a>
Mon CV : <a href="C:/Users/toto2/Downloads/CV Thomas_VIDAL.pdf" download="CV Thomas_VIDAL.pdf" style="color:yellow; target="_blank">Télécharger le CV</a>`,
    "textBox"
  );
});
