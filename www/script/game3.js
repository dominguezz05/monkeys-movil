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
// Array de imágenes de fondo
const backgrounds = [
  "img/level3/2.1.webp", // Imagen de fondo para nivel 1
  "img/level3/2.2.webp", // Imagen de fondo para nivel 2
  "img/level3/2.3.webp", // Imagen de fondo para nivel 3
  "img/level3/2.4.webp", // Imagen de fondo para nivel 4
  "img/level3/2.5.webp", // Imagen de fondo para nivel 5
  "img/level3/2.6.webp", // Imagen de fondo para nivel 6
  "img/level3/2.7.webp", // Imagen de fondo para nivel 7
];

// Cargar las imágenes
const monkeyImage = new Image();
monkeyImage.src = "img/mono3.png";

const bananaImage = new Image();
bananaImage.src = "img/banana.png";

const rightImage = new Image();
rightImage.src = "img/mono32.png"; // Imagen para derecha

const leftImage = new Image();
leftImage.src = "img/mono31.png"; // Imagen para izquierda

const upImage = new Image();
upImage.src = "img/mono3.png"; // Imagen para arriba

const enemyImage = new Image();
enemyImage.src = "img/meteorito.png"; // Imagen de meteorito

const shieldImage = new Image();
shieldImage.src = "img/escudo.png"; // Imagen del escudo

const heartImage = new Image();
heartImage.src = "img/heart-png.webp"; // Imagen de corazón

// Variables del juego
const gravity = 0.65;
let levelUpTime = 0; // Variable para controlar el tiempo del mensaje de nivel
let gameOver = false;
let score = 0;
let level = 1;
let bananaFallSpeed = 3; // Velocidad inicial de caída de los plátanos
let enemyFallSpeed = 2; // Velocidad inicial de caída de los enemigos
let enemySpawnRate = 0.04; // Aumenta para generar más meteoritos

let backgroundColor = "#87CEEB"; // Fondo inicial

let canShoot = true; // Controla si el jugador puede disparar
let projectiles = []; // Array para almacenar los proyectiles
let shields = []; // Array para almacenar escudos
let shieldActive = false;
let shieldTime = 0; // Para controlar la duración del escudo
const shieldDuration = 5000; // Duración del escudo en milisegundos (5 segundos)
let lastShieldTime = 0; // Para controlar el tiempo de aparición de los escudos
let shieldRadius = 0; // Radio del círculo de escudo alrededor del mono
let jumpCount = 0; // Contador de saltos

// Inicializa el fondo con la primera imagen
let backgroundImage = new Image();
backgroundImage.src = backgrounds[0];

let lives = 0; // Contador de vidas extra
let hearts = []; // Array para los corazones
let lastHeartTime = 0; // Control del tiempo para generar vidas extra

let bgMusic = new Audio("audio/level3/8bits2.mp3");
bgMusic.loop = true; // Repetir música
bgMusic.play(); // Reproducir música al inicio

let bgMusicRate = 1; // Velocidad inicial de la música

// Plátanos
let bananas = [];

// Enemigos
let enemies = [];

// Control de teclas
const keys = {
  right: false,
  left: false,
  up: false,
};

// Jugador (Mono)
const monkey = {
  x: 100,
  y: canvas.height - 70,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
  dy: 0,
  jumpPower: -12,
  jumping: false,
  hasShield: false, // Variable para controlar si el mono tiene escudo
  hasHeart: false, // Variable para controlar si el mono tiene corazón
};
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
let isPaused = false; // Variable para controlar el estado del juego
let animationFrameId; // ID de la animación para pausarla

// Seleccionar elementos del DOM
const pauseButton = document.getElementById("pauseButton");
const pauseModal = document.getElementById("pauseModal");
const resumeButton = document.getElementById("resumeButton");
// Seleccionar el botón de volver al menú
const menuButton = document.getElementById("menuButton");

