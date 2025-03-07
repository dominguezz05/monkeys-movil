// Configuración inicial del lienzo
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// Cambiar dinámicamente a filtro de cómic
setTimeout(() => {
  canvas.classList.add("comic-style");
}, 2000); // Activa el estilo cómic después de 2 segundos
// Relación de aspecto fija (ajústala según tu arte)
const ASPECT_RATIO = 14 / 9;

// Ajustar canvas al cargar
function resizeCanvas() {
  const windowAspectRatio = window.innerWidth / window.innerHeight;

  if (windowAspectRatio > ASPECT_RATIO) {
    // Pantalla más ancha que 16:9 -> limitar altura
    canvas.height = window.innerHeight;
    canvas.width = canvas.height * ASPECT_RATIO;
  } else {
    // Pantalla más alta que 16:9 -> limitar anchura
    canvas.width = window.innerWidth;
    canvas.height = canvas.width / ASPECT_RATIO;
  }
  centerCanvas();
}

// Centrar el canvas (borde negro alrededor)
function centerCanvas() {
  const wrapper = document.querySelector(".canvas-wrapper");
  wrapper.style.width = `${canvas.width}px`;
  wrapper.style.height = `${canvas.height}px`;
}
// Cargar la imagen de fondo
const backgroundImage = new Image();
backgroundImage.src = "img/level1/1.png"; // Ruta del fondo

const monkeyJumpImage = new Image();
monkeyJumpImage.src = "img/mono.gif"; // 🐵 Nueva imagen del mono saltando

const backgroundMusic = document.getElementById("backgroundMusic");
const spaceshipSound = document.getElementById("spaceshipSound");
const abductionSound = document.getElementById("abductionSound");
const textBeep = document.getElementById("textBeep");

function playSound(sound) {
  if (sound) {
    sound.currentTime = 0; // Reinicia el sonido en caso de que ya haya sido reproducido
    sound
      .play()
      .catch((error) => console.log("Error al reproducir sonido:", error));
  }
}

// Iniciar la música cuando la página carga
window.addEventListener("load", () => {
  const backgroundMusic = document.getElementById("backgroundMusic");

  backgroundMusic.volume = 0.2; // Volumen suave
  backgroundMusic
    .play()
    .catch((error) => console.log("El navegador bloqueó la música: ", error));
});

// Ajustar el tamaño del canvas según el fondo
backgroundImage.onload = () => {
  resizeCanvas(); // Ajustar al cargar fondo

  // Ajustar posición inicial del mono y la mona según el tamaño del lienzo
  monkey.y = canvas.height - monkey.height;
  femaleMonkey.y = canvas.height - femaleMonkey.height;

  animate(); // Iniciar la animación cuando el fondo esté cargado
};
window.addEventListener("resize", resizeCanvas);
// Propiedades del mono
const monkey = {
  x: -100, // Comienza fuera del lienzo a la izquierda
  y: 0, // Se ajusta después de cargar el fondo
  width: 80,
  height: 80,
  speed: 1, // Movimiento lento
};
let isJumping = false;
let jumpHeight = 20; // Altura máxima del salto
let jumpSpeed = 2; // Velocidad del salto
let jumpDirection = 1; // 1 para subir, -1 para bajar

// Propiedades de la mona
const femaleMonkey = {
  x: canvas.width, // Comienza fuera del lienzo a la derecha
  y: 0, // Se ajusta después de cargar el fondo
  width: 60,
  height: 60,
  speed: 1, // Movimiento lento
  abducted: false, // Estado de la mona
};

// Propiedades de la nave
const spaceship = {
  x: canvas.width / 2 + 100, // Cambiado para desplazar la nave más a la derecha
  y: -100, // Comienza fuera de la pantalla
  width: 125,
  height: 150,
  targetY: canvas.height / 2 - 50, // Altura objetivo
  visible: false,
};

// Efecto de temblor
let shakeIntensity = 0;

let abducting = false; // Estado de la abducción
let abductionProgress = 0; // Progreso de la abducción (0 a 1)

// Cargar imágenes
const monkeyImage = new Image();
monkeyImage.src = "img/monkey-0.png"; // Imagen del mono

const femaleMonkeyImage = new Image();
femaleMonkeyImage.src = "img/monjeyF.png"; // Imagen de la mona

const spaceshipImage = new Image();
spaceshipImage.src = "img/naveBoss.png"; // Imagen de la nave

