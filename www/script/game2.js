// Definir el lienzo y contexto
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajustar el tamaño del canvas dinámicamente
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.7; // Ajuste automático
  canvas.height = window.innerHeight * 0.95; // Ajuste automático
}

// Llamar al inicio y cuando cambie el tamaño
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Cargar imágenes
const monkeyImage = new Image();
monkeyImage.src = "img/gorila.png";

const rightImage = new Image();
rightImage.src = "img/gorila1.png"; // Imagen para derecha

const leftImage = new Image();
leftImage.src = "img/gorila2.png"; // Imagen para izquierda

const bossImage = new Image();
bossImage.src = "img/nave2.png"; // Imagen del jefe

const enemyImage = new Image();
enemyImage.src = "img/bolas.png";

// Música del jefe
const bossMusic = new Audio("audio/level2/boss2.mp3");
// Iniciar música del jefe
bossMusic.loop = true; // Reproducir en bucle
bossMusic.play();
function iniciarMusica() {
  bossMusic.play().catch((e) => {
    console.log("🔇 No se pudo reproducir la música automáticamente:", e);
  });
}
window.addEventListener("click", iniciarMusica, { once: true });
window.addEventListener("keydown", iniciarMusica, { once: true });
window.addEventListener("touchstart", iniciarMusica, { once: true });

// Variables del juego
let boss = null;
let bossHealth = 3500; // Vida inicial del jefe

let gameOver = false;

let score = 0;
let lives = 4;
let monkey = {
  x: 100,
  y: canvas.height - 70,
  width: 60,
  height: 60,
  speed: 5,
  dx: 0,
  dy: 0,
};
const gravity = 0.65;

let projectiles = []; // Disparos del mono
let bossProjectiles = []; // Disparos del jefe
let horizontalMeteorites = [];
const bossShootInterval = esTablet() ? 2500 : 2000;

const horizontalMeteorSpeed = 3;
const galaxyBackground = new Image();
galaxyBackground.src = "img/fondoBoss2.webp";
// Referencias a los elementos del DOM
const pauseButton = document.getElementById("pauseButton");
const pauseModal = document.getElementById("pauseModal");
const resumeButton = document.getElementById("resumeButton");
// Seleccionar el botón de volver al menú
const menuButton = document.getElementById("menuButton");

// Manejar el evento de clic en el botón de volver al menú
menuButton.addEventListener("click", () => {
  window.location.href = "index.html"; // Redirigir al menú principal
});
const keys = {
  left: false,
  right: false,
  up: false,
  shoot: false,
};

let isPaused = false; // Bandera para el estado de pausa
let animationFrameId; // ID del frame de animación actual
// Iniciar el bucle de animación
// Función para reanudar el juego (sin countdown)
function resumeGame() {
  hidePauseModal(); // Ocultar el modal
  isPaused = false; // Salir del estado de pausa
  startGame(); // Reanudar el juego inmediatamente
}

// Mostrar el modal y detener el bucle de animación
function showPauseModal() {
  pauseModal.style.display = "flex"; // Mostrar el modal
  isPaused = true; // Activar el estado de pausa
  cancelAnimationFrame(animationFrameId); // Detener la animación
}

// Ocultar el modal
function hidePauseModal() {
  pauseModal.style.display = "none"; // Ocultar el modal
}

// Manejar el botón de pausa
pauseButton.addEventListener("click", () => {
  if (!isPaused) {
    showPauseModal(); // Pausar el juego y mostrar el modal
  }
});

// Manejar el botón de reanudar
resumeButton.addEventListener("click", () => {
  resumeGame(); // Reanudar el juego inmediatamente
  isPaused = true;
});
// Manejar el clic en el botón de reanudar
resumeButton.addEventListener("click", () => {
  resumeGame(); // Reanudar el juego inmediatamente
  isPaused = false;
});

// Manejar el evento de teclado para la tecla "P"
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p") {
    // Ignora si es mayúscula o minúscula
    if (isPaused) {
      resumeGame(); // Reanudar el juego
      isPaused = false;
    } else {
      showPauseModal(); // Pausar el juego
      isPaused = true;
    }
  }
});

