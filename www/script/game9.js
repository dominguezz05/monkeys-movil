// añadir musica  la victory y poner que cada disparo son 10 de daño cuando este perfecto
// ahcer el platano malo y la imagen de la mona bien, ver si en todos los showVicotry poner muscia vicotira
// ver si aumentar la vida del boss
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
bossImage.src = "img/naveBoss.png"; // Imagen del jefe

const enemyImage = new Image();
enemyImage.src = "img/bolas.png";

// Cargar la imagen del láser
const laserImage = new Image();
laserImage.src = "img/laser.png"; // Ruta de la imagen del láser

const energyBallImage = new Image();
energyBallImage.src = "img/energyBallBlue.png"; // Cambia la ruta según tu archivo

const missileImage = new Image();
missileImage.src = "img/laser.png"; // Reemplaza con la ruta de la imagen

const backgroundPhase1 = new Image();
backgroundPhase1.src = "img/jefeFinal.webp";

const backgroundPhase2 = new Image();
backgroundPhase2.src = "img/jefeFinal2.webp";

const backgroundPhase3 = new Image();
backgroundPhase3.src = "img/jefeFinal3.webp";

let currentBackground = backgroundPhase1; // Fondo inicial

// Música del jefe
const bossMusic = new Audio("audio/level9/level9.mp3");
// Iniciar música del jefe
bossMusic.loop = true; // Reproducir en bucle

// Variables del juego
let boss = null;
let bossHealth = 2500; // Vida inicial del jefe

let randomMeteorites = []; // Solo los aleatorios

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

// 📌 Estado del escudo del jugador
let shieldActive = false;
let shieldTimer = 0;
let shieldCooldown = 0;
let showShieldMessage = false; // Mostrar mensaje al recoger el escudo

let projectiles = []; // Disparos del mono
let bossProjectiles = []; // Disparos del jefe
let horizontalMeteorites = [];
const bossShootInterval = 3200;
const horizontalMeteorSpeed = 3;
const galaxyBackground = new Image();
galaxyBackground.src = "img/jefeFinal.webp";
let bossInvisible = false;

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
  console.log("🗑️ Checkpoint eliminado.");
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
};

