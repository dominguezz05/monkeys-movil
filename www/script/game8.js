// Definir el lienzo y contexto
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajustar el tamaño del canvas dinámicamente// Ajustar el tamaño del canvas dinámicamente
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.7; // Ajuste automático
  canvas.height = window.innerHeight * 0.95; // Ajuste automático

  // Ajustar la plataforma superior con valores relativos
  topPlatform.width = canvas.width * 0.12; // 15% del ancho del canvas
  topPlatform.height = canvas.height * 0.015; // 2% del alto del canvas
  topPlatform.x = canvas.width / 2 - topPlatform.width / 2; // Centrar horizontalmente
  topPlatform.y = canvas.height * 0.15; // 15% desde la parte superior

  // Ajustar la plataforma móvil
  platform.width = canvas.width * 0.15; // 20% del ancho del canvas
  platform.height = canvas.height * 0.015; // 2% del alto del canvas
  platform.x = canvas.width / 2 - platform.width / 2; // Centrar horizontalmente
  platform.y = canvas.height * 0.8; // 80% de la altura del canvas

  // Ajustar el escudo en la plataforma superior
  shieldItem.width = canvas.width * 0.02; // 2.5% del ancho del canvas
  shieldItem.height = shieldItem.width;
  shieldItem.x = topPlatform.x + topPlatform.width / 2 - shieldItem.width / 2;
  shieldItem.y = topPlatform.y - shieldItem.height - 5;
}

const keys = {
  left: false,
  right: false,
  up: false,
  shoot: false,
  shield: false,
};

// Definir variables del juego después de `canvas` para evitar errores
let topPlatform = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  speed: 0.5,
  maxDrop: 50,
  direction: 1,
};

let platform = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  speed: 2,
  direction: 1,
};

let shieldItem = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  collected: false,
};

// Llamar a la función al inicio y cuando cambie el tamaño de la ventana
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
bossImage.src = "img/nave8.png"; // Imagen del jefe

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
const bossMusic = new Audio("audio/level8/boss6.mp3");
// Iniciar música del jefe
bossMusic.loop = true; // Reproducir en bucle
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
let bossHealth = 2500; // Vida inicial del jefe

let gameOver = false;

let score = 0;
let lives = 7;
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
// Láser del jefe
let bossLaser = {
  x: 0,
  y: 0,
  width: 30, // Ancho del láser cuando está completamente cargado
  height: canvas.height,
  active: false,
  charging: false,
};
function esTablet() {
  const width = window.innerWidth;
  return width >= 600 && width <= 1366;
}

// 📌 Estado del escudo del jugador
let shieldActive = false;
let shieldTimer = 0;
let shieldCooldown = 0;
let showShieldMessage = false; // Mostrar mensaje al recoger el escudo

let projectiles = []; // Disparos del mono
let bossProjectiles = []; // Disparos del jefe
let horizontalMeteorites = [];
const bossShootInterval = esTablet() ? 5500 : 4500;
const horizontalMeteorSpeed = 3;
const galaxyBackground = new Image();
galaxyBackground.src = "img/teneb2.webp";

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

// ⬇️ Mover la plataforma superior un poco hacia abajo
function updateTopPlatform() {
  if (topPlatform.y < 100 + topPlatform.maxDrop) {
    topPlatform.y += topPlatform.speed;
    shieldItem.y = topPlatform.y - 30; // Mover el escudo con la plataforma
  }
}

// 🎨 Dibujar la plataforma superior
function drawTopPlatform() {
  ctx.fillStyle = "purple";
  ctx.fillRect(
    topPlatform.x,
    topPlatform.y,
    topPlatform.width,
    topPlatform.height
  );
}

