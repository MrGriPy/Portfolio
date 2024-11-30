let timeoutId;
let lastSoundTime = 0; // Garde en mémoire le temps du dernier son

function typeWriter(text, elementId) {
  let i = 0;
  const speed = 25; // Vitesse de défilement des lettres
  const soundInterval = 50; // Temps minimum entre deux sons (en ms)
  const element = document.getElementById(elementId);
  const audio = new Audio("blip.wav");
  
  if (timeoutId) clearTimeout(timeoutId);
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      const now = Date.now();

      // Ajout de la lettre (saut de ligne traité séparément)
      element.innerHTML += text[i] === "\n" ? "<br>" : text[i];

      // Jouer le son uniquement si c'est une lettre et si le délai est respecté
      if (/[a-zA-Z0-9]/.test(text[i]) && now - lastSoundTime > soundInterval) {
        audio.currentTime = 0; // Rejoue le son depuis le début
        audio.play();
        lastSoundTime = now;
      }

      i++;
      timeoutId = setTimeout(type, speed);
    } else {
      scrollToTop(element); // Fonction existante pour le scroll
    }
  }

  type();
}
// Exemple d'appel de la fonction sur le clic du bouton "fight"
document.getElementById("fight").addEventListener("click", () => {
  typeWriter(
    `Bonjour, je m'appelle Thomas Vidal.

Je suis passionné par le jeu vidéo depuis toujours, notamment par le game design, son histoire et son impact sur notre société. Mon objectif à long terme est de travailler dans ce domaine pour créer des expériences immersives et uniques.

Grâce à mon parcours en STI2D qui a été une étape clé après avoir surmonté une erreur de filière, j'ai réussi à intégrer le BUT MMI de Gustave Eiffel à Champs-sur-Marne. Ce parcours témoigne de ma détermination et de ma résilience, des qualités que je considère essentielles pour la réussite de mon parcours.

J'ai acquis des compétences techniques en HTML/CSS/JS, PHP, Premiere Pro, et After Effects. Travailler dans le game design me permettrait de contribuer à l'industrie en captivant les joueurs de la même manière que les jeux ont su me captiver.`,
    "textBox"
  );
});


document.getElementById("act").addEventListener("click", () => {
  const projectHTML = `
    <div class="project-list">
      <div class="project-item">
        <img src="img/vidaletfils.PNG" alt="Projet 1" class="project-icon" onclick="window.open('https://github.com/MrGriPy/SCI-Vidal-et-Fils')" />
        <div class="project-description">VIDAL ET FILS : Site de location ayant pour but de tester mes compétences en HTML, CSS, JavaScript, et PHP.</div>
      </div>
      <div class="project-item">
        <img src="img/vgslogo.png" alt="Projet 2" class="project-icon" onclick="window.open('https://mrgripy.github.io/Video-Game-Stats/')" />
        <div class="project-description">VIDEO GAME STATS : Site de statistiques qui démontre les clichés sur le Jeu Vidéo.</div>
      </div>
      <div class="project-item">
        <img src="img/APERO.png" alt="Projet 3" class="project-icon" onclick="window.open('https://www.youtube.com/watch?v=vl6RfXwczIs')" />
        <div class="project-description">L'APERO : Mini-projet dans lequel nous devions faire un montage scénarisé à partir de divers mouvements de caméra.</div>
      </div>
      <div class="project-item">
        <img src="img/portrait-chinois.png" alt="Projet 4" class="project-icon" onclick="window.open('https://mrgripy.github.io/portrait-chinois/')" />
        <div class="project-description">PORTRAIT CHINOIS : Site qui me permet de me présenter sous un autre angle, pour but de tester mes compétences en HTML, CSS, et JavaScript.</div>
      </div>
      <div class="project-item">
        <img src="img/Mini-blog.png" alt="Projet 5" class="project-icon" onclick="window.open('https://github.com/MrGriPy/Mini-blog')" />
        <div class="project-description">MINI-BLOG : Site minimaliste qui permet un système de session utilisateur fonctionnelle et d'administration complet de l'administrateur du blog.</div>
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
    name: "Sonia Patinote, Maîtresse de stage",
    text: "Thomas a su s'adapter rapidement à notre environnement professionnel. Très ponctuel et très sérieux, il a su aider l'équipe et s'en faire apprécier."
  },
  {
    name: "Marisa, Manager Mc Donald's",
    text: "Il essaye toujours de faire de son mieux en se montrant autonome et en se proposant pour toutes les tâches."
  },
  {
    name: "Camarade de classe",
    text: "Travailler avec Thomas sur des projets d'équipe est toujours agréable. Il est perfectionniste et apporte une vraie plus-value au travail collectif."
  }
];

let currentTestimonialIndex = 0;

document.getElementById("item").addEventListener("click", () => {
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

  typeWriterEffect(text, testimonialText);

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (currentTestimonialIndex > 0) {
      currentTestimonialIndex--;
      displayTestimonial(currentTestimonialIndex);
    }
  });

  document.getElementById("nextBtn")?.addEventListener("click", () => {
    if (currentTestimonialIndex < testimonials.length - 1) {
      currentTestimonialIndex++;
      displayTestimonial(currentTestimonialIndex);
    }
  });
}

const audio = new Audio("blip.wav"); // Charger le son blip

function typeWriterEffect(text, element) {
  let i = 0;
  const speed = 25; // Vitesse d'apparition des lettres
  const soundInterval = 50; // Temps minimum entre deux sons (en ms)
  
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      const now = Date.now();

      // Ajout de la lettre dans l'élément
      element.innerHTML += text.charAt(i);

      // Jouer le son uniquement si c'est une lettre et si le délai est respecté
      if (/[a-zA-Z0-9]/.test(text.charAt(i)) && now - lastSoundTime > soundInterval) {
        audio.currentTime = 0; // Rejoue le son depuis le début
        audio.play();
        lastSoundTime = now;
      }

      i++;
      setTimeout(type, speed); // Rappel pour la prochaine lettre
    }
  }

  type();
}

document.getElementById("mercy").addEventListener("click", () => {
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
