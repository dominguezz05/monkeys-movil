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
bossImage.src = "img/navee.png"; // Imagen del jefe

const enemyImage = new Image();
enemyImage.src = "img/bolas.png";

// Cargar la imagen del láser
const laserImage = new Image();
laserImage.src = "img/laser.png"; // Ruta de la imagen del láser

const energyBallImage = new Image();
energyBallImage.src = "img/energyBallBlue.png"; // Cambia la ruta según tu archivo

const missileImage = new Image();
missileImage.src = "img/laser.png"; // Reemplaza con la ruta de la imagen

// Música del jefe
const bossMusic = new Audio("audio/level4/boss3.mp3");
// Iniciar música del jefe
bossMusic.loop = true; // Reproducir en bucle

// Variables del juego
let boss = null;
let bossHealth = 2500; // Vida inicial del jefe

const keys = {
  left: false,
  right: false,
  up: false,
  shoot: false,
};

let gameOver = false;

let score = 0;
let lives = 4;
let monkey = {
  x: 100,
  y: canvas.height - 50, // ligeramente más arriba si lo haces más pequeño
  width: 50, // antes era 75
  height: 50,
  speed: 5,
  dx: 0,
  dy: 0,
};

const gravity = 0.65;
// Láser del jefe
let bossLaser = {
  x: 0,
  y: 0,
  width: 50, // Ancho del láser cuando está completamente cargado
  height: canvas.height,
  active: false,
  charging: false,
};

let projectiles = []; // Disparos del mono
let bossProjectiles = []; // Disparos del jefe
let horizontalMeteorites = [];
const bossShootInterval = esTablet() ? 3000 : 4500;

const horizontalMeteorSpeed = 4;
const galaxyBackground = new Image();
galaxyBackground.src = "img/fondoBoos.webp";

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
  bossMusic.play();
};

// Función para iniciar el juego
function startGame() {
  if (!isPaused && !gameOver) {
    cancelAnimationFrame(animationFrameId); // Cancelar cualquier animación previa
    animationFrameId = requestAnimationFrame(updateGameArea); // Iniciar un nuevo ciclo de animación
  }
} // Función para actualizar el área del juego
function updateGameArea() {
  if (isPaused || gameOver) return; // Detener si el juego está en pausa o terminado

  // Limpiar y dibujar el fondo
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(galaxyBackground, 0, 0, canvas.width, canvas.height);

  if (gameState.transitioning || gameState.showingBubble) {
    drawBoss();
  } else if (gameState.inLevel) {
    moveMonkey();
    updateProjectiles();
    drawMonkey();
    drawProjectiles();

    if (boss) {
      drawBossLaser(); // Dibujar el láser
      updateBoss();
      drawBoss();
      updateBossLaser(); // Actualizar el láser

      checkLaserCollision(); // Verificar colisiones con el láser
      updateBossProjectiles();
      drawBossProjectiles();
      updateHorizontalMeteorites();
      drawHorizontalMeteorites();
    }

    checkCollisions();

    drawLives();
  }

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
} // Estados del juego
const gameState = {
  transitioning: false, // Transición del jefe en curso
  showingBubble: false, // Bocadillo mostrado
  inLevel: false, // Nivel en progreso
};

function startLevel() {
  gameState.inLevel = true; // Nivel en progreso
  startBossShooting(); // Comenzar disparos del jefe
  setInterval(() => {
    if (boss) spawnHorizontalMeteorite(); // Meteoritos periódicos
  }, 4000);
}
function startBossTransition() {
  const bossSpeed = esTablet() ? 2.5 : 1.5;
  boss = {
    x: canvas.width / 2 - 50,
    y: -100,
    width: 70,
    height: 70,
    dx: bossSpeed,
  };

  gameState.transitioning = true;

  function transition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(galaxyBackground, 0, 0, canvas.width, canvas.height);

    if (boss.y < 50) {
      boss.y += 2; // Velocidad de bajada
    } else {
      gameState.transitioning = false;
      startLevel(); // Inicia el nivel directamente después de la transición
      return;
    }

    drawBoss();
    requestAnimationFrame(transition);
  }

  transition();
}