// Función para dibujar el fondo
function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Función para dibujar personajes y objetos
function drawMonkey() {
  if (isJumping) {
    ctx.drawImage(
      monkeyJumpImage,
      monkey.x,
      monkey.y,
      monkey.width,
      monkey.height
    );
  } else {
    ctx.drawImage(monkeyImage, monkey.x, monkey.y, monkey.width, monkey.height);
  }
}
function jumpMonkey() {
  if (isJumping) {
    monkey.y -= jumpSpeed * jumpDirection; // Mueve el mono arriba o abajo

    // Si el mono alcanza la altura máxima, cambia de dirección
    if (monkey.y <= canvas.height - monkey.height - jumpHeight) {
      jumpDirection = -1; // Ahora baja
    }

    // Si el mono vuelve al suelo, cambia la dirección para subir de nuevo
    if (monkey.y >= canvas.height - monkey.height) {
      jumpDirection = 1; // Ahora sube
    }
  }
}

function drawFemaleMonkey() {
  if (!femaleMonkey.abducted) {
    ctx.drawImage(
      femaleMonkeyImage,
      femaleMonkey.x,
      femaleMonkey.y,
      femaleMonkey.width,
      femaleMonkey.height
    );
  }
}

function drawSpaceship() {
  ctx.drawImage(
    spaceshipImage,
    spaceship.x,
    spaceship.y,
    spaceship.width,
    spaceship.height
  );
}

// Sistema de partículas
const particles = [];
function createParticles(x, y, color) {
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: x,
      y: y,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      color: color,
      life: Math.random() * 50 + 50,
    });
  }
}

// Dibujar partículas
function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
// Función para dibujar el rayo de abducción con brillo dinámico
function drawAbductionRay() {
  if (abducting && !femaleMonkey.abducted) {
    ctx.fillStyle = "rgba(0, 191, 255, 0.1)"; // Luz azulada en la pantalla
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    playSound(abductionSound);
    ctx.beginPath();
    const gradient = ctx.createLinearGradient(
      spaceship.x + spaceship.width / 2,
      spaceship.y + spaceship.height,
      femaleMonkey.x + femaleMonkey.width / 2,
      femaleMonkey.y + femaleMonkey.height
    );
    gradient.addColorStop(0, "rgba(173, 216, 230, 0.7)");
    gradient.addColorStop(1, "rgba(0, 191, 255, 0.3)");
    ctx.fillStyle = gradient;
    ctx.moveTo(
      spaceship.x + spaceship.width / 2 - 50,
      spaceship.y + spaceship.height
    );
    ctx.lineTo(
      spaceship.x + spaceship.width / 2 + 50,
      spaceship.y + spaceship.height
    );
    ctx.lineTo(
      femaleMonkey.x + femaleMonkey.width / 2 + 30,
      femaleMonkey.y + femaleMonkey.height
    );
    ctx.lineTo(
      femaleMonkey.x + femaleMonkey.width / 2 - 30,
      femaleMonkey.y + femaleMonkey.height
    );
    ctx.closePath();
    ctx.fill();

    // Crear partículas alrededor del rayo
    createParticles(
      femaleMonkey.x + femaleMonkey.width / 2,
      femaleMonkey.y + femaleMonkey.height,
      "rgba(173, 216, 230, 0.5)"
    );
  }
}
// Función para dibujar la nave con sombra dinámica
function drawSpaceship() {
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 20;
  ctx.drawImage(
    spaceshipImage,
    spaceship.x,
    spaceship.y,
    spaceship.width,
    spaceship.height
  );
  ctx.shadowBlur = 0; // Restablecer la sombra para otros elementos
}

// Función para mostrar diálogo con efecto de escritura
function typeText(element, text, speed = 50, callback) {
  let index = 0;
  element.innerHTML = "";
  const interval = setInterval(() => {
    element.innerHTML += text[index];
    // Reproducir sonido de "Pi Pi Pi" mientras escribe
    if (index % 3 === 0) {
      playSound(textBeep);
    }
    index++;
    if (index === text.length) {
      clearInterval(interval);
      if (callback) callback(); // Ejecuta el callback cuando termine de escribir
    }
  }, speed);
}

// Función para mostrar el mensaje del jefe
function showBossDialogue() {
  bossDialogue.classList.remove("hidden");
  typeText(
    bossDialogue,
    "¡Si quieres volver a verla, deberás acabar con mi flota y traerme muchos muchos plátanos!    ",
    50,
    showStartButton // Llama a la función para mostrar el botón al terminar
  );
}