// 🎨 Dibujar el escudo si no ha sido recogido
function drawShieldItem() {
  if (!shieldItem.collected) {
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(
      shieldItem.x + shieldItem.width / 2,
      shieldItem.y + shieldItem.height / 2,
      15,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// 📌 Verificar si el jugador recoge el escudo
function checkShieldPickup() {
  if (
    !shieldItem.collected &&
    monkey.x + monkey.width > shieldItem.x &&
    monkey.x < shieldItem.x + shieldItem.width &&
    monkey.y + monkey.height > shieldItem.y &&
    monkey.y < shieldItem.y + shieldItem.height
  ) {
    shieldItem.collected = true;
    showShieldMessage = true; // Mostrar el mensaje de activación
    setTimeout(() => {
      showShieldMessage = false;
    }, 4000); // Mensaje desaparece después de 4 segundos
  }
}
function removeCheckpoint() {
  localStorage.removeItem("checkpointPhase");
  console.log("Checkpoint eliminado correctamente.");
}

// 🎨 Dibujar el escudo alrededor del jugador si está activo
function drawShield() {
  if (shieldActive) {
    ctx.strokeStyle = `rgba(0, 255, 255, ${
      shieldTimer > 3 ? "1" : shieldTimer % 1 === 0 ? "0.5" : "1"
    })`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      monkey.x + monkey.width / 2,
      monkey.y + monkey.height / 2,
      50,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

// ⏳ Activar el escudo
function activateShield() {
  if (!shieldActive && shieldItem.collected && shieldCooldown <= 0) {
    shieldActive = true;
    shieldTimer = 10; // Dura 10 segundos
    shieldCooldown = 20; // Cooldown de 20 segundos
    let shieldInterval = setInterval(() => {
      shieldTimer--;
      if (shieldTimer <= 0) {
        shieldActive = false;
        clearInterval(shieldInterval);
      }
    }, 1000);

    let cooldownInterval = setInterval(() => {
      shieldCooldown--;
      if (shieldCooldown <= 0) {
        clearInterval(cooldownInterval);
      }
    }, 1000);
  }
}
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
  let savedPhase = loadCheckpoint(); // Cargar el checkpoint guardado

  if (!savedPhase) {
    console.log("No hay checkpoint, empezando desde la fase 1.");
    const bossSpeed = esTablet() ? 2.5 : 2;
    boss = {
      x: canvas.width / 2 - 50,
      y: 50,
      width: 80,
      height: 80,
      dx: bossSpeed,
    };
    bossHealth = 2500; // Vida completa para la fase 1
    boss.phase = 1;
    startBossShooting();
  } else {
    gameState.inLevel = true;

    if (savedPhase >= 2) {
      boss = {
        x: canvas.width / 2 - 50,
        y: 50,
        width: 80,
        height: 80,
        dx: 2,
      };
      bossHealth = savedPhase === 2 ? 2000 : 1000;

      if (savedPhase === 3) {
        boss.phase = 2; // ⚠️ Para que transitionToPhase3() lo lleve a 3 correctamente
        transitionToPhase3(); // ⬅️ Aquí llamamos a la transición oscura
      } else {
        boss.phase = 2;
        startBossShooting(); // Fase normal de misiles
      }
    }
  }

  if (!isPaused && !gameOver) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(updateGameArea);
  }
}

// Llamar a startGame() al cargar la página
window.onload = function () {
  startGame();
};

function saveCheckpoint(phase) {
  localStorage.setItem("checkpointPhase", phase);
  console.log(`Checkpoint guardado en fase: ${phase}`);
}

function loadCheckpoint() {
  let savedPhase = localStorage.getItem("checkpointPhase");
  if (savedPhase) {
    console.log(`Cargando checkpoint en fase: ${savedPhase}`);
    return parseInt(savedPhase);
  }
  return 1; // Si no hay checkpoint, empezar desde la fase 1
}

// Llamar a las funciones de actualización y dibujo en tu bucle principal
function updateGameArea() {
  if (isPaused || gameOver) return; // Detener si el juego está en pausa o terminado

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(galaxyBackground, 0, 0, canvas.width, canvas.height);
  drawCheckpointMessage(); // Mostrar mensaje si hay un checkpoint
  if (gameState.transitioning || gameState.showingBubble) {
    drawBoss();
  } else if (gameState.inLevel) {
    moveMonkey();
    updatePlatform(); // Actualizar plataforma
    updateTopPlatform(); // Mueve la plataforma superior
    updateBarriers();
    checkPlatformCollision(); // Verificar colisión con la plataforma
    checkTopPlatformCollision();
    checkAllPlatformCollisions();
    checkShieldPickup();
    updateProjectiles();

    drawMonkey();
    drawPlatform(); // Dibujar la plataforma
    drawTopPlatform(); // Dibujar plataforma superior
    drawShieldItem();
    drawShield();
    drawProjectiles();
    drawBarriers();
    drawShieldMessage();
    drawShieldCooldown();

    if (boss) {
      drawBossLaser();
      updateBoss();
      drawBoss();
      drawBossShield();
      updateBossLaser();
      checkLaserCollision();
      updateBossProjectiles();
      drawBossProjectiles();
      updateHorizontalMeteorites();
      drawHorizontalMeteorites();
    }

    checkCollisions();

    updateFragments(); // Actualizar fragmentos
    drawFragments(); // Dibujar fragmentos

    drawLives();
    updateDarkness(); // Actualizar la oscuridad progresivamente
    drawDarkness(); // Dibujar
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
  gameState.inLevel = true;
  startBossShooting();

  setInterval(() => {
    if (boss && boss.phase !== 3) {
      // No generar meteoritos en fase 3
      spawnHorizontalMeteorite();
    }
  }, 5000);
}

function startBossTransition() {
  boss = { x: canvas.width / 2 - 50, y: -200, width: 80, height: 80, dx: 2 };
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
  boss = { x: canvas.width / 2 - 50, y: 20, width: 80, height: 80, dx: 4 };
  bossProjectiles = [];
  horizontalMeteorites = [];
  startBossShooting();
  setInterval(() => {
    if (boss) spawnHorizontalMeteorite();
  }, 7000); // Cada 7 segundos
}

// Actualizar y dibujar el jefe
function updateBoss() {
  boss.x += boss.dx;
  boss.y += Math.sin(Date.now() / 500) * 2; // Movimiento en zigzag vertical

  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.dx *= -1;
  }
  if (bossHealth >= 2000) {
    boss.phase = 1; // Primera fase (disparos de energía)
  } else if (bossHealth < 2000 && bossHealth >= 1000) {
    boss.phase = 2; // Segunda fase (meteoritos)
  } else {
    boss.phase = 3; // Última fase (láser en espiral)
  }
}
let fragments = []; // Único array para fragmentos y explosiones
function addExplosion(x, y) {
  // 🌟 Destellos de explosión (SOLO VISUAL, NO SE MUEVEN)
  for (let i = 0; i < 3; i++) {
    fragments.push({
      x: x + Math.random() * 6 - 5, // Pequeño desplazamiento
      y: y + Math.random() * 6 - 5,
      dx: 0, // ❌ No se mueven
      dy: 0,
      width: 3,
      height: 3,
      lifetime: 10, // Desaparecen rápido
      isFragment: false, // ❌ No es un fragmento físico
      isSpecial: false, // ❌ No es el especial
      isRedFlash: true, // 🔴 Indica que es un destello
    });
  }

  // 🔥 Fragmentos normales (NO CAEN, SOLO APARECEN)
  for (let i = 0; i < 5; i++) {
    let offsetX = Math.random() * 20 - 10; // Dispersión en X
    let offsetY = Math.random() * 20 - 10; // Dispersión en Y

    fragments.push({
      x: x + offsetX,
      y: y + offsetY,
      dx: 0, // ❌ No se mueven
      dy: 0,
      width: 7,
      height: 7,
      lifetime: 20, // Duran poco en pantalla
      isFragment: true, // ✅ Fragmento visual
      isSpecial: false, // ❌ No es el especial
      isRedFlash: false, // ❌ No es un destello
    });
  }

  // 💥 Fragmento especial (SOLO ESTE SE MUEVE)
  let specialAngle = ((Math.random() - 0.5) * Math.PI) / 3; // Ángulo bajo
  let specialSpeed = Math.random() * 2 + 1; // Menor velocidad
  let specialDx = Math.cos(specialAngle) * specialSpeed;
  let specialDy = Math.sin(specialAngle) * specialSpeed - 2; // Elevación baja

  fragments.push({
    x: x,
    y: y,
    dx: specialDx,
    dy: specialDy,
    width: 15,
    height: 15,
    lifetime: 150, // Dura más tiempo en pantalla
    isFragment: true, // ✅ Fragmento físico
    isSpecial: true, // 🔴 Este sí causa daño
    isRedFlash: false, // ❌ No es un destello
  });
}

// 🛠 Actualización de fragmentos
function updateFragments() {
  fragments.forEach((fragment, index) => {
    if (fragment.isSpecial) {
      // SOLO el especial se mueve con física
      fragment.x += fragment.dx;
      fragment.y += fragment.dy;
      fragment.dy += gravity * 0.2; // Gravedad reducida
    }

    fragment.lifetime--;
    if (fragment.lifetime <= 0) {
      fragments.splice(index, 1);
    }
  });
}

// 🎨 Dibujar fragmentos
function drawFragments() {
  fragments.forEach((fragment) => {
    if (fragment.isRedFlash) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.8)"; // 🔴 Destellos de explosión
    } else if (fragment.isSpecial) {
      ctx.fillStyle = "rgba(242, 255, 0, 0.9)"; // ⚫ Fragmento especial (cae)
    } else {
      ctx.fillStyle = "rgba(255, 69, 0, 0.8)"; // 🟠 Fragmentos normales (NO caen)
    }

    ctx.beginPath();
    ctx.arc(fragment.x, fragment.y, fragment.width / 2, 0, Math.PI * 2);
    ctx.fill();
  });
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
function bossAttack() {
  updateBossPhase(); // Asegurar que la fase está correcta
  if (boss.phase === 1) {
    shootPatternZ(); // Disparo en línea recta
  } else if (boss.phase === 2) {
    shootHomingMissiles();
  } else {
    shootSpiral(); // Láser en espiral
  }
}

function updateBossPhase() {
  if (bossHealth > 2000) {
    boss.phase = 1; // Primera fase - Disparos normales
  } else if (bossHealth > 1000) {
    if (boss.phase !== 2) {
      saveCheckpoint(2); // Checkpoint al iniciar misiles teledirigidos
      showCheckpointMessage("Checkpoint alcanzado: ¡Misiles teledirigidos!");
    }
    boss.phase = 2; // Segunda fase - Misiles teledirigidos
  } else {
    if (boss.phase !== 3) {
      saveCheckpoint(3); // Checkpoint al iniciar oscuridad
      showCheckpointMessage("Checkpoint alcanzado: ¡Oscuridad total!");
      transitionToPhase3(); // Llamar a la animación de transición
    }
    boss.phase = 3; // Tercera fase - Oscuridad
  }
}

let checkpointMessage = "";
let checkpointMessageTimer = 0;

function showCheckpointMessage(message) {
  checkpointMessage = message;
  checkpointMessageTimer = 200; // Mostrar por 200 frames (~3 segundos)
}

function drawCheckpointMessage() {
  if (checkpointMessageTimer > 0) {
    ctx.fillStyle = "yellow";
    ctx.font = "bold 24px Arial";
    ctx.fillText(checkpointMessage, canvas.width / 2 - 150, 100);
    checkpointMessageTimer--;
  }
}

function startBossShooting() {
  setInterval(() => {
    if (boss) {
      updateBossPhase(); // Actualizar la fase del jefe antes de atacar
      if (boss.phase === 1) {
        bossAttack(); // Disparos rápidos en la primera fase
      } else if (boss.phase === 2) {
        setTimeout(bossAttack, 4000); // En la fase 2, los disparos tardan más (4s)
      }
    }
  }, bossShootInterval);
}
let bossShield = {
  active: false,
};

// Alternar el estado del escudo cada 5 segundos
function toggleBossShield() {
  if (boss && boss.phase !== 3) {
    bossShield.active = !bossShield.active;
  } else {
    bossShield.active = false; // Asegurarse de que el escudo esté siempre desactivado en fase 3
  }
}

// Alternar el estado del escudo cada 5 segundos, controlando la fase
setInterval(toggleBossShield, 7000);

// Dibujar el escudo del jefe
function drawBossShield() {
  if (bossShield.active) {
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      boss.x + boss.width / 2,
      boss.y + boss.height / 2,
      50, // Tamaño del escudo
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}
function shootPatternZ() {
  const startX = boss.x + boss.width / 2;
  const startY = boss.y + boss.height;
  const offset = 40; // Separación entre disparos

  for (let i = -2; i <= 2; i++) {
    bossProjectiles.push({
      x: startX + i * offset,
      y: startY,
      dx: i * 0.5, // Dispersión leve
      dy: esTablet() ? 7 : 6,
      width: 22,
      height: 22,
      type: "energyBall",
    });
  }
}

const MAX_ACTIVE_MISSILES = 4;
let lastMissileTime = 0; // Tiempo del último disparo

// Misiles teledirigidos// 📌 Función mejorada para disparar misiles teledirigidos
function shootHomingMissiles() {
  const now = Date.now();

  // ⚠️ Si ya hay suficientes misiles, no dispares más
  const activeMissiles = bossProjectiles.filter(
    (p) => p.type === "missile"
  ).length;
  if (activeMissiles >= MAX_ACTIVE_MISSILES) return;

  // ⏳ Controlar la frecuencia de disparo (disparar cada 3 segundos)
  if (now - lastMissileTime < 3000) return;
  lastMissileTime = now;

  // 🔥 Configuración de misiles teledirigidos
  const missileSpeed = 2.5;
  const missileTurnRate = 0.04;

  for (let i = 0; i < 2; i++) {
    bossProjectiles.push({
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height,
      dx: 0, // Ajustará su dirección en cada frame
      dy: missileSpeed,
      width: 5,
      height: 12,
      type: "missile",
      homing: true,
      turnRate: missileTurnRate,
      speed: missileSpeed,
      lifetime: 200, // ⏳ Desaparecerán después de un tiempo
    });
  }
}

let darknessLevel = 0; // Nivel de oscuridad (0 = sin oscuridad, 1 = completamente oscuro)
let visibilityRadius = 700; // Radio inicial de visión alrededor del mono
let darknessIncreasing = false; // Bandera para saber si la oscuridad está activándose

// Crear un canvas oculto para la oscuridad
const darknessCanvas = document.createElement("canvas");
const darknessCtx = darknessCanvas.getContext("2d");

function resizeDarknessCanvas() {
  darknessCanvas.width = canvas.width;
  darknessCanvas.height = canvas.height;
}

window.addEventListener("resize", resizeDarknessCanvas);
resizeDarknessCanvas(); // Ajustar el tamaño al inicio

// Función para actualizar la oscuridad progresivamente
function updateDarkness() {
  if (boss.phase === 3 && darknessLevel < 1) {
    darknessLevel += 0.02; // Incrementar la oscuridad gradualmente
    visibilityRadius -= 10; // Reducir el radio visible poco a poco
    if (visibilityRadius < 200) visibilityRadius = 200; // Límite mínimo del radio
    if (darknessLevel > 1) darknessLevel = 1; // Esto evita bucles infinitos
  }
}

// Función para dibujar la oscuridad con el efecto progresivo
function drawDarkness() {
  if (boss.phase < 3) return; // Solo en la fase 3

  darknessCtx.clearRect(0, 0, darknessCanvas.width, darknessCanvas.height); // Limpiar la capa

  // Dibujar la capa negra progresivamente
  darknessCtx.fillStyle = `rgba(0, 0, 0, ${darknessLevel})`;
  darknessCtx.fillRect(0, 0, darknessCanvas.width, darknessCanvas.height);

  // Crear el agujero en la oscuridad alrededor del mono
  darknessCtx.globalCompositeOperation = "destination-out";
  darknessCtx.beginPath();
  darknessCtx.arc(
    monkey.x + monkey.width / 2, // Centrar en el mono
    monkey.y + monkey.height / 2,
    visibilityRadius, // Reducir el radio con el tiempo
    0,
    Math.PI * 2
  );
  darknessCtx.fill();

  // Restaurar el modo de composición
  darknessCtx.globalCompositeOperation = "source-over";

  // Dibujar la capa oscura sobre el canvas principal
  ctx.drawImage(darknessCanvas, 0, 0);
}

// Función para iniciar la transición a la fase 3 con oscuridad progresiva
function transitionToPhase3() {
  gameState.transitioning = true;
  darknessLevel = 0;
  visibilityRadius = 500;

  function fadeStep() {
    updateDarkness();

    // Continuar hasta que se alcance el nivel máximo de oscuridad
    if (darknessLevel < 1) {
      requestAnimationFrame(fadeStep);
    } else {
      boss.phase = 3;
      gameState.transitioning = false;
    }
  }

  fadeStep(); // Iniciar transición
}

function updateBossProjectiles() {
  bossProjectiles.forEach((projectile, index) => {
    // 📌 Movimiento básico
    projectile.x += projectile.dx;
    projectile.y += projectile.dy;

    // 🌟 Solo los proyectiles de la fase 1 deben rebotar
    if (boss.phase === 1 && projectile.type === "energyBall") {
      if (checkBarrierCollision(projectile)) {
        applyParabolicBounce(projectile);
      } else {
        projectile.dy += 0.2; // Agregar gravedad leve para simular el rebote
      }
    }

    // 🚀 Lógica de seguimiento para misiles teledirigidos en fase 2
    if (boss.phase === 2 && projectile.type === "missile") {
      let angleToTarget = Math.atan2(
        monkey.y - projectile.y,
        monkey.x - projectile.x
      );
      let currentAngle = Math.atan2(projectile.dy, projectile.dx);

      // Girar el misil hacia el jugador de manera suave
      if (Math.abs(angleToTarget - currentAngle) > projectile.turnRate) {
        currentAngle +=
          Math.sign(angleToTarget - currentAngle) * projectile.turnRate;
      } else {
        currentAngle = angleToTarget;
      }

      projectile.dx = Math.cos(currentAngle) * projectile.speed;
      projectile.dy = Math.sin(currentAngle) * projectile.speed;

      // Aumentar velocidad ligeramente
      if (projectile.speed < 4) {
        projectile.speed += 0.02;
      }
    }

    // 🔴 Verificar colisión con el mono y eliminar misil si impacta

    // ❌ Eliminar proyectiles que salgan del lienzo
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

// Función para generar meteoritos horizontales dentro del lienzo y desde la mitad inferior
function spawnHorizontalMeteorite() {
  const y = Math.random() * (canvas.height / 2) + canvas.height / 2; // Solo en la parte inferior del lienzo
  const direction = Math.random() < 0.5 ? 1 : -1;
  const x = direction === 1 ? -40 : canvas.width + 40;
  horizontalMeteorites.push({
    x,
    y,
    width: 25,
    height: 25,
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
let gravityInverted = false;
let gravityTimer = 7; // Segundos antes de cambiar la gravedad
let flyingMode = false; // Modo vuelo activado o no
let flyingSpeed = 2.5; // Velocidad de vuelo

// Alternar entre gravedad normal y vuelo cada 7 segundos
setInterval(toggleGravityMode, 7000);

function toggleGravityMode() {
  if (!gravityCountdownActive) {
    gravityCountdownActive = true;

    let countdownInterval = setInterval(() => {
      gravityTimer--;
      if (gravityTimer <= 0) {
        clearInterval(countdownInterval);
        gravityTimer = 7; // Reiniciar el contador
        gravityCountdownActive = false;

        // Cambiar gravedad
        gravityInverted = !gravityInverted;
        if (gravityInverted) {
          monkeyImage.src = "img/gorila.png"; // Mono mirando a la pantalla
        } else {
          monkeyImage.src = "img/gorila.png"; // Imagen normal
        }
      }
    }, 1000);
  }
}

// Función para mostrar el contador en pantalla
function drawGravityCountdown() {
  if (gravityTimer <= 3) {
    // Solo mostrar los últimos 3 segundos
    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";
    ctx.fillText(
      `Cambio de gravedad en: ${gravityTimer}`,
      canvas.width / 2 - 100,
      50
    );
  }
}

function checkCollisions() {
  // ⚔️ Colisiones de proyectiles del mono con el jefe (siempre deben aplicar daño)
  projectiles.forEach((projectile, index) => {
    if (
      projectile.x + projectile.width > boss.x &&
      projectile.x < boss.x + boss.width &&
      projectile.y + projectile.height > boss.y &&
      projectile.y < boss.y + boss.height
    ) {
      if (!bossShield.active) {
        // Solo recibe daño si el escudo está desactivado
        bossHealth -= 10;
        if (boss.phase === 3) {
          addExplosion(projectile.x, projectile.y); // 💥 Solo explota en fase 3
        }
        if (bossHealth <= 0) {
          bossHealth = 0;
          showVictory();
          desbloquearNivel(8);
        }
      }

      projectiles.splice(index, 1); // Eliminar el proyectil después del impacto
    }
  });

  // 🛡️ Si el escudo está activo, ignorar daño al jugador
  if (shieldActive) return;

  // 🔥 Colisiones de disparos del jefe y meteoritos con el mono
  [...bossProjectiles, ...horizontalMeteorites].forEach((obj, index) => {
    let objHitbox = {
      x: obj.x + 3,
      y: obj.y + 3,
      width: obj.width - 6,
      height: obj.height - 6,
    };

    let monkeyHitbox = {
      x: monkey.x + 3,
      y: monkey.y + 3,
      width: monkey.width - 6,
      height: monkey.height - 6,
    };

    if (
      objHitbox.x < monkeyHitbox.x + monkeyHitbox.width &&
      objHitbox.x + objHitbox.width > monkeyHitbox.x &&
      objHitbox.y < monkeyHitbox.y + monkeyHitbox.height &&
      objHitbox.y + objHitbox.height > monkeyHitbox.y &&
      !obj.hasCollided
    ) {
      if (shieldActive) {
        // Si tienes escudo, eliminar el proyectil sin perder vida
        bossProjectiles.splice(index, 1);
        horizontalMeteorites.splice(index, 1);
      } else {
        loseLife(); // Si no hay escudo, perder vida
        bossProjectiles.splice(index, 1);
        horizontalMeteorites.splice(index, 1);
      }
      obj.hasCollided = true;
    }
  });

  // ☄️ Colisiones de meteoritos con el mono
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

  // 🔴 Colisión del FRAGMENTO ESPECIAL con el mono
  fragments.forEach((fragment, index) => {
    if (fragment.isSpecial) {
      let fragmentHitbox = {
        x: fragment.x + 1,
        y: fragment.y + 1,
        width: fragment.width - 2,
        height: fragment.height - 2,
      };

      let monkeyHitbox = {
        x: monkey.x + 4,
        y: monkey.y + 4,
        width: monkey.width - 8,
        height: monkey.height - 8,
      };

      if (
        fragmentHitbox.x < monkeyHitbox.x + monkeyHitbox.width &&
        fragmentHitbox.x + fragmentHitbox.width > monkeyHitbox.x &&
        fragmentHitbox.y < monkeyHitbox.y + monkeyHitbox.height &&
        fragmentHitbox.y + fragmentHitbox.height > monkeyHitbox.y
      ) {
        console.log("🔥 El fragmento especial impactó al mono");
        loseLife();
        fragments.splice(index, 1); // Eliminar el fragmento tras impactar
      }
    }
  });
}

// 🎨 Mostrar mensaje cuando recoges el escudo
function drawShieldMessage() {
  if (showShieldMessage) {
    ctx.fillStyle = "yellow";
    ctx.font = "20px Arial";
    ctx.fillText("¡Escudo recogido! ", canvas.width / 2 - 180, 50);
  }
}

// 🎨 Mostrar cooldown del escudo
function drawShieldCooldown() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(
    `Escudo en: ${shieldCooldown > 0 ? shieldCooldown + "s" : "Listo"}`,
    canvas.width - 160,
    50
  );
}

// 🔹 Verificar si el jugador pisa la plataforma superior
function checkTopPlatformCollision() {
  if (
    monkey.y + monkey.height >= topPlatform.y &&
    monkey.y + monkey.height <= topPlatform.y + topPlatform.height &&
    monkey.x + monkey.width > topPlatform.x &&
    monkey.x < topPlatform.x + topPlatform.width
  ) {
    monkey.y = topPlatform.y - monkey.height;
    monkey.dy = 0;
    monkey.jumping = false;
    jumpCount = 0;
  }
}

// 📌 Evento para activar el escudo
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e") {
    activateShield();
  }
});

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
  const key = e.key.toLowerCase(); // Convertir a minúsculas

  if (flyingMode) {
    // 🚀 Modo vuelo: Movimiento libre en todas direcciones
    if (key === "d") monkey.dx = flyingSpeed; // Derecha
    if (key === "a") monkey.dx = -flyingSpeed; // Izquierda
    if (key === "w") monkey.dy = -flyingSpeed; // Subir
    if (key === "s") monkey.dy = flyingSpeed; // Bajar
  } else {
    // 🌎 Modo normal: Movimiento con gravedad
    if (key === "d") {
      monkey.dx = monkey.speed;
      updateMonkeyImage();
    }
    if (key === "a") {
      monkey.dx = -monkey.speed;
      updateMonkeyImage();
    }
    if (key === "w" && jumpCount < 2) {
      // Permitir doble salto
      monkey.dy = -12;
      monkey.jumping = true;
      jumpCount++;
    }
  }

  // Disparar solo si la barra espaciadora no está presionada
  if (key === " " && !spacePressed) {
    shootProjectile();
    spacePressed = true;
  }
});

// Detener movimiento al soltar teclas
document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key === "d" || key === "a") monkey.dx = 0;
  if (flyingMode && (key === "w" || key === "s")) monkey.dy = 0;
  if (key === " ") spacePressed = false;
});