// Aparece el jefe
function spawnBoss() {
  const bossSpeed = esTablet() ? 2.5 : 1.3;
  boss = {
    x: canvas.width / 2 - 50,
    y: 10,
    width: 70,
    height: 70,
    dx: bossSpeed,
  };

  bossProjectiles = [];
  horizontalMeteorites = [];
  startBossShooting();
  setInterval(() => {
    if (boss) spawnHorizontalMeteorite();
  }, 5000); // Cada 5 segundos
}

// Actualizar y dibujar el jefe
function updateBoss() {
  boss.x += boss.dx;

  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.dx *= -1; // Cambiar dirección
  }
}

function drawBoss() {
  if (!boss) return;
  ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);

  // Dibujar barra de vida del jefe
  ctx.fillStyle = "red";
  ctx.fillRect(boss.x, boss.y - 10, boss.width, 4);
  ctx.fillStyle = "green";
  ctx.fillRect(boss.x, boss.y - 10, (bossHealth / 2500) * boss.width, 4);
}

let bossShootPatternCounter = 0; // Contador para alternar patrones de disparo

function startBossShooting() {
  setInterval(() => {
    if (boss) {
      if (bossShootPatternCounter < 2) {
        // Patrón de 5 misiles (patrón en linea recta)
        shootPatternZ();
      } else {
        // Patrón de 10 misiles (patrón en "u")
        shootPatternOne();
      }

      // Incrementar el contador de patrones y reiniciarlo al llegar a 3
      bossShootPatternCounter = (bossShootPatternCounter + 1) % 3;
    }
  }, bossShootInterval);
}

function shootPatternZ() {
  const startX = boss.x + boss.width / 2; // Centro del jefe
  const startY = boss.y + boss.height; // Debajo del jefe
  const offset = 50; // Separación entre las bolas de energía

  for (let i = -1; i <= 1; i++) {
    // Cambiado de -2 a 2 a -1 a 1 para solo 3 disparos
    bossProjectiles.push({
      x: startX + i * offset, // Posición horizontal con separación
      y: startY,
      dx: 0, // Movimiento horizontal
      dy: esTablet() ? 4.2 : 3,

      width: 20, // Tamaño del proyectil
      height: 20,
      type: "energyBall", // Tipo para identificar que es una bola de energía
    });
  }
}

function shootPatternOne() {
  const startX = boss.x + boss.width / 2 - 5; // Centro del jefe
  const startY = boss.y + boss.height;
  const spreadFactor = 0.5; // Velocidad de separación horizontal

  for (let i = -5; i <= 4; i++) {
    bossProjectiles.push({
      x: startX, // Todos los proyectiles empiezan desde la misma posición X
      y: startY,
      dx: i * spreadFactor, // Separación progresiva horizontal
      dy: esTablet() ? 3.5 : 2.5,

      width: 5,
      height: 10,
      type: "missile", // Identificador de tipo de proyectil (opcional)
    });
  }
}

function updateBossProjectiles() {
  bossProjectiles.forEach((projectile, index) => {
    projectile.x += projectile.dx;
    projectile.y += projectile.dy;

    if (
      projectile.y > canvas.height ||
      projectile.x < -50 ||
      projectile.x > canvas.width + 50
    ) {
      bossProjectiles.splice(index, 1); // Elimina los proyectiles fuera de la pantalla
    }
  });
}
function drawBossProjectiles() {
  bossProjectiles.forEach((projectile) => {
    if (projectile.type === "energyBall") {
      ctx.drawImage(
        energyBallImage, // Imagen de la bola de energía azul
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
      );
    } else {
      ctx.drawImage(
        missileImage, // Imagen del misil (reemplaza la ruta con la correspondiente)
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
      );
    }
  });
}