// Iniciar el juego solo después de cargar el fondo
galaxyBackground.onload = () => {
  startGame(); // Iniciar el juego cuando el fondo esté listo
};

// Función para iniciar el juego
function startGame() {
  if (!isPaused && !gameOver) {
    cancelAnimationFrame(animationFrameId); // Cancelar cualquier animación previa
    animationFrameId = requestAnimationFrame(updateGameArea); // Iniciar un nuevo ciclo de animación
  }
}
function esTablet() {
  const width = window.innerWidth;
  return width >= 600 && width <= 1366;
}
let lastFrameTime = 0;
const fps = 60;
// Función principal del juego
function updateGameArea(timestamp) {
  if (isPaused || gameOver) return; // Detener si el juego está en pausa o terminado
  if (timestamp - lastFrameTime < 1000 / fps) {
    animationFrameId = requestAnimationFrame(updateGameArea);
    return;
  }
  lastFrameTime = timestamp;
  // Actualización del juego
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(galaxyBackground, 0, 0, canvas.width, canvas.height);

  if (boss) {
    updateBoss();
    updateBossProjectiles();
    updateHorizontalMeteorites();
    drawBoss();
    drawBossProjectiles();
    drawHorizontalMeteorites();
    checkCollisions();
  }

  moveMonkey();
  updateProjectiles();
  drawMonkey();
  drawProjectiles();

  drawLives();

  // Continuar animación
  animationFrameId = requestAnimationFrame(updateGameArea);
}

// Guardar progreso en localStorage
function desbloquearNivel(nivel) {
  const progresoGuardado = localStorage.getItem("nivelesDesbloqueados");
  let nivelesDesbloqueados = progresoGuardado
    ? JSON.parse(progresoGuardado)
    : [true, false, false];

  if (!nivelesDesbloqueados[nivel]) {
    nivelesDesbloqueados[nivel] = true;
    localStorage.setItem(
      "nivelesDesbloqueados",
      JSON.stringify(nivelesDesbloqueados)
    );
    console.log(`Nivel ${nivel + 1} desbloqueado.`);
  }
}
function startBossTransition() {
  const bossSpeed = esTablet() ? 3 : 1.5;
  boss = {
    x: canvas.width / 2 - 50,
    y: -100,
    width: 80,
    height: 80,
    dx: bossSpeed,
  };

  // Nave comienza fuera del lienzo
  let transitionComplete = false; // Controla si la transición de la nave se ha completado

  function transition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el lienzo
    ctx.drawImage(galaxyBackground, 0, 0, canvas.width, canvas.height); // Dibujar fondo

    // Dibujar nave mientras baja
    if (boss.y < 50) {
      boss.y += 2; // Velocidad de bajada
    } else {
      transitionComplete = true; // Transición completada
    }

    drawBoss(); // Dibujar la nave

    // Continuar la animación hasta que termine la transición
    if (!transitionComplete) {
      requestAnimationFrame(transition);
    } else {
      // Iniciar ataque del jefe inmediatamente
      startBossShooting();
      setInterval(() => {
        if (boss) spawnHorizontalMeteorite();
      }, 3000); // Meteoritos cada 3 segundos
    }
  }

  transition(); // Iniciar la transición
}

// Aparece el jefe
function spawnBoss() {
  const bossSpeed = esTablet() ? 3 : 1.5;
  boss = {
    x: canvas.width / 2 - 50,
    y: -100,
    width: 80,
    height: 80,
    dx: bossSpeed,
  };

  bossProjectiles = [];
  horizontalMeteorites = [];
  startBossShooting();
  setInterval(() => {
    if (boss) spawnHorizontalMeteorite();
  }, 3000); // Cada 3 segundos
}

let bossShield = {
  active: false, // Si el escudo está activo
  health: 300, // Vida inicial del escudo
  maxHealth: 300, // Máxima vida del escudo
  destroyed: false, // Si el escudo ha sido destruido
};
function updateBoss() {
  boss.x += boss.dx;

  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.dx *= -1; // Cambiar dirección
  }

  // Activar el escudo cuando la salud llegue a la mitad, solo si no está destruido
  if (bossHealth <= 1750 && !bossShield.active && !bossShield.destroyed) {
    handleBossInvulnerability(); // Activar el escudo
  }
}