// Aplicar la gravedad y resetear los saltos
// Mover al personaje considerando el modo de gravedad o vuelo
function moveMonkey() {
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

  monkey.x += monkey.dx;
  monkey.y += monkey.dy;

  // Aplicar gravedad
  if (monkey.y + monkey.height < canvas.height) {
    monkey.dy += gravity;
  } else {
    monkey.y = canvas.height - monkey.height;
    monkey.dy = 0;
    monkey.jumping = false;
    jumpCount = 0;
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
  if (!bossLaser.charging && !bossLaser.active) {
    bossLaser.charging = true;
    let chargeWidth = 5;
    const chargeInterval = setInterval(() => {
      chargeWidth += 3;
      bossLaser.width = chargeWidth;
      if (chargeWidth >= 30) {
        clearInterval(chargeInterval);
        bossLaser.charging = false;
        bossLaser.active = true;
        setTimeout(() => {
          bossLaser.active = false;
          bossLaser.width = 50;
        }, 1000);
      }
    }, 500);
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

// Verificar colisiones del láser con el jugadorfunction
function checkLaserCollision() {
  // Si el escudo está activo, el rayo no hace daño
  if (shieldActive) return;

  const laserCenter = boss.x + boss.width / 2;
  const laserEffectiveWidth = bossLaser.width * 0.7; // SOLO 70% del ancho visual del láser

  if (
    bossLaser.active &&
    monkey.x + monkey.width > laserCenter - laserEffectiveWidth / 2 &&
    monkey.x < laserCenter + laserEffectiveWidth / 2
  ) {
    loseLife();
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
      width: 8,
      height: 8,
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

// Actualizar posición de la plataforma
function updatePlatform() {
  platform.x += platform.speed * platform.direction;

  // Cambiar dirección si alcanza los bordes
  if (platform.x <= 0 || platform.x + platform.width >= canvas.width) {
    platform.direction *= -1;
  }
}

// Dibujar la plataforma
function drawPlatform() {
  ctx.fillStyle = "blue"; // Color de la plataforma
  ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
}

// Verificar colisiones del mono con la plataforma
function checkPlatformCollision() {
  if (
    monkey.y + monkey.height >= platform.y &&
    monkey.y + monkey.height <= platform.y + platform.height &&
    monkey.x + monkey.width > platform.x &&
    monkey.x < platform.x + platform.width
  ) {
    monkey.y = platform.y - monkey.height; // Posicionar al mono encima de la plataforma
    monkey.dy = 0; // Detener el movimiento vertical
    monkey.jumping = false; // Permitir que salte de nuevo
    jumpCount = 0; // Restablecer contador de saltos
  }
}
let barriers = [{ x: 300, y: 450, width: 100, height: 20, dx: 2 }];
let allPlatforms = [...barriers, platform, topPlatform];

function checkAllPlatformCollisions() {
  allPlatforms.forEach((plat) => {
    if (
      monkey.y + monkey.height >= plat.y && // Toca la parte superior
      monkey.y + monkey.height <= plat.y + plat.height && // Dentro del área de colisión
      monkey.x + monkey.width > plat.x && // Dentro del ancho de la plataforma
      monkey.x < plat.x + plat.width
    ) {
      // ✅ Colisión detectada
      monkey.y = plat.y - monkey.height; // Colocar al mono encima
      monkey.dy = 0; // Detener la caída
      monkey.jumping = false; // Resetear el salto
      jumpCount = 0; // Permitir doble salto nuevamente
    }
  });
}

function updateBarriers() {
  barriers.forEach((barrier) => {
    barrier.x += barrier.dx;

    if (barrier.x <= 0 || barrier.x + barrier.width >= canvas.width) {
      barrier.dx *= -1; // Cambiar dirección
    }
  });
}

function drawBarriers() {
  barriers.forEach((barrier) => {
    ctx.fillStyle = "gray";
    ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
  });
}

function checkBarrierCollision(projectile) {
  let allObstacles = [...barriers, platform, topPlatform]; // Incluir todas las plataformas y barreras

  return allObstacles.some((obstacle) => {
    if (
      projectile.x < obstacle.x + obstacle.width &&
      projectile.x + projectile.width > obstacle.x &&
      projectile.y < obstacle.y + obstacle.height &&
      projectile.y + projectile.height > obstacle.y
    ) {
      if (projectile.type === "energyBall") {
        applyParabolicBounce(projectile); // Aplicar rebote solo a las bolas de energía azul
      }
      return true;
    }
    return false;
  });
}

function applyParabolicBounce(projectile) {
  projectile.dy = -(Math.random() * 8 + 6); // Rebote más alto (antes era 4 + 2)
  projectile.dx = (Math.random() - 0.5) * 6; // Movimiento lateral más variable
}

// Terminar el juego
function endGame(message) {
  gameOver = true;
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(message, canvas.width / 2 - 150, canvas.height / 2);
  showGameOverModal();
}
function resetGameData() {
  // 🔄 Resetear todas las variables importantes
  boss = null;
  bossHealth = 2500;
  bossProjectiles = [];
  horizontalMeteorites = [];
  projectiles = [];
  fragments = [];
  lives = 7;
  score = 0;
  shieldItem.collected = false;
  shieldActive = false;
  shieldTimer = 0;
  shieldCooldown = 0;
  visibilityRadius = 700;
  darknessLevel = 0;
  darknessIncreasing = false;
  gameOver = false;
  isPaused = false;
  gameState.transitioning = false;
  gameState.showingBubble = false;
  gameState.inLevel = false;

  monkey.x = 100;
  monkey.y = canvas.height - 70;
  monkey.dx = 0;
  monkey.dy = 0;
  monkey.jumping = false;
  jumpCount = 0;

  removeCheckpoint(); // Eliminar checkpoint guardado
  bossMusic.pause(); // Pausar la música del jefe por si acaso
}

function showGameOverModal() {
  // Detener la animación del juego
  gameOver = true;
  cancelAnimationFrame(animationFrameId);
  bossMusic.pause(); // Pausar la música del jefe

  // Crear capa de fondo con la imagen de "Game Over"
  const backgroundLayer = document.createElement("div");
  backgroundLayer.style.position = "fixed";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.width = "100%";
  backgroundLayer.style.height = "100%";
  backgroundLayer.style.backgroundImage = "url('img/hasperdido.png')";
  backgroundLayer.style.backgroundSize = "cover";
  backgroundLayer.style.backgroundPosition = "center";
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
  modal.style.boxShadow = "0px 0px 25px rgba(255, 0, 0, 0.9)";
  modal.style.color = "white";
  modal.style.fontFamily = "Arial, sans-serif";
  modal.style.zIndex = "6000"; // Más alto que el fondo
  document.body.appendChild(modal);

  // Título del modal con efecto de sombra
  const title = document.createElement("h2");
  title.innerText = "💀 GAME OVER 💀";
  title.style.color = "#ff0000";
  title.style.fontSize = "30px";
  title.style.marginBottom = "20px";
  title.style.textShadow = "2px 2px 15px black";
  modal.appendChild(title);

  // Contenedor de botones
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "15px";

  // Botón para volver a jugar
  const playAgainButton = document.createElement("button");
  playAgainButton.innerText = "🔄 Reintentar";
  playAgainButton.style.padding = "12px 30px";
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
  buttonContainer.appendChild(playAgainButton);

  // Botón para volver al menú
  const menuButton = document.createElement("button");
  menuButton.innerText = "🏠 Menú Principal";
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
  removeCheckpoint(); // Eliminar checkpoint

  bossMusic.pause();

  // Si estamos en Android y hay anuncio, primero lo mostramos antes de renderizar el modal
  if (window.Android && typeof Android.showInterstitial === "function") {
    Android.showInterstitial();
    setTimeout(() => {
      renderVictoryModalFinal();
    }, 300); // Puedes ajustar el tiempo si es necesario
  } else {
    renderVictoryModalFinal();
  }
}

function renderVictoryModalFinal() {
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
  messageElement.innerText =
    "🎉 Has derrotado al boss. ¡Acaba con el jefe una vez por todas!";
  messageElement.style.fontSize = "22px";
  messageElement.style.marginBottom = "15px";
  modal.appendChild(messageElement);

  const checkpointMessage = document.createElement("p");
  checkpointMessage.innerText =
    "⚠️ Checkpoint eliminado. ¡Tu progreso se reiniciará al volver!";
  checkpointMessage.style.fontSize = "18px";
  checkpointMessage.style.color = "#ff5733";
  checkpointMessage.style.fontWeight = "bold";
  checkpointMessage.style.marginBottom = "20px";
  modal.appendChild(checkpointMessage);

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
    // Mostrar anuncio antes de volver al menú
    if (window.Android && typeof Android.showInterstitial === "function") {
      Android.showInterstitial();
      setTimeout(() => {
        victoryMusic.pause();
        victoryMusic.currentTime = 0;
        resetGameData();
        window.location.href = "index.html";
      }, 300);
    } else {
      victoryMusic.pause();
      victoryMusic.currentTime = 0;
      resetGameData();
      window.location.href = "index.html";
    }
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
updateGameArea();