// Meteoritos horizontales
function spawnHorizontalMeteorite() {
  const y = Math.random() * (canvas.height / 2) + canvas.height / 2; // Solo en la parte inferior del lienzo
  const direction = Math.random() < 0.5 ? 1 : -1;
  const x = direction === 1 ? -40 : canvas.width + 40;
  horizontalMeteorites.push({
    x,
    y,
    width: 30, // antes 40
    height: 30,
    speed: horizontalMeteorSpeed * direction,
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
function esTablet() {
  const width = window.innerWidth;
  return width >= 768 && width <= 1024;
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
  projectiles.push({ x, y, width: 6, height: 15, speed: -7 });
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
  // Verificar colisión de proyectiles del mono con el jefe
  projectiles.forEach((projectile, index) => {
    if (
      projectile.x + projectile.width > boss.x &&
      projectile.x < boss.x + boss.width &&
      projectile.y + projectile.height > boss.y &&
      projectile.y < boss.y + boss.height
    ) {
      bossHealth -= 10;
      projectiles.splice(index, 1);
      if (bossHealth <= 0) {
        bossHealth = 0;
        showVictory();
        desbloquearNivel(4);
      }
    }
  });

  // Verificar colisión de misiles y bolas de energía con el mono
  bossProjectiles.forEach((projectile, index) => {
    const padding = projectile.type === "energyBall" ? 10 : 6; // hitbox más pequeña según tipo

    if (
      monkey.x + monkey.width - padding > projectile.x &&
      monkey.x + padding < projectile.x + projectile.width &&
      monkey.y + monkey.height - padding > projectile.y &&
      monkey.y + padding < projectile.y + projectile.height
    ) {
      loseLife();
      bossProjectiles.splice(index, 1);
    }
  });

  horizontalMeteorites.forEach((meteor, index) => {
    if (
      monkey.x + monkey.width > meteor.x + 5 &&
      monkey.x < meteor.x + meteor.width - 5 &&
      monkey.y + monkey.height > meteor.y + 5 &&
      monkey.y < meteor.y + meteor.height - 5
    ) {
      loseLife();
      horizontalMeteorites.splice(index, 1);
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
    shootProjectile(); // Disparar al presionar la barra espaciadora
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

/// Función para actualizar el estado del láser del jefe
function updateBossLaser() {
  if (!bossLaser.charging && !bossLaser.active) {
    bossLaser.charging = true;
    let chargeWidth = 3; // comienza más delgado
    bossLaser.width = chargeWidth;

    const chargeInterval = setInterval(() => {
      chargeWidth += 3;
      bossLaser.width = chargeWidth;
      if (chargeWidth >= 30) {
        // láser más fino (antes 50)
        clearInterval(chargeInterval);
        bossLaser.charging = false;
        bossLaser.active = true;

        setTimeout(() => {
          bossLaser.active = false;
          bossLaser.width = 3; // restablecer a lo mínimo
        }, 700); // duración activa más corta (antes 1500)
      }
    }, 200); // tiempo de carga más lenta (antes 300)
  }
}

// Dibujar el láser del jefe usando una imagen
function drawBossLaser() {
  if (bossLaser.charging) {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      laserImage,
      boss.x + boss.width / 2 - bossLaser.width / 2,
      boss.y + boss.height - 10,
      bossLaser.width,
      30
    );
    ctx.globalAlpha = 1;
  }

  if (bossLaser.active) {
    ctx.drawImage(
      laserImage,
      boss.x + boss.width / 2 - bossLaser.width / 2,
      boss.y + boss.height - 10,
      bossLaser.width,
      canvas.height - (boss.y + boss.height - 10)
    );
  }
}

// Verificar colisiones del láser con el jugador
function checkLaserCollision() {
  if (
    bossLaser.active &&
    monkey.x + monkey.width - 10 >
      boss.x + boss.width / 2 - bossLaser.width / 2 && // Reducción del margen de colisión
    monkey.x + 10 < boss.x + boss.width / 2 + bossLaser.width / 2 // Reducción del margen de colisión
  ) {
    loseLife(); // Perder vida si el mono está en el área del láser
  }
}
function shootSpiral() {
  const centerX = boss.x + boss.width / 2;
  const centerY = boss.y + boss.height;
  const numProjectiles = 12;

  for (let i = 0; i < numProjectiles; i++) {
    const angle = (i * Math.PI * 2) / numProjectiles;
    bossProjectiles.push({
      x: centerX,
      y: centerY,
      dx: Math.cos(angle) * 3,
      dy: Math.sin(angle) * 3,
      width: 5,
      height: 5,
    });
  }
}

function updateSpiralProjectiles() {
  bossProjectiles.forEach((projectile, index) => {
    projectile.x += projectile.dx;
    projectile.y += projectile.dy;

    // Eliminar proyectiles que salen del lienzo
    if (
      projectile.x < -50 ||
      projectile.x > canvas.width + 50 ||
      projectile.y > canvas.height + 50
    ) {
      bossProjectiles.splice(index, 1);
    }
  });
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

  // Contenedor de botones con mejor espaciado

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
  console.log("Ejecutando showVictory()"); // Depuración
  gameOver = true;

  // Pausar la música del jefe
  bossMusic.pause();
  victoryMusic.play();
  // Crear capa de fondo con imagen de victoria retro
  const backgroundLayer = document.createElement("div");
  backgroundLayer.style.position = "fixed";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.width = "100%";
  backgroundLayer.style.height = "100%";
  backgroundLayer.style.backgroundImage = "url('img/victoria.webp')"; // Imagen de victoria retro
  backgroundLayer.style.backgroundSize = "cover";
  backgroundLayer.style.backgroundPosition = "center";
  backgroundLayer.style.animation = "fadeIn 1s ease-in-out";
  backgroundLayer.style.zIndex = "5000"; // Para estar sobre el canvas
  document.body.appendChild(backgroundLayer);

  // Crear el modal
  const modal = document.createElement("div");
  modal.style.position = "absolute";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.padding = "35px";
  modal.style.textAlign = "center";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
  modal.style.borderRadius = "12px";
  modal.style.boxShadow = "0px 0px 25px rgba(255, 215, 0, 0.9)"; // Brillo dorado
  modal.style.color = "white";
  modal.style.fontFamily = "Arial, sans-serif";
  modal.style.animation = "zoomIn 0.8s ease-in-out";
  modal.style.zIndex = "6000"; // Más alto que el fondo
  document.body.appendChild(modal);

  // Título con efecto de sombra dorada
  const titleElement = document.createElement("h2");
  titleElement.innerText = "🏆 ¡VICTORIA! 🏆";
  titleElement.style.color = "#ffd700";
  titleElement.style.fontSize = "30px";
  titleElement.style.marginBottom = "15px";
  titleElement.style.textShadow = "2px 2px 10px #ffcc00";
  modal.appendChild(titleElement);

  // Mensaje de victoria
  const messageElement = document.createElement("p");
  messageElement.innerText = "🎉 Has derrotado al boss. ¡Nivel desbloqueado!";
  messageElement.style.fontSize = "22px";
  messageElement.style.marginBottom = "15px";
  modal.appendChild(messageElement);

  // Mensaje adicional motivador
  const extraMessage = document.createElement("p");
  extraMessage.innerText = "🔥 La gloria es tuya, sigue luchando. 🔥";
  extraMessage.style.fontSize = "20px";
  extraMessage.style.fontStyle = "italic";
  extraMessage.style.color = "#ffdd57";
  extraMessage.style.marginBottom = "20px";
  modal.appendChild(extraMessage);

  // Contenedor de botones
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "15px";

  // Botón para continuar al menú
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

  // Añadir botones al modal
  modal.appendChild(buttonContainer);

  // Animaciones CSS para una mejor presentación
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
updateGameArea();
