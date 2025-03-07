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
bossImage.src = "img/nave7.png"; // Imagen del jefe

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
const bossMusic = new Audio("audio/level7/level7.mp3");
// Iniciar música del jefe
bossMusic.loop = true; // Reproducir en bucle
bossMusic.play();

// Variables del juego
let boss = null;
let bossHealth = 2500; // Vida inicial del jefe

let gameOver = false;

let score = 0;
let lives = 7;
let monkey = {
  x: 100,
  y: canvas.height - 70,
  width: 75,
  height: 75,
  speed: 5,
  dx: 0,
  dy: 0,
};
const gravity = 0.5;
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
const bossShootInterval = 2000;
const horizontalMeteorSpeed = 4;
const galaxyBackground = new Image();
galaxyBackground.src = "img/level7.webp";

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

      // Verificar la vida del jefe para activar los meteoritos diagonales
      checkBossHealth();
    }

    checkCollisions();

    drawLives();
    drawSlowMotionTimer(); // Dibujar el temporizador de manipulación del tiempo
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
  boss = {
    x: canvas.width / 2 - 50,
    y: canvas.height + 100,
    width: 100,
    height: 100,
    dx: 3,
  };
  gameState.transitioning = true;

  function transition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(galaxyBackground, 0, 0, canvas.width, canvas.height);

    if (boss.y > 50) {
      boss.y -= 2; // Movimiento hacia arriba
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

// Bloques que aparecen cada 20 segundos
setInterval(() => {
  horizontalMeteorites.push({
    x: canvas.width,
    y: canvas.height - 40,
    width: 50,
    height: 40,
    speedX: -4,
    speedY: 0,
  });
}, 20000);

// Variables para la manipulación del tiempo
let slowMotionTimer = 15; // Tiempo hasta la siguiente ralentización
let slowMotionActive = false;
let slowMotionDuration = 5; // Tiempo que dura la ralentización
let originalSpeed = monkey.speed; // Velocidad original del jugador
let slowMotionRemaining = 0; // Tiempo restante cuando el tiempo está ralentizado

// Función para activar la ralentización del tiempo
function activateSlowMotion() {
  if (!slowMotionActive) {
    slowMotionActive = true;
    slowMotionRemaining = slowMotionDuration; // Inicializar contador de ralentización
    monkey.speed = originalSpeed / 2; // Reducir la velocidad del jugador
    slowMotionTimer = 15; // Reiniciar contador de la siguiente ralentización

    let slowMotionInterval = setInterval(() => {
      slowMotionRemaining--;
      if (slowMotionRemaining <= 0) {
        clearInterval(slowMotionInterval);
        monkey.speed = originalSpeed; // Restaurar velocidad
        slowMotionActive = false;
      }
    }, 1000);
  }
}

// Temporizador que disminuye el contador de ralentización cada segundo
setInterval(() => {
  if (boss && !slowMotionActive) {
    slowMotionTimer--;
    if (slowMotionTimer <= 0) {
      activateSlowMotion();
    }
  }
}, 1000); // Disminuir cada segundo

// Función para dibujar los contadores en pantalla
function drawSlowMotionTimer() {
  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";

  if (slowMotionActive) {
    ctx.fillText(
      `Tiempo ralentizado: ${slowMotionRemaining}s`,
      canvas.width - 280,
      60
    );
  } else {
    ctx.fillText(
      `Ralentización en: ${slowMotionTimer}s`,
      canvas.width - 280,
      60
    );
  }
}

let freezeMeteorites = false; // Estado de congelación

// Función para generar 2 meteoritos diagonales
function spawnDiagonalMeteorites() {
  for (let i = 0; i < 2; i++) {
    const x = Math.random() * canvas.width; // Posición aleatoria en la parte superior
    const speedX = (Math.random() - 0.5) * 6; // Movimiento aleatorio horizontal
    const speedY = 5; // Velocidad hacia abajo

    horizontalMeteorites.push({
      x,
      y: -40,
      width: 40,
      height: 40,
      speedX,
      speedY,
      frozen: false, // Nuevo: indica si está congelado
    });
  }
}

// Generar meteoritos diagonales cada 3 segundos
setInterval(() => {
  if (boss && bossHealth <= 1875) {
    spawnDiagonalMeteorites();
  }
}, 3000);

// Función para congelar y luego lanzar meteoritos
function freezeAndDropMeteorites() {
  if (bossHealth > 1875) return; // Solo se activa después de que el jefe pierda 25% de su vida
  freezeMeteorites = true;

  // Congelar meteoritos durante 3 segundos
  horizontalMeteorites.forEach((meteor) => {
    meteor.frozen = true;
  });

  setTimeout(() => {
    freezeMeteorites = false;
    horizontalMeteorites.forEach((meteor) => {
      meteor.frozen = false;
      meteor.speedY = 12; // Aumenta la velocidad al descongelarse
    });
  }, 3000);
}

// Cada 10 segundos, el jefe congela los meteoritos y luego los lanza rápido
setInterval(() => {
  if (boss && bossHealth <= 1875) {
    freezeAndDropMeteorites();
  }
}, 10000);

// Definir el checkpoint y nuevo patrón cuando la nave llegue a la mitad de vida
let checkpointReached = false;
let laserDisabled = false;
let checkpointData = null; // Guardar la posición del jugador y estado del juego

function checkBossHealth() {
  if (boss) {
    if (bossHealth <= 1250 && !checkpointReached) {
      checkpointReached = true;
      createCheckpoint(); // Guardar estado del jugador en el checkpoint
      changeBossPattern(); // Cambiar el patrón del jefe
      showMessage("¡Checkpoint alcanzado! ");
    }

    if (bossHealth <= 1875 && !boss.meteorSpawnActive) {
      boss.meteorSpawnActive = true;
      setInterval(() => {
        if (boss) spawnDiagonalMeteorites();
      }, 5000);
    }

    if (bossHealth <= 1875 && !laserDisabled) {
      console.log("Láser desactivado.");
      laserDisabled = true;
      bossLaser.active = false;
      bossLaser.charging = false;
    }
  }
}

function createCheckpoint() {
  checkpointData = {
    x: monkey.x,
    y: monkey.y,
    lives: 3, // Reiniciar vidas al checkpoint
    bossHealth: bossHealth,
  };
  localStorage.setItem("checkpointData", JSON.stringify(checkpointData));
  console.log("Checkpoint guardado.");
}

function loadCheckpoint() {
  let savedCheckpoint = localStorage.getItem("checkpointData");
  if (savedCheckpoint) {
    checkpointData = JSON.parse(savedCheckpoint);
    monkey.x = checkpointData.x;
    monkey.y = checkpointData.y;
    lives = checkpointData.lives;
    bossHealth = checkpointData.bossHealth;
    console.log("Checkpoint cargado.");
    showMessage("Reiniciando desde el último checkpoint...");
  }
}

function removeCheckpoint() {
  localStorage.removeItem("checkpointData");
  checkpointData = null;
  console.log("Checkpoint eliminado.");
}
function showMessage(message) {
  const messageBox = document.createElement("div");
  messageBox.innerText = message;
  messageBox.style.position = "fixed";
  messageBox.style.top = "10%";
  messageBox.style.left = "50%";
  messageBox.style.transform = "translate(-50%, -50%)";
  messageBox.style.padding = "15px";
  messageBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  messageBox.style.color = "white";
  messageBox.style.borderRadius = "5px";
  messageBox.style.fontSize = "18px";
  messageBox.style.textAlign = "center";
  messageBox.style.zIndex = "3000";
  document.body.appendChild(messageBox);
  setTimeout(() => {
    document.body.removeChild(messageBox);
  }, 3000);
}
function changeBossPattern() {
  console.log("Cambiando patrón del jefe");
  boss.dx *= 1.5; // Aumentar velocidad del jefe
}

// Aparece el jefe
function spawnBoss() {
  boss = { x: canvas.width / 2 - 50, y: 10, width: 100, height: 100, dx: 2 };
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
  ctx.fillRect(boss.x, boss.y - 10, boss.width, 5);
  ctx.fillStyle = "green";
  ctx.fillRect(boss.x, boss.y - 10, (bossHealth / 2500) * boss.width, 5);
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
  const startX = boss.x + boss.width / 2;
  const startY = boss.y + boss.height;
  const offset = 50;

  bossProjectiles.push(
    {
      x: startX,
      y: startY,
      dx: 0,
      dy: 6,
      width: 30,
      height: 30,
      type: "energyBall",
    },
    {
      x: startX - offset,
      y: startY,
      dx: -4,
      dy: 4,
      width: 30,
      height: 30,
      type: "energyBall",
    },
    {
      x: startX + offset,
      y: startY,
      dx: 4,
      dy: 4,
      width: 30,
      height: 30,
      type: "energyBall",
    }
  );
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
      dy: 5, // Movimiento vertical hacia abajo
      width: 10,
      height: 20,
      type: "missile", // Identificador de tipo de proyectil (opcional)
    });
  }
}
// Los proyectiles rebotan en los bordes
function updateBossProjectiles() {
  bossProjectiles.forEach((projectile, index) => {
    projectile.x += projectile.dx;
    projectile.y += projectile.dy;

    if (projectile.x <= 0 || projectile.x + projectile.width >= canvas.width) {
      projectile.dx *= -1;
    }

    if (projectile.y > canvas.height) {
      bossProjectiles.splice(index, 1);
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

// Modifica la función de actualización de meteoritos
function updateHorizontalMeteorites() {
  horizontalMeteorites.forEach((meteor, index) => {
    if (!freezeMeteorites) {
      meteor.x += meteor.speedX;
      meteor.y += meteor.speedY;
    }

    if (meteor.y > canvas.height) {
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
        desbloquearNivel(7);
      }
    }
  });

  // Verificar colisión de misiles y bolas de energía con el mono
  bossProjectiles.forEach((projectile, index) => {
    if (
      monkey.x + monkey.width > projectile.x + 5 && // Margen más realista
      monkey.x < projectile.x + projectile.width - 5 &&
      monkey.y + monkey.height > projectile.y + 5 &&
      monkey.y < projectile.y + projectile.height - 5
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
  monkey.x += monkey.dx;
  monkey.y += monkey.dy;

  // Aplicar gravedad
  if (monkey.y + monkey.height < canvas.height) {
    monkey.dy += gravity;
  } else {
    monkey.y = canvas.height - monkey.height;
    monkey.dy = 0;
    monkey.jumping = false; // Dejar de saltar si toca el suelo
    jumpCount = 0; // Resetear el contador de saltos
  }

  // Limitar movimiento dentro del lienzo
  if (monkey.x < 0) monkey.x = 0;
  if (monkey.x + monkey.width > canvas.width)
    monkey.x = canvas.width - monkey.width;
}

function drawMonkey() {
  ctx.drawImage(monkeyImage, monkey.x, monkey.y, monkey.width, monkey.height);
}

/// Función para actualizar el estado del láser del jefe
function updateBossLaser() {
  if (laserDisabled) {
    bossLaser.active = false;
    bossLaser.charging = false;
    return; // Detiene la ejecución de la función
  }

  if (!bossLaser.charging && !bossLaser.active) {
    bossLaser.charging = true;
    let chargeWidth = 5;
    const chargeInterval = setInterval(() => {
      chargeWidth += 5;
      bossLaser.width = chargeWidth;
      if (chargeWidth >= 50) {
        clearInterval(chargeInterval);
        bossLaser.charging = false;
        bossLaser.active = true;
        setTimeout(() => {
          bossLaser.active = false;
          bossLaser.width = 50;
        }, 1500);
      }
    }, 300);
  }
}

// Dibujar el láser del jefe usando una imagen

// Ahora hay dos láseres en lugar de uno
function drawBossLaser() {
  if (bossLaser.charging) {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      laserImage,
      boss.x + 10,
      boss.y + boss.height - 10,
      bossLaser.width,
      30
    );
    ctx.drawImage(
      laserImage,
      boss.x + boss.width - 50,
      boss.y + boss.height - 10,
      bossLaser.width,
      30
    );
    ctx.globalAlpha = 1;
  }

  if (bossLaser.active) {
    ctx.drawImage(
      laserImage,
      boss.x + 10,
      boss.y + boss.height - 10,
      bossLaser.width,
      canvas.height - (boss.y + boss.height - 10)
    );
    ctx.drawImage(
      laserImage,
      boss.x + boss.width - 50,
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
      width: 10,
      height: 10,
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
  // Detener el juego y la animación
  gameOver = true;
  cancelAnimationFrame(animationFrameId);

  // Crear capa de fondo con la imagen
  const backgroundLayer = document.createElement("div");
  backgroundLayer.style.position = "fixed";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.width = "100%";
  backgroundLayer.style.height = "100%";
  backgroundLayer.style.backgroundImage = "url('img/hasperdido.png')";
  backgroundLayer.style.backgroundSize = "cover";
  backgroundLayer.style.backgroundPosition = "center";
  backgroundLayer.style.zIndex = "5000"; // Superior al canvas
  document.body.appendChild(backgroundLayer);

  // Crear el modal
  const modal = document.createElement("div");
  modal.style.position = "absolute";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.padding = "30px";
  modal.style.textAlign = "center";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  modal.style.borderRadius = "15px";
  modal.style.boxShadow = "0px 0px 20px rgba(255, 0, 0, 0.9)"; // Resaltado en rojo
  modal.style.color = "white";
  modal.style.fontFamily = "Arial, sans-serif";
  modal.style.zIndex = "6000"; // Superior al fondo
  document.body.appendChild(modal);

  // Título del modal
  const title = document.createElement("h2");
  title.innerText = "💀 GAME OVER 💀";
  title.style.color = "#ff0000";
  title.style.fontSize = "28px";
  title.style.marginBottom = "20px";
  title.style.textShadow = "2px 2px 10px black";
  modal.appendChild(title);

  // Mensaje del puntaje

  // Contenedor de botones
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "15px";

  // Botón de reintentar desde el checkpoint (si se alcanzó)
  if (checkpointReached) {
    const retryButton = document.createElement("button");
    retryButton.innerText = "🔄 Reintentar desde Checkpoint";
    retryButton.style.padding = "12px 25px";
    retryButton.style.backgroundColor = "#28a745";
    retryButton.style.border = "none";
    retryButton.style.borderRadius = "8px";
    retryButton.style.color = "white";
    retryButton.style.fontSize = "18px";
    retryButton.style.cursor = "pointer";
    retryButton.style.transition = "0.3s";
    retryButton.onmouseover = () =>
      (retryButton.style.backgroundColor = "#218838");
    retryButton.onmouseleave = () =>
      (retryButton.style.backgroundColor = "#28a745");
    retryButton.onclick = function () {
      document.body.removeChild(modal);
      document.body.removeChild(backgroundLayer);

      // Limpiar entidades del juego
      bossProjectiles = [];
      horizontalMeteorites = [];
      projectiles = [];
      boss = null;
      bossHealth = 1250; // Restaurar vida del jefe
      gameOver = false;

      // Cargar checkpoint y reiniciar el patrón del jefe
      loadCheckpoint();
      spawnBoss();
      startBossShooting();
      startGame();
    };
    buttonContainer.appendChild(retryButton);
  }

  // Botón para volver a jugar desde cero
  const playAgainButton = document.createElement("button");
  playAgainButton.innerText = "🔁 Volver a jugar";
  playAgainButton.style.padding = "12px 25px";
  playAgainButton.style.backgroundColor = "#ffc107";
  playAgainButton.style.border = "none";
  playAgainButton.style.borderRadius = "8px";
  playAgainButton.style.color = "white";
  playAgainButton.style.fontSize = "18px";
  playAgainButton.style.cursor = "pointer";
  playAgainButton.style.transition = "0.3s";
  playAgainButton.onmouseover = () =>
    (playAgainButton.style.backgroundColor = "#e0a800");
  playAgainButton.onmouseleave = () =>
    (playAgainButton.style.backgroundColor = "#ffc107");
  playAgainButton.onclick = () => location.reload();
  buttonContainer.appendChild(playAgainButton);

  // Botón para volver al menú principal
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
  menuButton.onclick = () => (window.location.href = "index.html");
  buttonContainer.appendChild(menuButton);

  // Añadir botones al modal
  modal.appendChild(buttonContainer);
}

function drawLives() {
  ctx.fillStyle = "white"; // Color del texto
  ctx.font = "bold 20px Arial"; // Aplicar negrita
  ctx.shadowColor = "black"; // Color del sombreado
  ctx.shadowBlur = 5; // Desenfoque del sombreado
  ctx.shadowOffsetX = 2; // Desplazamiento horizontal del sombreado
  ctx.shadowOffsetY = 2; // Desplazamiento vertical del sombreado
  ctx.fillText("Vidas: " + lives, canvas.width - 100, 30); // Dibuja el texto
}

function showVictory() {
  console.log("Ejecutando showVictory()"); // Depuración
  gameOver = true;
  removeCheckpoint(); // Eliminar checkpoint al ganar
  bossMusic.pause();

  // Crear capa de fondo con imagen de victoria retro
  const backgroundLayer = document.createElement("div");
  backgroundLayer.style.position = "fixed";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.width = "100%";
  backgroundLayer.style.height = "100%";
  backgroundLayer.style.backgroundImage = "url('img/victoria.webp')"; // Imagen retro de victoria
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
  messageElement.innerText = "🎉 ¡Has derrotado al boss! Nivel desbloqueado.";
  messageElement.style.fontSize = "22px";
  messageElement.style.marginBottom = "15px";
  modal.appendChild(messageElement);

  // Mensaje de checkpoint eliminado
  const checkpointMessage = document.createElement("p");
  checkpointMessage.innerText =
    "⚠️ Checkpoint eliminado. ¡Tu progreso se reiniciará al volver!";
  checkpointMessage.style.fontSize = "18px";
  checkpointMessage.style.color = "#ff5733";
  checkpointMessage.style.fontWeight = "bold";
  checkpointMessage.style.marginBottom = "20px";
  modal.appendChild(checkpointMessage);

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
  menuButton.onclick = () => (window.location.href = "index.html");
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
(function () {
  // 🚫 Detectar apertura de DevTools (F12 o Inspector de elementos)
  function detectDevTools() {
    const before = new Date().getTime();
    debugger;
    const after = new Date().getTime();

    if (after - before > 100) {
      document.body.innerHTML =
        "<h1 style='color: white; background-color: black; height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0;'>🚫 Acceso denegado. DevTools detectado.</h1>";
    }
  }

  // 🚫 Bloquear F12
  document.addEventListener("keydown", function (event) {
    if (event.key === "F12") {
      event.preventDefault();
      alert("🚫 No puedes abrir las herramientas de desarrollo.");
    }
  });

  // 🚫 Detectar modificación del DOM solo cuando se abre DevTools
  let devToolsOpen = false;

  setInterval(() => {
    detectDevTools(); // Detectar apertura de DevTools

    if (
      !devToolsOpen &&
      (window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160)
    ) {
      devToolsOpen = true;
      document.body.innerHTML =
        "<h1 style='color: white; background-color: black; height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0;'>🚫 Modificación del DOM detectada. Acceso denegado.</h1>";
    }
  }, 2000); // Se ejecuta cada 2 segundos para reducir carga
})();

// Iniciar el juego
startBossTransition();
updateGameArea();