function handleBossInvulnerability() {
  if (bossShield.active || bossShield.destroyed) return; // Evitar activar si ya está activo o destruido

  // Activar el escudo
  bossShield.active = true;
  bossShield.health = bossShield.maxHealth; // Restablecer la vida del escudo
  console.log("Escudo activado para el jefe"); // Debugging

  // Generar meteoritos mientras el escudo está activo
  meteorInterval = setInterval(() => {
    spawnHorizontalMeteorite();
  }, 2500);

  // Desactivar el escudo después de 5 segundos, solo si no ha sido destruido
  setTimeout(() => {
    if (!bossShield.destroyed) {
      bossShield.active = false; // Desactivar escudo
      console.log("Escudo desactivado automáticamente");
    }
    clearInterval(meteorInterval); // Detener meteoritos
  }, 5000);
}

function drawBoss() {
  if (!boss) return;

  // Dibujar el escudo si está activo
  if (bossShield.active) {
    ctx.beginPath();
    ctx.arc(
      boss.x + boss.width / 2, // Centro del jefe
      boss.y + boss.height / 2,
      boss.width, // Radio del escudo
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  // Dibujar al jefe
  ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);

  // Dibujar barra de vida del jefe
  ctx.fillStyle = "red";
  ctx.fillRect(boss.x, boss.y - 10, boss.width, 5);
  ctx.fillStyle = "green";
  ctx.fillRect(boss.x, boss.y - 10, (bossHealth / 3500) * boss.width, 5);

  // Dibujar barra de vida del escudo si está activo
  if (bossShield.active) {
    ctx.fillStyle = "blue";
    ctx.fillRect(
      boss.x,
      boss.y - 20,
      (bossShield.health / bossShield.maxHealth) * boss.width,
      5
    );
  }
}

let bossShootPatternCounter = 0; // Contador para alternar patrones de disparo
let bossShootingInterval;

function startBossShooting() {
  // Asegurarnos de detener cualquier intervalo previo antes de iniciar uno nuevo
  clearInterval(bossShootingInterval);

  // Configurar un nuevo intervalo de disparos
  bossShootingInterval = setInterval(() => {
    if (boss) {
      // El jefe dispara independientemente del estado del escudo
      if (bossShootPatternCounter < 2) {
        shootPatternZ(); // Patrón en Z
      } else {
        shootPatternOne(); // Patrón invertido
      }

      bossShootPatternCounter = (bossShootPatternCounter + 1) % 3; // Alternar patrones
    }
  }, bossShootInterval);
}

function shootPatternZ() {
  const startX = boss.x + boss.width / 2 - 5;
  const startY = boss.y + boss.height;
  const offset = 30; // Desplazamiento para patrón en Z
  for (let i = -2; i <= 2; i++) {
    bossProjectiles.push({
      x: startX + i * offset,
      y: startY,
      width: 8,
      height: 16,
      speed: esTablet() ? 3.5 : 2,
    });
  }
}

function shootPatternOne() {
  const startX = boss.x + boss.width / 2 - 5;
  const startY = boss.y + boss.height;
  const offset = 6; // Los misiles comienzan juntos

  for (let i = -5; i <= 4; i++) {
    bossProjectiles.push({
      x: startX, // Todos los misiles empiezan desde el mismo punto
      y: startY,
      width: 8,
      height: 12,
      speed: esTablet() ? 3.5 : 2,

      dx: i * 0.2, // Velocidad horizontal aumenta a medida que se separan
    });
  }
}

function updateBossProjectiles() {
  bossProjectiles.forEach((projectile, index) => {
    projectile.y += projectile.speed; // Movimiento vertical
    projectile.x += projectile.dx || 0; // Movimiento horizontal, si tiene dx definido

    // Eliminar proyectiles que salgan de la pantalla
    if (
      projectile.y > canvas.height ||
      projectile.x < -50 ||
      projectile.x > canvas.width + 50
    ) {
      bossProjectiles.splice(index, 1);
    }
  });
}

function drawBossProjectiles() {
  bossProjectiles.forEach((projectile) => {
    ctx.fillStyle = "yellow";
    ctx.fillRect(
      projectile.x,
      projectile.y,
      projectile.width,
      projectile.height
    );
  });
}

// Meteoritos horizontales
function spawnHorizontalMeteorite() {
  const y = Math.random() * (canvas.height / 2 - 40) + canvas.height / 2;
  // Generar en la mitad inferior pero sin que salgan del lienzo
  const direction = Math.random() < 0.5 ? 1 : -1; // Determina la dirección (izquierda o derecha)
  const x = direction === 1 ? -40 : canvas.width + 40; // Posición inicial fuera del lienzo
  horizontalMeteorites.push({
    x,
    y,
    width: 22,
    height: 22,
    speed: horizontalMeteorSpeed * direction, // Velocidad horizontal en la dirección elegida
  });
}

function updateHorizontalMeteorites() {
  horizontalMeteorites.forEach((meteor, index) => {
    meteor.x += meteor.speed;
    if (meteor.x < -50 || meteor.x > canvas.width + 50) {
      horizontalMeteorites.splice(index, 1);
    }
  });
}

function drawHorizontalMeteorites() {
  horizontalMeteorites.forEach((meteor) => {
    ctx.drawImage(enemyImage, meteor.x, meteor.y, meteor.width, meteor.height);
  });
}

// Disparos del mono
function shootProjectile() {
  const x = monkey.x + monkey.width / 2 - 5;
  const y = monkey.y;
  projectiles.push({ x, y, width: 10, height: 20, speed: -7 });
}

function updateProjectiles() {
  projectiles.forEach((projectile, index) => {
    projectile.y += projectile.speed;
    if (projectile.y < 0) {
      projectiles.splice(index, 1);
    }
  });
}

function drawProjectiles() {
  projectiles.forEach((projectile) => {
    ctx.fillStyle = "red";
    ctx.fillRect(
      projectile.x,
      projectile.y,
      projectile.width,
      projectile.height
    );
  });
}

function checkCollisions() {
  // Colisión de los proyectiles del mono con el jefe o su escudo
  projectiles.forEach((projectile, index) => {
    if (bossShield.active) {
      if (
        projectile.x < boss.x + boss.width &&
        projectile.x + projectile.width > boss.x &&
        projectile.y < boss.y + boss.height &&
        projectile.y + projectile.height > boss.y
      ) {
        bossShield.health -= 20;
        projectiles.splice(index, 1);

        if (bossShield.health <= 0) {
          bossShield.active = false;
          bossShield.destroyed = true;
          console.log("Escudo destruido");
        }
      }
    } else {
      if (
        projectile.x < boss.x + boss.width &&
        projectile.x + projectile.width > boss.x &&
        projectile.y < boss.y + boss.height &&
        projectile.y + projectile.height > boss.y
      ) {
        bossHealth -= 10;
        projectiles.splice(index, 1);

        if (bossHealth <= 0) {
          bossHealth = 0;
          showVictory();
          desbloquearNivel(2);
        }
      }
    }
  });

  // Colisión de los disparos del jefe y los meteoritos con el mono
  bossProjectiles.forEach((projectile, index) => {
    if (
      projectile.x < monkey.x + monkey.width &&
      projectile.x + projectile.width > monkey.x &&
      projectile.y < monkey.y + monkey.height &&
      projectile.y + projectile.height > monkey.y
    ) {
      loseLife();
      bossProjectiles.splice(index, 1); // Eliminar proyectil al impactar
    }
  });

  // Colisión de los **meteoritos horizontales** con el mono
  horizontalMeteorites.forEach((meteor, index) => {
    if (
      meteor.x < monkey.x + monkey.width &&
      meteor.x + meteor.width > monkey.x &&
      meteor.y < monkey.y + monkey.height &&
      meteor.y + meteor.height > monkey.y
    ) {
      loseLife();
      horizontalMeteorites.splice(index, 1); // Eliminar meteorito tras colisión
    }
  });
}

function loseLife() {
  lives--;
  if (lives <= 0) {
    endGame("");
  } else {
    animateMonkeyBlink(); // Animación de parpadeo del mono
  }
}

function animateMonkeyBlink() {
  let blinkCount = 0; // Contador de parpadeos
  const blinkInterval = setInterval(() => {
    blinkCount++;
    if (blinkCount % 2 === 0) {
      monkeyImage.src = "img/gorila.png"; // Imagen normal
    } else {
      monkeyImage.src = ""; // "Ocultar" al mono (imagen vacía)
    }
    if (blinkCount >= 6) {
      clearInterval(blinkInterval); // Finalizar parpadeo después de 6 iteraciones
      monkeyImage.src = "img/gorila.png"; // Restaurar imagen normal
    }
  }, 200); // Alternar cada 200 ms
}

// Imagen del mono según la dirección
function updateMonkeyImage() {
  if (monkey.dx > 0) {
    monkeyImage.src = "img/gorila1.png"; // Imagen para moverse a la derecha
  } else if (monkey.dx < 0) {
    monkeyImage.src = "img/gorila2.png"; // Imagen para moverse a la izquierda
  } else {
    monkeyImage.src = "img/gorila.png"; // Imagen estática
  }
}

// Doble salto
let jumpCount = 0; // Contador de saltos
// Variable para controlar la barra espaciadora

let spacePressed = false;
// Controlar teclas
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase(); // Convertir la tecla a minúscula
  if (key === "d") {
    monkey.dx = monkey.speed; // Mover a la derecha
    updateMonkeyImage(); // Cambiar imagen
  }
  if (key === "a") {
    monkey.dx = -monkey.speed; // Mover a la izquierda
    updateMonkeyImage(); // Cambiar imagen
  }
  if (key === "w" && jumpCount < 2) {
    // Permitir doble salto
    monkey.dy = -12; // Velocidad de salto
    monkey.jumping = true;
    jumpCount++; // Incrementar el contador de saltos
  }
  if (key === " " && !spacePressed) {
    // Solo dispara si spacePressed es false
    if (Date.now() - lastShootTime > shootCooldown) {
      shootProjectile();
      lastShootTime = Date.now();
    }

    spacePressed = true; // Establecer spacePressed como true para evitar disparos continuos
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase(); // Convertir la tecla a minúscula
  if (key === "d" || key === "a") {
    monkey.dx = 0; // Detener movimiento horizontal
    updateMonkeyImage(); // Cambiar a imagen estática
  }
  if (key === " ") {
    spacePressed = false; // Restablecer spacePressed a false cuando se suelta la barra espaciadora
  }
});