// Manejar el evento de clic en el botón de volver al menú
menuButton.addEventListener("click", () => {
  window.location.href = "index.html"; // Redirigir al menú principal
});

// Función para pausar el juego
function pauseGame() {
  isPaused = true;
  cancelAnimationFrame(animationFrameId); // Detener la animación
  bgMusic.pause(); // Pausar la música
  pauseModal.classList.remove("hidden"); // Mostrar el modal
}

// Función para reanudar el juego

function resumeGame() {
  pauseModal.classList.add("hidden"); // Ocultar el modal
  isPaused = false; // Salir del estado de pausa
  bgMusic.play(); // Reanudar la música
  updateGameArea(); // Reanudar la animación del juego
}
// Función para alternar entre pausar y reanudar el juego
function togglePause() {
  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

// Evento para el botón de pausa
pauseButton.addEventListener("click", pauseGame);

// Evento para el botón de reanudar
resumeButton.addEventListener("click", resumeGame);

// Evento para la tecla "P" (sin importar mayúscula o minúscula)
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "p") {
    togglePause();
  }
});

function updateGameArea() {
  if (isPaused || gameOver) return; // Detener si el juego está en pausa o ha terminado

  // Dibujar fondo
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  moveMonkey();
  updateBananas();
  updateEnemies();
  updateProjectiles();
  updateShield();
  updateShields();
  checkCollisions();
  checkLevelUp();
  updateHearts();

  drawMonkey();
  drawBananas();
  drawEnemies();
  drawProjectiles();
  drawShields();
  drawHearts();
  drawScore();
  drawObjective();

  // Continuar la animación si no ha terminado
  animationFrameId = requestAnimationFrame(updateGameArea);
}

// Crear escudos
function generateShield() {
  const x = Math.floor(Math.random() * canvas.width);
  const y = -30; // Los escudos aparecerán fuera de la pantalla
  shields.push({ x, y });
}

// Dibuja escudos
function drawShields() {
  shields.forEach((shield, index) => {
    ctx.drawImage(shieldImage, shield.x, shield.y, 30, 30);
    shield.y += enemyFallSpeed; // Velocidad de caída de los escudos
    if (shield.y > canvas.height) {
      shields.splice(index, 1); // Eliminar escudo cuando sale de la pantalla
    }
  });
}