// Función para mostrar el botón de "Empezar Aventura"
function showStartButton() {
  const startButton = document.createElement("button");
  startButton.innerText = "Empezar Aventura";
  startButton.style.marginTop = "20px";
  startButton.style.padding = "10px 20px";
  startButton.style.fontSize = "15px";
  startButton.style.color = "white";
  startButton.style.backgroundColor = "#28a745";
  startButton.style.border = "none";
  startButton.style.borderRadius = "8px";
  startButton.style.cursor = "pointer";
  startButton.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
  startButton.style.transition = "transform 0.2s";
  startButton.style.fontFamily = "'Press Start 2P', cursive";

  // Efecto de animación al hacer hover
  startButton.addEventListener("mouseover", () => {
    startButton.style.transform = "scale(1.1)";
  });
  startButton.addEventListener("mouseout", () => {
    startButton.style.transform = "scale(1)";
  });

  // Evento para redirigir a game.html
  startButton.addEventListener("click", () => {
    window.location.href = "game.html";
  });

  // Añadir el botón al diálogo del boss
  bossDialogue.appendChild(startButton);
}

// Función para animar la abducción
function animateAbduction() {
  if (abducting && !femaleMonkey.abducted) {
    // Dibujar el rayo de abducción
    drawAbductionRay();
    // Reproducir sonido solo si la abducción está comenzando
    if (abductionProgress === 0) {
      playSound(abductionSound);
    }

    // Incrementar el progreso de la abducción
    abductionProgress += 0.01; // Velocidad de abducción (ajustable)
    if (abductionProgress >= 1) {
      abductionProgress = 1; // Limitar al 100%
      femaleMonkey.abducted = true; // La mona ha sido abducida
      showBossDialogue(); // Mostrar mensaje del jefe // Mostrar el mensaje una vez abducida
    }

    // Animar la mona hacia la nave
    femaleMonkey.y -= 2; // Subir la mona lentamente
    if (femaleMonkey.y < spaceship.y + spaceship.height) {
      femaleMonkey.y = spaceship.y + spaceship.height; // Parar la mona dentro de la nave
    }
  }
}

// Efecto de temblor
function drawShake() {
  if (shakeIntensity > 0) {
    canvas.style.transform = `translate(${
      Math.random() * shakeIntensity - shakeIntensity / 2
    }px, ${Math.random() * shakeIntensity - shakeIntensity / 2}px)`;
    shakeIntensity -= 2; // Reducir el temblor
  } else {
    canvas.style.transform = "translate(0px, 0px)";
  }
}
function flashEffect() {
  if (Math.random() < 0.01) {
    // 1% de probabilidad de un relámpago en cada frame
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 50); // El destello dura solo 50ms
  }
}

// Función principal de animación
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el lienzo

  // Dibujar fondo
  drawBackground();
  drawParticles();

  // Mover el mono hacia el centro desde la izquierda
  if (monkey.x < canvas.width / 2 - monkey.width) {
    monkey.x += monkey.speed;
  }

  // Mover la mona hacia el centro desde la derecha
  if (femaleMonkey.x > canvas.width / 2) {
    femaleMonkey.x -= femaleMonkey.speed;
  }

  // Detectar cuando ambos llegan al centro
  if (
    monkey.x >= canvas.width / 2 - monkey.width &&
    femaleMonkey.x <= canvas.width / 2 &&
    !spaceship.visible
  ) {
    spaceship.visible = true; // Hacer visible la nave
    shakeIntensity = 15; // Iniciar el temblor de pantalla

    isJumping = true; // 🐵 Activar el salto del mono
    createParticles(
      spaceship.x + spaceship.width / 2,
      spaceship.y + spaceship.height,
      "white"
    );
  }

  // Movimiento de la nave
  if (spaceship.visible && spaceship.y < spaceship.targetY) {
    spaceship.y += 0.5; // Movimiento descendente de la nave
    // Solo reproduce el sonido la primera vez
    if (spaceship.y === -100) {
      playSound(spaceshipSound);
    }
    createParticles(
      spaceship.x + spaceship.width / 2,
      spaceship.y + spaceship.height,
      "rgba(202, 84, 21, 0.5)"
    ); // Crear partículas mientras baja
  } else if (spaceship.y >= spaceship.targetY && !abducting) {
    abducting = true; // Inicia la abducción
  }

  // Animar la abducción
  animateAbduction();

  // Dibujar elementos
  drawMonkey();
  drawFemaleMonkey();
  if (spaceship.visible) {
    drawSpaceship();
  }
  jumpMonkey(); // 🐵 Hacer que el mono siga saltando
  flashEffect(); // Activar el efecto de relámpagos aleatorios
  drawShake(); // Aplicar el efecto de temblor

  // Llamar a la siguiente iteración de la animación
  requestAnimationFrame(animate);
}