// Aplicar la gravedad y resetear los saltos
function moveMonkey() {
  // Controles móviles
  if (keys.left) {
    monkey.dx = -monkey.speed;
    updateMonkeyImage();
  } else if (keys.right) {
    monkey.dx = monkey.speed;
    updateMonkeyImage();
  } else {
    monkey.dx = 0;
    updateMonkeyImage();
  }

  // Salto táctil
  if (keys.up && jumpCount < 2) {
    monkey.dy = -12;
    monkey.jumping = true;
    jumpCount++;
    keys.up = false; // Saltar una vez por toque
  }

  // Movimiento real
  monkey.x += monkey.dx;
  monkey.y += monkey.dy;

  if (monkey.y + monkey.height < canvas.height) {
    monkey.dy += gravity;
  } else {
    monkey.y = canvas.height - monkey.height;
    monkey.dy = 0;
    monkey.jumping = false;
    jumpCount = 0;
  }

  if (monkey.x < 0) monkey.x = 0;
  if (monkey.x + monkey.width > canvas.width)
    monkey.x = canvas.width - monkey.width;
}

function drawMonkey() {
  ctx.drawImage(monkeyImage, monkey.x, monkey.y, monkey.width, monkey.height);
}

// Terminar el juego
function endGame(message) {
  gameOver = true;
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(message, canvas.width / 2 - 150, canvas.height / 2);
  showGameOverModal();
}

