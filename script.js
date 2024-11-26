let timeoutId;

function typeWriter(text, elementId) {
  let i = 0;
  const speed = 20;
  const element = document.getElementById(elementId);
  element.innerHTML = "";

  if (timeoutId) clearTimeout(timeoutId);

  function type() {
    if (i < text.length) {
      element.innerHTML += text[i] === "\n" ? "<br>" : text[i];
      i++;
      timeoutId = setTimeout(type, speed);
    } else {
      scrollToTop(element);
    }
  }

  type();
}

document.getElementById("fight").addEventListener("click", () => {
  typeWriter(
    "Bonjour, je m'appelle Thomas Vidal.\n\nJe suis passionné par le jeu vidéo depuis toujours, notamment par le game design, son histoire et son impact sur notre société. Mon objectif à long terme est de travailler dans ce domaine pour créer des expériences immersives et uniques.\n\nGrâce à mon parcours en STI2D qui a été une étape clé après avoir surmonté une erreur de filière, j'ai su rattraper mon erreur en obtenant mon bac STI2D avec mention bien et intégrant le BUT MMI de Gustave Eiffel à Champs-sur-Marne. Ce parcours témoigne de ma détermination et de ma résilience, des qualités que je considère essentielles pour la réussite de mon parcours.\n\nJ'ai acquis des compétences techniques en HTML/CSS/JS, PHP, Premiere Pro, et After Effects. Mon portfolio en ligne et mon CV présent sur LinkedIn montrent un aperçu de mes capacités. Je communiquerai régulièrement mes travaux via Instagram, Twitter (ou X) et YouTube. Travailler dans le game design me permettrait de contribuer à l'industrie en captivant les joueurs de la même manière que les jeux ont su me captiver.",
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
        <div class="project-description">VIDEO GAME STATS : Site de statistiques qui démonte les clichés qui ont longtemps entouré le Jeu Vidéo.</div>
      </div>
      <div class="project-item">
        <img src="img/APERO.png" alt="Projet 3" class="project-icon" onclick="window.open('https://www.youtube.com/watch?v=vl6RfXwczIs')" />
        <div class="project-description">L'APERO : Mini-projet dans lequel nous devions faire un montage scénarisé à partir de divers mouvements de caméra. </div>
      </div>
      <div class="project-item">
        <img src="img/APERO.png" alt="Projet 4" class="project-icon" onclick="window.open('https://mrgripy.github.io/portrait-chinois/')" />
        <div class="project-description">PORTRAIT CHINOIS : Site qui me permet de me présenter sous un autre angle, pour but de tester mes compétences en HTML, CSS, et JavaScript.</div>
      </div>
    </div>
  `;
  const textBox = document.getElementById("textBox");
  textBox.innerHTML = projectHTML;
  scrollToTop(textBox);
});


const testimonials = [
  {
    name: "Sonia Patinote, Maîtresse de stage",
    text: "Thomas a su s'adapter rapidement à notre environnement professionnel. Très ponctuel et très sérieux, il a su aider l'équipe et s'en faire apprécier."
  },
  {
    name: "Marisa, Manager McDonald",
    text: "Il essaye toujours de faire de son mieux en se montrant autonome et en se proposant pour toutes les tâches."
  },
  {
    name: "Camarade de classe",
    text: "Travailler avec Thomas sur des projets d'équipe est toujours agréable. Il est perfectionniste et apporte une vraie plus-value au travail collectif."
  }
];

let currentTestimonialIndex = 0;

document.getElementById("item").addEventListener("click", () => {
  displayTestimonial(currentTestimonialIndex);
});

function displayTestimonial(index) {
  const { name, text } = testimonials[index];
  const textBox = document.getElementById("textBox");
  textBox.innerHTML = `
    <div class="testimonial">
      <div class="testimonial-name">${name} :</div>
      <div id="testimonial-text" class="reversed-text">${text}</div> <br>
      <div class="testimonial-nav">
        <button id="prevBtn" ${index === 0 ? "disabled" : ""}>◀ Précédent</button>
        <button id="nextBtn" ${index === testimonials.length - 1 ? "disabled" : ""}>Suivant ▶</button>
      </div>
    </div>
  `;

  // Gestion des boutons de navigation
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

function correctReversedText(text, elementId) {
  const element = document.getElementById(elementId);
  element.innerHTML = ""; // Efface tout d'abord le contenu actuel
  for (let i = 0; i < text.length; i++) {
    const char = text[i] === "\n" ? "<br>" : text[text.length - 1 - i]; // Corrige l'ordre du texte
    element.innerHTML += char;
  }
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

// Lorsque le titre est cliqué, afficher le contenu avec une animation
document.getElementById("portfolioTitle").addEventListener("click", () => {
  const title = document.getElementById("portfolioTitle");
  title.style.animation = 'slideUpOnClick 1s forwards'; // Animation du titre vers le haut
  document.getElementById("contentInterface").style.display = 'block'; // Afficher le contenu
  const contentInterface = document.getElementById("contentInterface");
  setTimeout(() => {
    contentInterface.style.display = 'block'; // Afficher le contenu
    contentInterface.classList.add('show'); // Ajouter l'animation d'apparition
  }, 100); // Lancer l'animation après l'animation du titre (1s)
});