// Función para iniciar el juego
function startGame() {
  let savedPhase = loadCheckpoint(); // Obtener la fase guardada del checkpoint

  console.log(`🏁 Iniciando juego en la fase ${savedPhase}`);

  if (!savedPhase || savedPhase === 1) {
    console.log("No hay checkpoint, empezando desde la fase 1.");
    boss = {
      x: canvas.width / 2 - 125, // Centrar correctamente
      y: 50,
      width: 110,
      height: 110,
      dx: 2,
    };

    bossHealth = 2500;
    boss.phase = 1;
    currentBackground = backgroundPhase1;
    startBossShooting();
  } else {
    console.log(`🔄 Continuando desde la fase ${savedPhase}`);
    gameState.inLevel = true;
    boss = {
      x: canvas.width / 2 - 125, // Centrar correctamente
      y: 50,
      width: 110,
      height: 110,
      dx: 2,
    };
    if (!bossMusic.paused) bossMusic.pause();
    bossMusic.currentTime = 0;
    bossMusic
      .play()
      .catch((e) => console.warn("Error al reproducir bossMusic:", e));
    // Configurar variables del jefe según la fase guardada
    if (savedPhase === 2) {
      bossHealth = 1999; // Forzar a que updateBossPhase lo suba correctamente a 2
      boss.phase = 2;
      currentBackground = backgroundPhase2;
      bossLaser.active = false; // Desactivar el láser en fase 2
      bossLaser.charging = false;
    } else if (savedPhase === 3) {
      bossHealth = 999;
      boss.phase = 3;
      currentBackground = backgroundPhase3;
      bossLaser.active = false;
      bossLaser.charging = false;

      console.log("⏳ Esperando 2 segundos antes de activar la fase 3...");

      setTimeout(() => {
        transitionToPhase3(); // 🕘 Esperar 2 segundos antes de la transición
        console.log("🌑 El jefe ha entrado en la fase 3");
      }, 2000);
    }

    startBossShooting(); // Iniciar los ataques del jefe según la fase
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
  console.log(`Intentando guardar checkpoint en fase ${phase}`);
  let currentCheckpoint = localStorage.getItem("checkpointPhase");

  if (!currentCheckpoint || parseInt(currentCheckpoint) < phase) {
    localStorage.setItem("checkpointPhase", phase);
    console.log(`✅ Checkpoint guardado: Fase ${phase}`);
  } else {
    console.log(
      `⚠️ No se guardó el checkpoint porque ya estaba en fase ${currentCheckpoint}`
    );
  }
}
setInterval(() => {
  if (
    boss &&
    !isPaused &&
    !gameOver &&
    bossMusic.paused &&
    bossMusic.readyState >= 2
  ) {
    bossMusic.play().catch(() => {});
  }
}, 3000);

function loadCheckpoint() {
  let savedPhase = localStorage.getItem("checkpointPhase");
  if (savedPhase === null) {
    console.warn("⚠️ No hay checkpoint guardado en localStorage.");
    return 1; // Si no hay checkpoint, empezar desde la fase 1
  } else {
    console.log(`🔄 Cargando checkpoint en fase: ${savedPhase}`);
    return parseInt(savedPhase, 10);
  }
}

// Llamar a las funciones de actualización y dibujo en tu bucle principal
function updateGameArea() {
  if (isPaused || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height); // Fondo dinámico

  drawCheckpointMessage();

  if (gameState.transitioning || gameState.showingBubble) {
    drawBoss();
  } else if (gameState.inLevel) {
    moveMonkey();
    updatePlatform();
    updateTopPlatform();
    updateBarriers();
    checkPlatformCollision();
    checkTopPlatformCollision();
    checkAllPlatformCollisions();
    checkShieldPickup();
    updateProjectiles();

    drawMonkey();
    drawPlatform();
    drawTopPlatform();
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
      updateHorizontalMeteorites();
      drawHorizontalMeteorites();
      updateRandomMeteorites();
      drawRandomMeteorites();
    }

    checkCollisions();
    updateFragments();
    drawFragments();
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
  boss = { x: canvas.width / 2 - 50, y: -180, width: 110, height: 110, dx: 2 };
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
  boss = { x: canvas.width / 2 - 50, y: 20, width: 110, height: 110, dx: 4 };
  bossProjectiles = [];
  horizontalMeteorites = [];
  startBossShooting();
  setInterval(() => {
    if (boss) spawnHorizontalMeteorite();
  }, 6000); // Cada 7 segundos
}

// Actualizar y dibujar el jefe
function updateBoss() {
  boss.x += boss.dx * 0.7; // 🔽 Se redujo el movimiento lateral en un 30%
  boss.y += Math.sin(Date.now() / 800) * 1.5; // 🔽 Zigzag más lento

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
      x: x + Math.random() * 10 - 5, // Pequeño desplazamiento
      y: y + Math.random() * 10 - 5,
      dx: 0, // ❌ No se mueven
      dy: 0,
      width: 5,
      height: 5,
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
      width: 3,
      height: 3,
      lifetime: 10, // Duran poco en pantalla
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
    width: 7,
    height: 7,
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
let meteorRainInterval = null; // Guardamos el intervalo

function toggleBossInvisibility() {
  if (boss.phase === 2) {
    bossInvisible = !bossInvisible;
    console.log(`👻 Jefe ahora es ${bossInvisible ? "INVISIBLE" : "VISIBLE"}`);

    if (bossInvisible) {
      startMeteorRain();
    } else {
      stopMeteorRain();
    }
  } else {
    bossInvisible = false;
    stopMeteorRain();
  }
}
function spawnRandomMeteor() {
  const spawnType = Math.floor(Math.random() * 7); // Ahora hay 8 posibilidades

  let meteor = {
    width: 25,
    height: 25,
    dx: 0,
    dy: 0,
  };

  switch (spawnType) {
    case 0: // Desde arriba (caída vertical)
      meteor.x = Math.random() * canvas.width;
      meteor.y = -meteor.height;
      meteor.dy = 5;
      break;

    case 2: // Desde la izquierda (movimiento horizontal)
      meteor.x = -meteor.width;
      meteor.y = Math.random() * canvas.height;
      meteor.dx = 5;
      break;

    case 3: // Desde la derecha (movimiento horizontal)
      meteor.x = canvas.width;
      meteor.y = Math.random() * canvas.height;
      meteor.dx = -5;
      break;

    case 4: // Esquina superior izquierda (diagonal hacia el centro)
      meteor.x = -meteor.width;
      meteor.y = -meteor.height;
      meteor.dx = 4;
      meteor.dy = 4;
      break;

    case 5: // Esquina superior derecha (diagonal hacia el centro)
      meteor.x = canvas.width;
      meteor.y = -meteor.height;
      meteor.dx = -4;
      meteor.dy = 4;
      break;

    case 6: // Esquina inferior izquierda (diagonal hacia el centro)
      meteor.x = -meteor.width;
      meteor.y = canvas.height;
      meteor.dx = 4;
      meteor.dy = -4;
      break;

    case 7: // Esquina inferior derecha (diagonal hacia el centro)
      meteor.x = canvas.width;
      meteor.y = canvas.height;
      meteor.dx = -4;
      meteor.dy = -4;
      break;
  }

  randomMeteorites.push(meteor);
}

function updateRandomMeteorites() {
  randomMeteorites.forEach((meteor, index) => {
    meteor.x += meteor.dx;
    meteor.y += meteor.dy;

    if (
      meteor.x < -50 ||
      meteor.x > canvas.width + 50 ||
      meteor.y < -50 ||
      meteor.y > canvas.height + 50
    ) {
      randomMeteorites.splice(index, 1);
    }
  });
}
function drawRandomMeteorites() {
  randomMeteorites.forEach((meteor) => {
    ctx.drawImage(enemyImage, meteor.x, meteor.y, meteor.width, meteor.height);
  });
}

function startMeteorRain() {
  if (meteorRainInterval) return; // Ya está activo

  console.log("🌠 Iniciando lluvia aleatoria de meteoritos...");

  meteorRainInterval = setInterval(() => {
    spawnRandomMeteor();
  }, 500);
}

function stopMeteorRain() {
  console.log("⛔ Parando lluvia de meteoritos.");
  clearInterval(meteorRainInterval);
  meteorRainInterval = null;
}

function spawnMeteorRain() {
  const speedMultiplier = 1.3; // Aumentar velocidad un 30%

  const meteor = {
    x: Math.random() * canvas.width,
    y: -40,
    width: 25,
    height: 25,
    dx: (Math.random() - 0.5) * 2 * speedMultiplier, // Movimiento lateral más rápido
    dy: (5 + Math.random() * 3) * speedMultiplier, // Caída más rápida
  };

  horizontalMeteorites.push(meteor);
  console.log("☄️ Meteorito generado en:", meteor.x, meteor.y);
}

function updateHorizontalMeteorites() {
  horizontalMeteorites.forEach((meteor, index) => {
    meteor.x += meteor.dx;
    meteor.y += meteor.dy;

    // Eliminar meteoritos que salen de pantalla
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

// Activar la invisibilidad cada 5 segundos SOLO en fase 2
setInterval(() => {
  console.log(
    `⌛ Intervalo de invisibilidad ejecutado. Fase actual: ${boss.phase}`
  );
  if (boss && boss.phase === 2) {
    toggleBossInvisibility();
  }
}, 5000);

// Modificar la función drawBoss() para que no dibuje al jefe si es invisible
function drawBoss() {
  if (!boss) return;

  if (bossInvisible) {
    console.log("🚫 El jefe está invisible, no se dibuja.");
    return; // No dibujar si es invisible
  }

  ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);

  // Dibujar la barra de vida solo si el jefe es visible
  ctx.fillStyle = "red";
  ctx.fillRect(boss.x, boss.y - 10, boss.width, 5);
  ctx.fillStyle = "green";
  ctx.fillRect(boss.x, boss.y - 10, (bossHealth / 2500) * boss.width, 5);
}

let bossShootPatternCounter = 0; // Contador para alternar patrones de disparo
function bossAttack() {
  updateBossPhase();

  if (boss.phase === 1) {
    shootWavePattern();
  } else if (boss.phase === 2) {
    // No dispara láser ni bolas de energía
  } else {
    shootSpiral(); // Dispara láser en la fase 3
  }
}
let currentPhase = 1; // Inicia en fase 1

function updateBossPhase() {
  console.log(
    `📢 Verificando fase del jefe. Vida: ${bossHealth}, Fase actual: ${currentPhase}`
  );

  if (bossHealth > 2000) {
    if (currentPhase !== 1) {
      currentPhase = 1;
      currentBackground = backgroundPhase1;
      console.log("⚔️ El jefe está en la fase 1");
    }
  } else if (bossHealth <= 2000 && bossHealth > 1000) {
    if (currentPhase !== 2) {
      saveCheckpoint(2);
      showCheckpointMessage(
        "Checkpoint alcanzado: ¡El jefe ahora es invisible!"
      );
      currentPhase = 2;
      currentBackground = backgroundPhase2;
      bossLaser.active = false;
      bossLaser.charging = false;
      console.log("✅ Fase 2 establecida correctamente");
    }
  } else {
    if (currentPhase !== 3) {
      saveCheckpoint(3);
      showCheckpointMessage("Checkpoint alcanzado: ¡FASE FINAL!");
      transitionToPhase3();
      currentPhase = 3;
      currentBackground = backgroundPhase3;
      bossLaser.active = false;
      bossLaser.charging = false;
      console.log("🌑 El jefe ha entrado en la fase 3");

      // ✅ Activar lluvia de meteoritos por 4 segundos cada 4 segundos
      setInterval(() => {
        if (boss.phase === 3) {
          startMeteorRain();
          setTimeout(() => {
            stopMeteorRain(); // Asegúrate de que esta función existe para detener la lluvia
          }, 4000);
        }
      }, 8000); // Se reanuda cada 4 segundos después de detenerse

      // ✅ Activar misiles que rebotan cada 2 segundos
      setInterval(() => {
        if (boss.phase === 3) {
          spawnBouncingMissile();
        }
      }, 2000);
    }
  }
}
function spawnBouncingMissile() {
  console.log("💥 Generando misil rebotante en fase 3");

  let missile = {
    x: Math.random() * (canvas.width - 40), // Posición aleatoria en el ancho
    y: -50, // Aparece fuera de la pantalla
    width: 15,
    height: 30,
    dx: (Math.random() - 0.5) * 2, // Movimiento lateral leve
    dy: 2, // Velocidad inicial de caída
    gravity: 0.5, // Aceleración de caída
    bounce: 3, // Cantidad de rebotes antes de explotar
    type: "bouncingMissile",
    exploded: false, // Estado de explosión
  };

  bossProjectiles.push(missile);
}
function spawnMiniMissilesAlternating(x, y) {
  console.log("🔥 Generando mini-misiles en parábola alterna!");

  let numMissiles = 4; // Número de mini-misiles
  let speed = 4; // Velocidad inicial
  let angleOffset = Math.PI / 6; // Ángulo de dispersión

  for (let i = 0; i < numMissiles; i++) {
    let angle = -Math.PI / 2 + angleOffset * (i - numMissiles / 2); // Distribuir en abanico alterno

    bossProjectiles.push({
      x: x,
      y: y,
      width: 7,
      height: 7,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      gravity: 0.3,
      lifetime: 100, // Se eliminan tras un tiempo
      type: "miniMissile",
      exploded: false,
    });
  }
}

function spawnMiniMissiles(x, y) {
  console.log("🔥 Mini-misiles en parábola!");

  let numMissiles = 4; // Número de mini-misiles
  let speed = 4; // Velocidad inicial
  let angleOffset = Math.PI / 6; // Ángulo de dispersión

  for (let i = 0; i < numMissiles; i++) {
    let angle = -Math.PI / 2 + angleOffset * (i - numMissiles / 2); // Distribuir en abanico

    bossProjectiles.push({
      x: x,
      y: y,
      width: 7,
      height: 7,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      gravity: 0.3,
      lifetime: 100, // Se eliminan tras un tiempo
      exploded: false,
    });
  }
}

let checkpointMessage = "";
let checkpointMessageTimer = 0;

function showCheckpointMessage(message) {
  checkpointMessage = message;
  checkpointMessageTimer = 300; // Duración de 5 segundos en lugar de 3
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
// Alternar el estado del escudo cada 5 segundos solo en fases 1 y 3
setInterval(() => {
  if (boss.phase === 1 || boss.phase === 3) {
    bossShield.active = !bossShield.active;
  } else {
    bossShield.active = false; // ❌ Apagar el escudo en fase 2
  }
}, 5000);

// Dibujar el escudo del jefe
// Dibujar el escudo del jefe
function drawBossShield() {
  if (bossShield.active) {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"; // Borde rojo semi-transparente
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // Relleno rojo más transparente
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.arc(
      boss.x + boss.width / 2, // Centrar en la nave
      boss.y + boss.height / 2,
      Math.max(boss.width, boss.height) / 1.5, // Ajustar el tamaño del escudo
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
  }
}

function shootWavePattern() {
  const startX = boss.x + boss.width / 2;
  const startY = boss.y + boss.height;
  const offset = 35; // Separación entre disparos

  for (let i = -2; i <= 2; i++) {
    bossProjectiles.push({
      x: startX + i * offset,
      y: startY,
      dx: Math.cos(i * 0.5) * 2, // 🔄 Movimiento en onda
      dy: 5,
      width: 22,
      height: 22,
      waveAngle: Math.random() * Math.PI, // 🔄 Ángulo inicial de oscilación
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

// Función para iniciar la transición a la fase 3 con oscuridad progresiva
function transitionToPhase3() {
  gameState.transitioning = true;
  let energyFlash = 1; // Intensidad del destello
  let shakeIntensity = 10; // Intensidad del temblor
  let shakeDuration = 15; // Tiempo que dura el temblor (frames)

  clearAllIntervals(); // ✅ Limpia efectos previos

  console.log("⚡ Iniciando transición a fase 3 con explosión de energía...");

  // ✨ Efecto de destello progresivo
  let flashInterval = setInterval(() => {
    energyFlash -= 0.1;
    if (energyFlash <= 0) {
      clearInterval(flashInterval);
      energyFlash = 0; // Detener el destello
    }
  }, 100);

  // 🌍 Efecto de temblor
  let shakeInterval = setInterval(() => {
    if (shakeDuration > 0) {
      shakeIntensity = shakeIntensity * 0.9; // Disminuir temblor progresivamente
      shakeDuration--;
    } else {
      clearInterval(shakeInterval);
      shakeIntensity = 0; // Detener temblor
      boss.phase = 3; // Activar la nueva fase
      gameState.transitioning = false;
      console.log("🔥 Fase 3 activada con efecto de energía.");
    }
  }, 100);

  // 🎨 Agregar efecto de destello en la pantalla
  function drawEnergyFlash() {
    if (energyFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 100, ${energyFlash})`; // Luz amarilla
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ✨ Inyectar el temblor en `updateGameArea()`
  function applyShakeEffect() {
    if (shakeIntensity > 0) {
      ctx.translate(
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity
      );
    }
  }

  // 🎥 Modificar `updateGameArea` para incluir estos efectos
  let originalUpdate = updateGameArea;
  updateGameArea = function () {
    ctx.save();
    applyShakeEffect();
    originalUpdate();
    drawEnergyFlash();
    ctx.restore();
  };
}

function clearAllIntervals() {
  clearInterval(meteorRainInterval); // 🌧️ Lluvia de meteoritos
  // Añadir cualquier otro intervalo global que tengas
}

function updateBossProjectiles() {
  bossProjectiles.forEach((projectile, index) => {
    if (!projectile || !projectile.type) return; // 🔥 Evitar errores si está indefinido

    // 🌊 Movimiento en onda para energyBall en fase 1
    if (boss.phase === 1 && projectile.type === "energyBall") {
      projectile.waveAngle += 0.1;
      projectile.x += Math.sin(projectile.waveAngle) * 2;

      if (checkBarrierCollision(projectile)) {
        applyParabolicBounce(projectile);
      } else {
        projectile.dy += 0.2;
      }
    }

    // 🚀 Lógica de misiles teledirigidos en fase 2
    if (boss.phase === 2 && projectile.type === "missile") {
      let angleToTarget = Math.atan2(
        monkey.y - projectile.y,
        monkey.x - projectile.x
      );
      let currentAngle = Math.atan2(projectile.dy, projectile.dx);

      if (Math.abs(angleToTarget - currentAngle) > projectile.turnRate) {
        currentAngle +=
          Math.sign(angleToTarget - currentAngle) * projectile.turnRate;
      } else {
        currentAngle = angleToTarget;
      }

      projectile.dx = Math.cos(currentAngle) * projectile.speed;
      projectile.dy = Math.sin(currentAngle) * projectile.speed;

      if (projectile.speed < 4) {
        projectile.speed += 0.02;
      }
    }

    // 🚀 💥 Misiles con rebote en fase 3
    if (boss.phase === 3 && projectile.type === "bouncingMissile") {
      projectile.dy += projectile.gravity; // Aplicar gravedad
      projectile.x += projectile.dx;
      projectile.y += projectile.dy;

      // 🌍 Rebote en el suelo
      if (projectile.y + projectile.height >= canvas.height) {
        if (projectile.bounce > 0) {
          projectile.y = canvas.height - projectile.height; // Evitar que atraviese el suelo
          projectile.dy *= -0.6; // Reducir velocidad tras el rebote
          projectile.bounce--;

          // 💥 Generar mini-misiles en el PRIMER rebote
          if (projectile.bounce === 2) {
            spawnMiniMissilesAlternating(projectile.x, projectile.y);
          }
        } else {
          projectile.exploded = true;
          bossProjectiles.splice(index, 1);
          return;
        }
      }
    }

    // 📌 Movimiento de proyectiles
    projectile.x += projectile.dx;
    projectile.y += projectile.dy;

    // 🔴 Verificar colisión con el mono y eliminar misil si impacta
    if (
      projectile.type &&
      projectile.type.includes("missile") &&
      monkey.x + monkey.width > projectile.x &&
      monkey.x < projectile.x + projectile.width &&
      monkey.y + monkey.height > projectile.y &&
      monkey.y < projectile.y + projectile.height
    ) {
      loseLife();
      bossProjectiles.splice(index, 1);
      return;
    }

    // ❌ Eliminar proyectiles fuera de pantalla
    if (
      projectile.y > canvas.height + 50 ||
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
      // 🌊 Dibujar bolas de energía
      ctx.drawImage(
        energyBallImage,
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
      );
    } else if (projectile.type === "missile") {
      // 🚀 Dibujar misiles teledirigidos
      ctx.drawImage(
        missileImage,
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
      );
    } else if (projectile.type === "bouncingMissile") {
      // 💥 Misiles rebotantes de la fase 3
      ctx.drawImage(
        missileImage,
        projectile.x,
        projectile.y,
        projectile.width,
        projectile.height
      );

      // 🌀 Efecto de humo en misiles rebotantes
      ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
      ctx.beginPath();
      ctx.arc(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height,
        8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (projectile.type === "miniMissile") {
      // 🔥 Mini-misiles en parábola tras explosión
      ctx.drawImage(
        missileImage,
        projectile.x,
        projectile.y,
        projectile.width * 0.7,
        projectile.height * 0.7
      );

      // 💨 Pequeño efecto de fuego tras los mini-misiles
      ctx.fillStyle = "rgba(255, 100, 0, 0.8)";
      ctx.beginPath();
      ctx.arc(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height,
        5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}

// Función para generar meteoritos horizontales dentro del lienzo y desde la mitad inferior
function spawnHorizontalMeteorite() {
  horizontalMeteorites.push({
    x: Math.random() < 0.5 ? -40 : canvas.width + 40,
    y: Math.random() * canvas.height,
    width: 25,
    height: 25,
    speed: horizontalMeteorSpeed * (Math.random() < 0.5 ? 1 : -1),
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
      if (bossInvisible) return; // No recibe daño si es invisible
      if (!bossShield.active) {
        // Solo recibe daño si el escudo está desactivado
        bossHealth -= 10;
        addExplosion(projectile.x, projectile.y);

        if (bossHealth <= 0) {
          bossHealth = 0;
          gameOver = true; // 🔐 Bloquea el input y el updateGameArea
          cancelAnimationFrame(animationFrameId); // 🔴 Detiene el game loop
          startBossCrashSequence(); // 🎥 Lanza la cinemática
          openLevelModal(); // Abre el selector de niveles otra vez
          removeCheckpoint(); // Elimina el checkpoint
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
      loseLife();
      bossProjectiles.splice(index, 1);
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
  randomMeteorites.forEach((meteor, index) => {
    if (
      monkey.x + monkey.width > meteor.x &&
      monkey.x < meteor.x + meteor.width &&
      monkey.y + monkey.height > meteor.y &&
      monkey.y < meteor.y + meteor.height
    ) {
      if (!shieldActive) {
        // Si el escudo NO está activo, pierdes vida
        loseLife();
      }
      randomMeteorites.splice(index, 1); // Eliminar meteorito tras colisión
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
    ctx.fillText(
      "¡Escudo recogido! Presiona 'E' para activarlo.",
      canvas.width / 2 - 180,
      50
    );
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

  if (!flyingMode) {
    // Solo aplicar gravedad si no está volando
    if (monkey.y + monkey.height < canvas.height) {
      monkey.dy += gravity;
    } else {
      monkey.y = canvas.height - monkey.height;
      monkey.dy = 0;
      monkey.jumping = false;
      jumpCount = 0;
    }
  }

  // Limitar el movimiento horizontal
  if (monkey.x < 0) {
    monkey.x = 0;
  } else if (monkey.x + monkey.width > canvas.width) {
    monkey.x = canvas.width - monkey.width;
  }

  // Limitar el movimiento vertical (opcional si quieres)
  if (monkey.y < 0) {
    monkey.y = 0;
  } else if (monkey.y + monkey.height > canvas.height) {
    monkey.y = canvas.height - monkey.height;
  }
}

function drawMonkey() {
  ctx.drawImage(monkeyImage, monkey.x, monkey.y, monkey.width, monkey.height);
}

/// Función para actualizar el estado del láser del jefe
function updateBossLaser() {
  if (boss.phase !== 1) return; // ❌ Solo permitir el láser en fase 1

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

function showGameOverModal() {
  // Detener la animación del juego
  gameOver = true;
  cancelAnimationFrame(animationFrameId);
  bossMusic.pause(); // Detener la música del jefe si está sonando

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
function startBossCrashSequence() {
  gameOver = true;
  bossMusic.pause();

  let crashY = boss.y;
  let smokeParticles = [];
  let crashed = false; // Indica si ya tocó el suelo
  let crashAngle = 0; // Sin rotación inicial

  const crashInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);

    drawMonkey();
    drawPlatform();
    drawTopPlatform();
    drawBarriers();
    drawShieldItem();
    drawFragments();
    drawLives();

    // 🔥 Humo rojo mientras cae
    for (let i = 0; i < 3; i++) {
      smokeParticles.push({
        x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 60,
        y: crashY + boss.height - 10 + Math.random() * 10,
        opacity: 1,
        size: Math.random() * 15 + 10, // Humo más pequeño
        color: "rgba(255, 50, 50, 1)",
      });
    }

    smokeParticles.forEach((smoke, index) => {
      smoke.y += 0.5;
      smoke.opacity -= 0.015;
      if (smoke.opacity <= 0) smokeParticles.splice(index, 1);

      ctx.fillStyle = smoke.color.replace("1)", `${smoke.opacity})`);
      ctx.beginPath();
      ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!crashed) {
      crashY += 2;
    }

    if (crashY >= canvas.height - boss.height - 10) {
      crashY = canvas.height - boss.height - 10;
      crashed = true;
      crashAngle = Math.PI / 6; // 🔄 Inclinar la nave al chocar
      clearInterval(crashInterval);
      startBigExplosionEffect();
    }

    // 🔄 Dibujar nave (sin rotar si aún no chocó)
    ctx.save();
    ctx.translate(boss.x + boss.width / 2, crashY + boss.height / 2);
    ctx.rotate(crashAngle);
    ctx.drawImage(
      bossImage,
      -boss.width / 2,
      -boss.height / 2,
      boss.width,
      boss.height
    );
    ctx.restore();
  }, 16);
}

function startBigExplosionEffect() {
  let explosionParticles = [];
  let explosionTimer = 60;

  for (let i = 0; i < 40; i++) {
    explosionParticles.push({
      x: boss.x + boss.width / 2,
      y: canvas.height - boss.height / 3,
      dx: (Math.random() - 0.5) * 10,
      dy: (Math.random() - 0.5) * 10,
      size: Math.random() * 40 + 15,
      opacity: 1,
      color:
        Math.random() > 0.5 ? "rgba(255, 69, 0, 1)" : "rgba(255, 255, 0, 1)",
    });
  }

  const explosionInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);

    drawMonkey();
    drawPlatform();
    drawTopPlatform();
    drawBarriers();
    drawShieldItem();
    drawFragments();
    drawLives();

    // 🔄 Redibujar nave inclinada
    ctx.save();
    ctx.translate(boss.x + boss.width / 2, canvas.height + boss.height / 4);

    ctx.rotate(Math.PI / 6);
    ctx.drawImage(
      bossImage,
      -boss.width / 2,
      -boss.height / 2,
      boss.width,
      boss.height
    );
    ctx.restore();

    explosionParticles.forEach((particle, index) => {
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.opacity -= 0.02;
      if (particle.opacity <= 0) explosionParticles.splice(index, 1);

      ctx.fillStyle = particle.color.replace("1)", `${particle.opacity})`);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    explosionTimer--;
    if (explosionTimer <= 0) {
      clearInterval(explosionInterval);
      startHeavySmokeEffect();
    }
  }, 30);
}

function startHeavySmokeEffect() {
  let smokeParticles = [];
  let smokeTimer = 200; // Más duración para que sea constante

  const smokeInterval = setInterval(() => {
    for (let i = 0; i < 3; i++) {
      smokeParticles.push({
        x: boss.x + boss.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height - 40 + Math.random() * 20,
        opacity: 1,
        size: Math.random() * 20 + 10, // Humo más pequeño
        color: "rgba(150, 150, 150, 1)", // Gris medio
      });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);

    drawMonkey();
    drawPlatform();
    drawTopPlatform();
    drawBarriers();
    drawShieldItem();
    drawFragments();
    drawLives();

    // 🔄 Redibujar nave inclinada
    ctx.save();
    ctx.translate(boss.x + boss.width / 2, canvas.height + boss.height / 4);

    ctx.rotate(Math.PI / 6);
    ctx.drawImage(
      bossImage,
      -boss.width / 2,
      -boss.height / 2,
      boss.width,
      boss.height
    );
    ctx.restore();

    smokeParticles.forEach((smoke, index) => {
      smoke.y -= 0.5;
      smoke.opacity -= 0.008; // Desvanecimiento más lento
      if (smoke.opacity <= 0) smokeParticles.splice(index, 1);

      ctx.fillStyle = smoke.color.replace("1)", `${smoke.opacity})`);
      ctx.beginPath();
      ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
      ctx.fill();
    });

    smokeTimer--;
    if (smokeTimer <= 0) {
      clearInterval(smokeInterval);
      startMonkeyWalkToCenter();
    }
  }, 30);
}
const monjeyImage = new Image();
monjeyImage.src = "img/monjeyF2.png";

function drawMonkeyAt(x, y) {
  ctx.drawImage(monjeyImage, x, y, 60, 60); // Usamos la mona correcta
}

function startMonkeyWalkToCenter() {
  let monkeyX = canvas.width + 50; // Empieza fuera de la pantalla derecha
  const targetX = canvas.width / 2 - 30; // Centro de la pantalla

  const walkInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);
    drawMonkey();
    drawPlatform();
    drawTopPlatform();
    drawBarriers();
    drawShieldItem();
    drawLives();

    // 🔄 Redibujar nave destruida con humo
    ctx.save();
    ctx.translate(boss.x + boss.width / 2, canvas.height + boss.height / 4);

    ctx.rotate(Math.PI / 6);
    ctx.drawImage(
      bossImage,
      -boss.width / 2,
      -boss.height / 2,
      boss.width,
      boss.height
    );
    ctx.restore();

    // 🐵 Dibujar la mona caminando
    drawMonkeyAt(monkeyX, canvas.height - 70);
    monkeyX -= 2; // Movimiento hacia el centro

    if (monkeyX <= targetX) {
      clearInterval(walkInterval);
      showVictoryText();
    }
  }, 16);
}

function showVictoryText() {
  const bossMessageImage = new Image();
  bossMessageImage.src = "img/villano.png"; // 📌 Imagen del boss riendo (ajusta el nombre)

  const message = "¡Jajajaja! Esto no acaba aquí, ¡Ya volveré...!"; // Texto del boss
  let opacity = 0; // Efecto de aparición gradual
  let fadeIn = true; // Para manejar la aparición del mensaje

  const messageInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);
    drawMonkey();
    drawPlatform();
    drawTopPlatform();
    drawBarriers();
    drawShieldItem();
    drawFragments();
    drawLives();

    // 🔄 Redibujar nave destruida con humo constante
    ctx.save();
    ctx.translate(boss.x + boss.width / 2, canvas.height + boss.height / 4);

    ctx.rotate(Math.PI / 6);
    ctx.drawImage(
      bossImage,
      -boss.width / 2,
      -boss.height / 2,
      boss.width,
      boss.height
    );
    ctx.restore();

    drawMonkeyAt(canvas.width / 2 - 30, canvas.height - 80); // Mona en el centro

    // 📌 Mostrar imagen del boss en la parte superior
    ctx.globalAlpha = opacity;
    ctx.drawImage(bossMessageImage, canvas.width / 2 - 75, 20, 150, 150);
    ctx.globalAlpha = 1;

    // 📌 Mostrar texto debajo del boss
    ctx.font = "24px Arial";
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, 200);

    // ⚡ Efecto de aparición y desaparición gradual
    if (fadeIn) {
      opacity += 0.05;
      if (opacity >= 1) fadeIn = false;
    } else {
      opacity -= 0.01;
    }

    if (opacity <= 0) {
      clearInterval(messageInterval);
      setTimeout(showVictory, 1000); // Luego de mostrar el mensaje, ejecuta la victoria
    }
  }, 50);
}
const victoryMusic = new Audio("../audio/victory.mp3");
victoryMusic.volume = 0.5;
function showVictory() {
  console.log("Ejecutando showVictory()"); // Depuración
  gameOver = true;
  removeCheckpoint(); // Eliminar checkpoint al ganar
  bossMusic.pause();
  victoryMusic.play(); // Reproducir música de victoria

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
  messageElement.innerText =
    "🎉 ¡Lo lograstes... Ya eres libre, de momento...!";
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