function showGameOverModal() {
  // Pausar el juego completamente
  gameOver = true;
  bossMusic.pause(); // Pausar música del jefe

  cancelAnimationFrame(animationFrameId); // Detiene la animación

  // Crear capa de fondo con la imagen
  const backgroundLayer = document.createElement("div");
  backgroundLayer.style.position = "fixed";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.width = "100%";
  backgroundLayer.style.height = "100%";
  backgroundLayer.style.backgroundImage = "url('img/hasperdido.png')"; // Cambia la ruta por la de tu imagen
  backgroundLayer.style.backgroundSize = "cover"; // Asegura que la imagen cubra toda la pantalla
  backgroundLayer.style.backgroundPosition = "center"; // Centra la imagen
  backgroundLayer.style.zIndex = "5000"; // Asegura que esté por encima de todo

  // Crear modal
  const modal = document.createElement("div");
  modal.style.position = "absolute";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.padding = "40px";
  modal.style.textAlign = "center";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Fondo oscuro para contraste
  modal.style.borderRadius = "15px";
  modal.style.boxShadow = "0px 0px 15px rgba(255, 0, 0, 0.9)";
  modal.style.color = "white";
  modal.style.fontFamily = "Arial, sans-serif";
  modal.style.zIndex = "6000"; // Más alto que el fondo para asegurarse de que se vea

  // Título del modal
  const title = document.createElement("h2");
  title.innerText = "💀 GAME OVER 💀";
  title.style.color = "#ff0000";
  title.style.fontSize = "28px";
  title.style.marginBottom = "20px";
  title.style.textShadow = "2px 2px 10px black"; // Efecto de sombra

  // Contenedor de botones
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "15px"; // Espaciado entre botones

  // Botón de volver a jugar
  const playAgainButton = document.createElement("button");
  playAgainButton.innerText = "🔄 Reintentar";
  playAgainButton.style.padding = "12px 25px";
  playAgainButton.style.backgroundColor = "#28a745";
  playAgainButton.style.border = "none";
  playAgainButton.style.borderRadius = "8px";
  playAgainButton.style.color = "white";
  playAgainButton.style.fontSize = "18px";
  playAgainButton.style.cursor = "pointer";
  playAgainButton.style.transition = "0.3s";
  playAgainButton.onmouseover = () =>
    (playAgainButton.style.backgroundColor = "#218838");
  playAgainButton.onmouseleave = () =>
    (playAgainButton.style.backgroundColor = "#28a745");
  playAgainButton.onclick = () => {
    location.reload();
  };

  // Botón de volver al menú
  const menuButton = document.createElement("button");
  menuButton.innerText = "🏠 Menú Principal";
  menuButton.style.padding = "12px 25px";
  menuButton.style.backgroundColor = "#007bff";
  menuButton.style.border = "none";
  menuButton.style.borderRadius = "8px";
  menuButton.style.color = "white";
  menuButton.style.fontSize = "18px";
  menuButton.style.cursor = "pointer";
  menuButton.style.transition = "0.3s";
  menuButton.onmouseover = () => (menuButton.style.backgroundColor = "#0056b3");
  menuButton.onmouseleave = () =>
    (menuButton.style.backgroundColor = "#007bff");
  menuButton.onclick = () => (window.location.href = "index.html"); // Volver al menú

  // Agregar botones al contenedor
  buttonContainer.appendChild(playAgainButton);
  buttonContainer.appendChild(menuButton);

  // Añadir los elementos al modal
  // Añadir los elementos al modal
  modal.appendChild(title);

  // Espaciado adicional entre título y botones
  const spacer = document.createElement("div");
  spacer.style.height = "20px";
  modal.appendChild(spacer);

  buttonContainer.appendChild(playAgainButton);
  buttonContainer.appendChild(menuButton);

  modal.appendChild(buttonContainer);

  // Añadir la capa de fondo y el modal al body
  document.body.appendChild(backgroundLayer);
  document.body.appendChild(modal);
}
// Dibujar marcador y vidas
function drawLives() {
  ctx.fillStyle = "white"; // Color del texto
  ctx.font = "bold 20px Arial"; // Aplicar negrita
  ctx.shadowColor = "black"; // Color del sombreado
  ctx.shadowBlur = 5; // Desenfoque del sombreado
  ctx.shadowOffsetX = 2; // Desplazamiento horizontal del sombreado
  ctx.shadowOffsetY = 2; // Desplazamiento vertical del sombreado
  ctx.fillText("Vidas: " + lives, canvas.width - 100, 30); // Dibuja el texto
}
const victoryMusic = new Audio("../audio/victory.mp3");
victoryMusic.volume = 0.5;
function showVictory() {
  console.log("Ejecutando showVictory()");
  gameOver = true;

  bossMusic.pause();

  // Verifica si estás en el entorno Android con puente nativo
  if (window.Android && typeof Android.showInterstitial === "function") {
    Android.showInterstitial();
    setTimeout(() => {
      renderVictoryModal(); // Espera breve para que el anuncio se muestre primero
    }, 100); // Puedes ajustar este tiempo si el anuncio es muy lento
  } else {
    renderVictoryModal(); // Si no hay Android, simplemente mostrar el modal
  }
}
function renderVictoryModal() {
  victoryMusic.play();

  const backgroundLayer = document.createElement("div");
  backgroundLayer.style.position = "fixed";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.width = "100%";
  backgroundLayer.style.height = "100%";
  backgroundLayer.style.backgroundImage = "url('img/victoria.webp')";
  backgroundLayer.style.backgroundSize = "cover";
  backgroundLayer.style.backgroundPosition = "center";
  backgroundLayer.style.animation = "fadeIn 1s ease-in-out";
  backgroundLayer.style.zIndex = "5000";
  document.body.appendChild(backgroundLayer);

  const modal = document.createElement("div");
  modal.style.position = "absolute";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.padding = "35px";
  modal.style.textAlign = "center";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
  modal.style.borderRadius = "12px";
  modal.style.boxShadow = "0px 0px 25px rgba(255, 215, 0, 0.9)";
  modal.style.color = "white";
  modal.style.fontFamily = "Arial, sans-serif";
  modal.style.animation = "zoomIn 0.8s ease-in-out";
  modal.style.zIndex = "6000";
  document.body.appendChild(modal);

  const titleElement = document.createElement("h2");
  titleElement.innerText = "🏆 ¡VICTORIA! 🏆";
  titleElement.style.color = "#ffd700";
  titleElement.style.fontSize = "30px";
  titleElement.style.marginBottom = "15px";
  titleElement.style.textShadow = "2px 2px 10px #ffcc00";
  modal.appendChild(titleElement);

  const messageElement = document.createElement("p");
  messageElement.innerText = "Has derrotado al boss. ¡Nivel desbloqueado!";
  messageElement.style.fontSize = "22px";
  messageElement.style.marginBottom = "15px";
  modal.appendChild(messageElement);

  const armorMessage = document.createElement("p");
  armorMessage.innerText = "🛡️ Es hora de ponerse una armadura, creo yo... ⚔️";
  armorMessage.style.fontSize = "20px";
  armorMessage.style.fontStyle = "italic";
  armorMessage.style.color = "#ffdd57";
  armorMessage.style.marginBottom = "20px";
  modal.appendChild(armorMessage);

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "15px";

  const menuButton = document.createElement("button");
  menuButton.innerText = "🏠 Continuar al Menú";
  menuButton.style.padding = "12px 30px";
  menuButton.style.backgroundColor = "#007bff";
  menuButton.style.border = "none";
  menuButton.style.borderRadius = "8px";
  menuButton.style.color = "white";
  menuButton.style.fontSize = "18px";
  menuButton.style.cursor = "pointer";
  menuButton.style.transition = "0.3s";
  menuButton.onmouseover = () => (menuButton.style.backgroundColor = "#0056b3");
  menuButton.onmouseleave = () =>
    (menuButton.style.backgroundColor = "#007bff");
  menuButton.onclick = () => {
    victoryMusic.pause();
    victoryMusic.currentTime = 0;
    window.location.href = "index.html";
  };

  buttonContainer.appendChild(menuButton);
  modal.appendChild(buttonContainer);

  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes zoomIn {
      from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
      to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// Iniciar el juego
startBossTransition();
// Esperar 4 segundos antes de comenzar la animación del juego