function updateShields() {
  const currentTime = Date.now(); // Obtener el tiempo actual

  // Generar escudo cada 10 segundos
  if (currentTime - lastShieldTime > 25000) {
    generateShield();
    lastShieldTime = currentTime; // Actualizar el tiempo del último escudo generado
  }

  // Actualizar posición de los escudos existentes
  shields.forEach((shield, index) => {
    ctx.drawImage(shieldImage, shield.x, shield.y, 40, 40);
    shield.y += enemyFallSpeed; // Velocidad de caída del escudo

    // Eliminar escudo si sale de la pantalla
    if (shield.y > canvas.height) {
      shields.splice(index, 1);
    }
  });
}
function updateShield() {
  if (shieldActive) {
    const timeElapsed = Date.now() - shieldTime;

    // Desactivar el escudo después de 40 segundos
    if (timeElapsed > 40000) {
      shieldActive = false;
      monkey.hasShield = false;
      console.log("Escudo desactivado tras 40 segundos.");
    } else if (timeElapsed > 35000) {
      // Parpadeo en los últimos 5 segundos
      const blink = Math.floor((timeElapsed - 35000) / 100) % 2 === 0; // Alternar cada 100 ms
      if (blink) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"; // Color del escudo (parpadeo rojo)
      } else {
        ctx.strokeStyle = "rgba(255, 255, 0, 0.7)"; // Color del escudo (parpadeo amarillo)
      }
      ctx.lineWidth = 8; // Aumentar el grosor para resaltar el parpadeo
      ctx.beginPath();
      ctx.arc(
        monkey.x + monkey.width / 2,
        monkey.y + monkey.height / 2,
        monkey.width / 2 + 20, // Radio del escudo (ligeramente más grande)
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else {
      // Escudo estático antes de los últimos 5 segundos
      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"; // Color verde claro
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(
        monkey.x + monkey.width / 2,
        monkey.y + monkey.height / 2,
        monkey.width / 2 + 20, // Radio del escudo
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }
}

function generateHeart() {
  const x = Math.floor(Math.random() * canvas.width);
  const y = -30; // Los corazones aparecerán fuera de la pantalla, cerca de la parte superior
  hearts.push({ x, y });
  console.log("Generando un corazón en:", { x, y });
}

function updateHearts() {
  const currentTime = Date.now(); // Obtener el tiempo actual

  // Generar corazón cada 10 segundos
  if (currentTime - lastHeartTime > 25000) {
    generateHeart();
    lastHeartTime = currentTime; // Actualizar el tiempo del último corazón generado
  }

  // Actualizar posición de los corazones existentes
  hearts.forEach((heart, index) => {
    ctx.drawImage(heartImage, heart.x, heart.y, 30, 30);
    heart.y += enemyFallSpeed; // Velocidad de caída del corazón

    // Comprobar colisión con el mono
    if (
      heart.x < monkey.x + monkey.width &&
      heart.x + 30 > monkey.x &&
      heart.y < monkey.y + monkey.height &&
      heart.y + 30 > monkey.y
    ) {
      hearts.splice(index, 1); // Eliminar el corazón del juego
      lives++; // Incrementar vidas extra
    }

    // Eliminar corazones que salgan de la pantalla
    if (heart.y > canvas.height) {
      hearts.splice(index, 1);
    }
  });
}

// Dibujar los corazones (vidas extra) cerca del mono
function drawHearts() {
  for (let i = 0; i < lives; i++) {
    ctx.drawImage(heartImage, monkey.x + 50 + i * 20, monkey.y, 20, 20);
  }
}

// Limpiar la pantalla y aplicar un color de fondo
function clearCanvas() {
  ctx.fillStyle = backgroundColor; // Usar el fondo dinámico
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function checkLevelUp() {
  if (score >= level * 150) {
    level++;
    bananaFallSpeed += 0.8; // Aumenta la velocidad de caída de los plátanos

    // Acelera la música al subir de nivel
    bgMusicRate += 0.1; // Aumenta la velocidad
    bgMusic.playbackRate = bgMusicRate; // Aplica la velocidad

    // Cambiar el fondo a la imagen correspondiente según el nivel
    if (level - 1 < backgrounds.length) {
      backgroundImage.src = backgrounds[level - 1];
    }
  }
  if (score >= 1000) {
    gameOver = true; // Detener el juego
    showVictoryModal(); // Mostrar el modal de victoria
    desbloquearNivel(3); // Desbloquear nivel 4 (índice 3)
  }
}

// Función para disparar proyectiles
function shootProjectile() {
  if (canShoot) {
    shootSound.play(); // Reproducir el sonido al disparar
    const x = monkey.x + monkey.width / 2 - 5; // Posición inicial de disparo (centrado con el mono)
    const y = monkey.y - 10; // Posición por encima del mono
    projectiles.push({ x, y, width: 10, height: 20, speed: 7 }); // Crear un proyectil
    canShoot = false; // Bloquear disparos hasta que se suelte la tecla
  }
}

function updateProjectiles() {
  projectiles.forEach((projectile, index) => {
    projectile.y -= projectile.speed; // Mover el proyectil hacia arriba
    if (projectile.y < 0) {
      projectiles.splice(index, 1); // Eliminar proyectil cuando sale de la pantalla
    }
  });
}

function drawProjectiles() {
  projectiles.forEach((projectile) => {
    ctx.fillStyle = "red"; // Color de los proyectiles
    ctx.fillRect(
      projectile.x,
      projectile.y,
      projectile.width,
      projectile.height
    );
  });
}

//  r el mono y actualizar la imagen activa
function moveMonkey() {
  // Si la tecla derecha es presionada
  if (keys.right) {
    monkey.dx = monkey.speed;
  }
  // Si la tecla izquierda es presionada
  else if (keys.left) {
    monkey.dx = -monkey.speed;
  }
  // Si la tecla arriba es presionada
  else if (keys.up && !monkey.jumping) {
    monkey.dy = monkey.jumpPower;
    monkey.jumping = true;
  }
  // Si ninguna tecla es presionada
  else {
    monkey.dx = 0;
  }

  monkey.y += monkey.dy;
  monkey.x += monkey.dx;

  // Evitar que el mono salga del lienzo
  if (monkey.x < 0) monkey.x = 0;
  if (monkey.x + monkey.width > canvas.width)
    monkey.x = canvas.width - monkey.width;

  if (monkey.y + monkey.height >= canvas.height) {
    monkey.y = canvas.height - monkey.height;
    monkey.dy = 0;
    jumpCount = 0; // Resetear contador de saltos
  } else {
    monkey.dy += gravity;
  }
}
// Detectar teclas presionadas
document.addEventListener("keydown", function (e) {
  const key = e.key.toLowerCase(); // Convertir la tecla a minúscula
  if (key === "d") keys.right = true;
  if (key === "a") keys.left = true;
  if (key === "w" && jumpCount < 2) {
    // Permitir hasta dos saltos consecutivos
    monkey.dy = monkey.jumpPower;
    jumpCount++;
  }
  if (key === " " && canShoot) {
    shootProjectile(); // Disparar solo si es posible
  }
});

// Detectar teclas soltadas
document.addEventListener("keyup", function (e) {
  const key = e.key.toLowerCase(); // Convertir la tecla a minúscula
  if (key === "d") keys.right = false;
  if (key === "a") keys.left = false;
  if (key === "w") keys.up = false;
  if (key === " ") {
    canShoot = true; // Permitir disparar nuevamente al soltar la tecla
  }
});

// Función para agregar el círculo alrededor del mono cuando tiene escudo
function drawMonkey() {
  let currentImage = monkeyImage;

  // Determina la imagen activa según la tecla presionada
  if (keys.right) currentImage = rightImage;
  if (keys.left) currentImage = leftImage;
  if (keys.up && !monkey.jumping) currentImage = upImage;

  ctx.drawImage(currentImage, monkey.x, monkey.y, monkey.width, monkey.height);

  // Si el escudo está activo, dibuja el escudo alrededor del mono
  if (shieldActive) {
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"; // Color del escudo (verde)
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(
      monkey.x + monkey.width / 2,
      monkey.y + monkey.height / 2,
      monkey.width / 2 + 10, // Tamaño del escudo (un poco más grande que el mono)
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Si el mono tiene el escudo, dibuja un círculo alrededor de él
  if (monkey.hasShield) {
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      monkey.x + monkey.width / 2,
      monkey.y + monkey.height / 2,
      40, // Radio del círculo alrededor del mono
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

// Crear plátanos
function generateBanana() {
  const x = Math.floor(Math.random() * canvas.width);
  const y = -30; // Los plátanos aparecerán fuera de la pantalla
  bananas.push({ x, y });
}

// Dibuja plátanos como imágenes
function drawBananas() {
  bananas.forEach((banana, index) => {
    ctx.drawImage(bananaImage, banana.x, banana.y, 20, 20);
    banana.y += bananaFallSpeed; // Velocidad de caída de los plátanos
    if (banana.y > canvas.height) {
      bananas.splice(index, 1); // Eliminar plátano cuando sale de la pantalla
    }
  });
}

// Actualiza los plátanos
function updateBananas() {
  if (Math.random() < 0.02) {
    generateBanana(); // Probabilidad de generar un plátano
  }
}
function generateEnemy() {
  const x = Math.random() * canvas.width; // Posición aleatoria horizontal

  const y = -30; // Empieza fuera del lienzo
  const size = Math.random() * 2 + 1; // Tamaño aleatorio entre 1 y 3
  const speed = enemyFallSpeed + Math.random() * 2; // Velocidad aleatoria
  enemies.push({ x, y, size, speed }); // Agregar meteorito al array
}

// Dibuja meteoritos con tamaños aleatorios
function drawEnemies() {
  enemies.forEach((enemy, index) => {
    ctx.drawImage(
      enemyImage,
      enemy.x,
      enemy.y,
      22 * enemy.size,
      22 * enemy.size
    );
    enemy.y += enemy.speed; // Velocidad de caída de los meteoritos
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1); // Eliminar meteorito cuando sale de la pantalla
    }
  });
}

// Actualiza los enemigos
function updateEnemies() {
  if (Math.random() < enemySpawnRate) {
    const isDiagonal = Math.random() < 0.5; // 50% de probabilidad de diagonal
    if (isDiagonal) {
      generateDiagonalMeteorite();
    } else {
      generateEnemy();
    }
  }

  enemies.forEach((enemy, index) => {
    enemy.x += enemy.dx || 0; // Movimiento horizontal
    enemy.y += enemy.speed; // Movimiento vertical

    if (enemy.size > 1 && enemy.y > canvas.height) {
      explodeMeteorite(enemy); // Explosión para meteoritos grandes
      enemies.splice(index, 1); // Eliminar meteorito grande
    } else if (
      enemy.y > canvas.height ||
      enemy.x < 0 ||
      enemy.x > canvas.width
    ) {
      enemies.splice(index, 1); // Eliminar meteoritos que salen del lienzo
    }
  });
}
function generateDiagonalMeteorite() {
  const x = Math.random() * canvas.width;
  const y = -30;
  const dx = Math.random() < 0.5 ? 2 : -1.2; // Dirección horizontal aleatoria
  const speed = enemyFallSpeed + 0.5; // Velocidad de caída
  enemies.push({ x, y, dx, speed, size: 2 }); // Meteorito diagonal
}

function explodeMeteorite(enemy) {
  for (let i = 0; i < 3; i++) {
    const dx = (Math.random() - 0.5) * 4; // Movimiento horizontal aleatorio
    const dy = Math.random() * 2 + 2; // Movimiento vertical aleatorio
    enemies.push({
      x: enemy.x,
      y: enemy.y,
      dx,
      speed: dy,
      size: 1, // Fragmentos pequeños
    });
  }
}

function handleHeartLoss() {
  // Eliminar todos los elementos que están cayendo
  bananas = [];
  enemies = [];
  shields = [];
  hearts = [];

  // Pausar la actualización durante 8 segundo
  setTimeout(() => {
    console.log("Reanudar el juego después de perder un corazón.");
  }, 8000);
}

function checkCollisions() {
  // Verificar colisión con los plátanos y agregar puntos
  bananas.forEach((banana, index) => {
    if (
      banana.x < monkey.x + monkey.width &&
      banana.x + 20 > monkey.x &&
      banana.y < monkey.y + monkey.height &&
      banana.y + 20 > monkey.y
    ) {
      score += 10; // Aumentar el puntaje
      bananas.splice(index, 1); // Eliminar el plátano
    }
  });

  // Colisiones con meteoritos
  enemies.forEach((enemy, index) => {
    const meteorWidth = 22 * enemy.size * 0.8; // Ajuste de hitbox para mayor precisión
    const meteorHeight = 22 * enemy.size * 0.8;

    if (
      monkey.x + monkey.width * 0.2 < enemy.x + meteorWidth &&
      monkey.x + monkey.width * 0.8 > enemy.x &&
      monkey.y + monkey.height * 0.2 < enemy.y + meteorHeight &&
      monkey.y + monkey.height * 0.8 > enemy.y
    ) {
      if (monkey.hasShield) {
        monkey.hasShield = false;
        shieldActive = false;
        enemies.splice(index, 1);
        console.log("Escudo destruido por meteorito.");
      } else if (lives > 0) {
        lives--;
        enemies.splice(index, 1);
        handleHeartLoss();
      } else {
        endGame();
      }
    }
  });

  // Colisiones entre meteoritos y proyectiles
  projectiles.forEach((projectile, projIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (
        projectile.x < enemy.x + 30 * enemy.size &&
        projectile.x + projectile.width > enemy.x &&
        projectile.y < enemy.y + 30 * enemy.size &&
        projectile.y + projectile.height > enemy.y
      ) {
        enemies.splice(enemyIndex, 1); // Eliminar meteorito
        projectiles.splice(projIndex, 1); // Eliminar proyectil
        score += 1; // Puntos por destruir meteorito
      }
    });
  });

  // Verificar colisión con escudos (si el mono recoge un escudo)
  shields.forEach((shield, index) => {
    if (
      shield.x < monkey.x + monkey.width &&
      shield.x + 40 > monkey.x &&
      shield.y < monkey.y + monkey.height &&
      shield.y + 40 > monkey.y
    ) {
      if (!shieldActive) {
        monkey.hasShield = true; // Activar el escudo
        shieldActive = true; // Marcar el escudo como activo
        shieldTime = Date.now(); // Registrar el tiempo de activación
        shields.splice(index, 1); // Eliminar el escudo recogido
      }
    }
  });

  // Verificar colisión con corazones (si el mono recoge un corazón)
  hearts.forEach((heart, index) => {
    if (
      heart.x < monkey.x + monkey.width &&
      heart.x + 30 > monkey.x &&
      heart.y < monkey.y + monkey.height &&
      heart.y + 30 > monkey.y
    ) {
      if (lives < 3) {
        lives++; // Recuperar una vida
      }
      hearts.splice(index, 1); // Eliminar el corazón recogido
    }
  });
}

// Terminar el juego
function endGame() {
  gameOver = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";

  showGameOverModal();
}

function showGameOverModal() {
  // Detener el juego y la animación
  gameOver = true;
  bgMusic.pause(); // Pausar la música

  cancelAnimationFrame(animationFrameId);

  // Crear capa de fondo con la imagen
  const backgroundLayer = document.createElement("div");
  backgroundLayer.style.position = "fixed";
  backgroundLayer.style.top = "0";
  backgroundLayer.style.left = "0";
  backgroundLayer.style.width = "100%";
  backgroundLayer.style.height = "100%";
  backgroundLayer.style.backgroundImage = "url('img/hasperdido.png')"; // Imagen de fondo
  backgroundLayer.style.backgroundSize = "cover";
  backgroundLayer.style.backgroundPosition = "center";
  backgroundLayer.style.zIndex = "5000"; // Capa superior al canvas

  // Crear el modal
  const modal = document.createElement("div");
  modal.style.position = "absolute";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.padding = "30px";
  modal.style.textAlign = "center";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.9)"; // Más oscuro para mejor contraste
  modal.style.borderRadius = "15px";
  modal.style.boxShadow = "0px 0px 20px rgba(255, 0, 0, 0.9)"; // Resaltado en rojo
  modal.style.color = "white";
  modal.style.fontFamily = "Arial, sans-serif";
  modal.style.zIndex = "6000"; // Superior al fondo

  // Título del modal
  const title = document.createElement("h2");
  title.innerText = "💀 GAME OVER 💀";
  title.style.color = "#ff0000";
  title.style.fontSize = "28px";
  title.style.marginBottom = "20px";
  title.style.textShadow = "2px 2px 10px black"; // Efecto de sombra

  // Mensaje del puntaje
  const scoreMessage = document.createElement("p");
  scoreMessage.innerText = `🎯 Puntaje: ${score}`;
  scoreMessage.style.fontSize = "22px";
  scoreMessage.style.marginBottom = "30px";

  // Contenedor de botones
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.gap = "20px";

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

  // Añadir elementos al modal
  modal.appendChild(title);
  modal.appendChild(scoreMessage);
  modal.appendChild(buttonContainer);

  // Agregar todo al body
  document.body.appendChild(backgroundLayer);
  document.body.appendChild(modal);
}

function drawScore() {
  ctx.fillStyle = "white"; // Cambiar a blanco
  ctx.font = "20px Arial";
  ctx.fillText("Puntaje: " + score, 10 + 50, 30); // Añadir 20 píxeles de margen a la izquierda
}

function drawObjective() {
  ctx.fillStyle = "white"; // Cambiar a blanco
  ctx.font = "bold 20px Arial"; // Negrita
  ctx.shadowColor = "black"; // Sombra negra
  ctx.shadowBlur = 5; // Desenfoque de sombra
  ctx.shadowOffsetX = 2; // Desplazamiento horizontal de la sombra
  ctx.shadowOffsetY = 2; // Desplazamiento vertical de la sombra

  // Mostrar el objetivo centrado y el nivel

  ctx.fillText(`Nivel:3 - ${level}`, canvas.width - 100, 30); // Muestra el nivel actual en la parte superior derecha
}
const victoryMusic = new Audio("../audio/victory.mp3");
victoryMusic.volume = 0.5;
function showVictoryModal() {
  gameOver = true;
  bgMusic.pause(); // Pausar la música
  victoryMusic.play();
  cancelAnimationFrame(animationFrameId);
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
  messageElement.innerText = "🎯 ¡Has obtenido los 1000 puntos!";
  messageElement.style.fontSize = "22px";
  messageElement.style.marginBottom = "15px";
  modal.appendChild(messageElement);

  // Mensaje de nivel desbloqueado
  const levelMessage = document.createElement("p");
  levelMessage.innerText = "🔥 Level 4 desbloqueado 🔓";
  levelMessage.style.fontSize = "22px";
  levelMessage.style.fontWeight = "bold";
  levelMessage.style.color = "#00ff7f";
  levelMessage.style.marginBottom = "20px";
  modal.appendChild(levelMessage);

  // Contenedor de botones
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.alignItems = "center";
  buttonContainer.style.gap = "15px";

  // Botón para cerrar y volver al menú
  const closeModalBtn = document.createElement("button");
  closeModalBtn.innerText = "🏠 Volver al Menú";
  closeModalBtn.style.padding = "12px 30px";
  closeModalBtn.style.backgroundColor = "#007bff";
  closeModalBtn.style.border = "none";
  closeModalBtn.style.borderRadius = "8px";
  closeModalBtn.style.color = "white";
  closeModalBtn.style.fontSize = "18px";
  closeModalBtn.style.cursor = "pointer";
  closeModalBtn.style.transition = "0.3s";
  closeModalBtn.onmouseover = () =>
    (closeModalBtn.style.backgroundColor = "#0056b3");
  closeModalBtn.onmouseleave = () =>
    (closeModalBtn.style.backgroundColor = "#007bff");
  closeModalBtn.onclick = () => {
    modal.style.display = "none"; // Cerrar el modal
    window.location.href = "index.html"; // Redirigir al menú
    victoryMusic.pause();
    victoryMusic.currentTime = 0;
  };
  buttonContainer.appendChild(closeModalBtn);

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

// Reiniciar el juego
function resetGame() {
  score = 0;
  level = 1;
  gameOver = true;
  location.reload(); // Recargar la página para reiniciar
}
// Iniciar el juego
// Esperar 4 segundos antes de comenzar la animación del juego
setTimeout(() => {
  updateGameArea(); // Comenzar el juego después del delay
}, 2000); // 4000 milisegundos = 4 segundos
