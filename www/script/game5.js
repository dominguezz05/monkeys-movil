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
  "img/level5/3.1.webp", // Imagen de fondo para nivel 1
  "img/level5/3.2.webp", // Imagen de fondo para nivel 2
  "img/level5/3.3.webp", // Imagen de fondo para nivel 3
  "img/level5/3.4.webp", // Imagen de fondo para nivel 4
  "img/level5/3.5.webp", // Imagen de fondo para nivel 5
  "img/level5/3.6.webp", // Imagen de fondo para nivel 6
  "img/level5/3.7.webp", // Imagen de fondo para nivel 7
];

// Cargar las imágenes
const monkeyImage = new Image();
monkeyImage.src = "img/mono3.png";

const keys = {
  left: false,
  right: false,
  up: false,
  shoot: false,
};

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
shieldImage.src = "img/banana.png"; // Imagen del escudo

const heartImage = new Image();
heartImage.src = "img/heart-png.webp"; // Imagen de corazón

const portalImage = new Image();
portalImage.src = "img/Portal.png";

// Variables del juego
const gravity = 0.65;
let levelUpTime = 0; // Variable para controlar el tiempo del mensaje de nivel
let gameOver = false;
let score = 0;
let level = 1;
let bananaFallSpeed = 3; // Velocidad inicial de caída de los plátanos
let enemyFallSpeed = 2; // Velocidad inicial de caída de los enemigos
let enemySpawnRate = 0.02; // Aumenta para generar más meteoritos

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

let bgMusic = new Audio("audio/level5/8bits3.mp3");
bgMusic.loop = true; // Repetir música
bgMusic.play(); // Reproducir música al inicio
let shootSound = new Audio("shoot.mp3");

let bgMusicRate = 1; // Velocidad inicial de la música

// Plátanos
let bananas = [];

// Enemigos
let enemies = [];

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

  // Lógica del juego
  moveMonkey(); // Actualiza la posición del mono
  updateBananas(); // Actualiza los plátanos
  updateEnemies(); // Actualiza enemigos (incluyendo roca giratoria y meteorito jefe)
  updateProjectiles(); // Actualiza proyectiles
  updateShield(); // Controla el escudo del mono
  updateShields(); // Actualiza los escudos que caen
  updateHearts(); // Actualiza corazones (incluyendo el portal)
  updatePortalStatus();
  checkCollisions(); // Verifica las colisiones
  checkLevelUp(); // Verifica si hay un nivel superior
  if (!gameOver && score >= 1000) {
    desbloquearNivel(5); // También desbloquea el nivel 6
    showVictoryModal(); // Muestra el modal aunque no se haya cogido el portal
    portalActive = false;
  }

  // Dibujar elementos en pantalla
  drawMonkey(); // Dibuja el mono
  drawBananas(); // Dibuja los plátanos
  drawEnemies(); // Dibuja los enemigos (roca giratoria, meteorito jefe, etc.)
  drawProjectiles(); // Dibuja los proyectiles
  drawShields(); // Dibuja los escudos
  drawHearts(); // Dibuja los corazones y el portal
  drawScore(); // Dibuja el puntaje
  drawObjective(); // Dibuja el objetivo del nivel

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

//y cada 5 segundos
function updateShields() {
  const currentTime = Date.now(); // Obtener el tiempo actual

  // Generar escudo cada 10 segundos
  if (currentTime - lastShieldTime > 20000) {
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
  const currentTime = Date.now();

  // Generar corazones cada 18 segundos
  if (currentTime - lastHeartTime > 18000) {
    generateHeart();
    lastHeartTime = currentTime; // Actualizar el tiempo del último corazón generado
  }

  hearts.forEach((heart, index) => {
    if (heart.isPortal) {
      // Dibuja el portal como un ítem especial
      ctx.drawImage(portalImage, heart.x, heart.y, 60, 60);
    } else {
      // Dibuja los corazones normales
      ctx.drawImage(heartImage, heart.x, heart.y, 16, 16);
    }

    // Movimiento hacia abajo
    heart.y += enemyFallSpeed;

    // Verificar colisión con el mono (portal o corazón)
    if (
      heart.isPortal &&
      heart.x < monkey.x + monkey.width &&
      heart.x + 60 > monkey.x && // Ajustado al nuevo tamaño del portal
      heart.y < monkey.y + monkey.height &&
      heart.y + 60 > monkey.y // Ajustado al nuevo tamaño del portal
    ) {
      if (heart.isPortal) {
        // Mostrar anuncio interstitial si está disponible, luego el modal
        if (window.Android && Android.showInterstitial) {
          Android.showInterstitial(); // Luego de cerrarse, se mostrará el modal
        } else {
          showVictoryModal();
        }

        desbloquearNivel(5); // Desbloquear siguiente nivel
        gameOver = true; // Detener el juego
        portalActive = false;
      } else if (lives < 3) {
        lives++; // Incrementar vidas si es un corazón normal
      }
      hearts.splice(index, 1); // Eliminar el corazón o portal recogido
    }

    // Eliminar corazones o portales que salgan de la pantalla
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
  if (score >= 500) {
    generateSpinningRock(); // Generar rocas giratorias
  }

  if (score >= 700 && !bossMeteorActive) {
    generateBossMeteor(); // Generar el meteorito jefe
  }

  if (score >= 800) {
    generatePortal(); // Generar el portal basado en el puntaje y el tiempo
  }

  if (score >= level * 150) {
    level++;

    // Acelera la música al subir de nivel
    bgMusicRate += 0.1; // Aumenta la velocidad
    bgMusic.playbackRate = bgMusicRate; // Aplica la velocidad

    // Cambiar el fondo a la imagen correspondiente según el nivel
    if (level - 1 < backgrounds.length) {
      backgroundImage.src = backgrounds[level - 1];
    }
  }
}

// Función para generar la roca giratoria
function generateSpinningRock() {
  const spinningRocks = enemies.filter((enemy) => enemy.spinning);
  const maxRocks = 3; // Número máximo de rocas giratorias simultáneas
  if (spinningRocks.length < maxRocks) {
    // Generar las rocas giratorias faltantes
    for (let i = spinningRocks.length; i < maxRocks; i++) {
      enemies.push({
        x: Math.random() * canvas.width,
        y: canvas.height / 2, // Aparece en el centro vertical
        size: 3, // Tamaño grande
        speed: 0, // No se mueve verticalmente
        dx: 2, // Movimiento horizontal constante
        hits: Infinity, // No se puede destruir
        spinning: true, // Indica que es una roca giratoria
      });
    }
  }
}
let portalActive = false; // Controla si hay un portal activo
let lastPortalTime = 0; // Controla el tiempo desde el último portal generado

function generatePortal() {
  if (!portalActive) {
    hearts.push({
      x: Math.random() * canvas.width,
      y: -30, // Aparece desde la parte superior
      isPortal: true, // Identificar como portal
    });
    portalActive = true; // Marcar el portal como activo
    lastPortalTime = Date.now(); // Registrar el tiempo del portal generado
  }
}

function updatePortalStatus() {
  const currentTime = Date.now();

  if (score >= 800) {
    // ✅ Solo si ya se llegó a 800 puntos

    hearts.forEach((heart, index) => {
      if (heart.isPortal && heart.y > canvas.height) {
        // Si el portal sale del lienzo, desactiva y permite generar uno nuevo
        portalActive = false;
        hearts.splice(index, 1);
      }
    });

    // Generar un nuevo portal cada 20 segundos si no hay uno activo
    if (!portalActive && currentTime - lastPortalTime > 20000) {
      generatePortal();
    }
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
  // Controles móviles
  if (keys.left) {
    monkey.dx = -monkey.speed;
  } else if (keys.right) {
    monkey.dx = monkey.speed;
  } else {
    monkey.dx = 0;
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

const shootButton = document.getElementById("shootButton");

shootButton.addEventListener("touchstart", () => {
  canShoot = true; // 🔥 RESET antes de disparar
  shootProjectile(); // 🚀 Dispara
});

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
      monkey.width / 2 + 8, // Tamaño del escudo (un poco más grande que el mono)
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
      30, // Radio del círculo alrededor del mono
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
} // Generar meteoritos grandes
// Generar meteoritos grandes
function generateEnemy() {
  for (let i = 0; i < 3; i++) {
    // Generar tres meteoritos grandes
    const x = Math.random() * canvas.width; // Posición horizontal aleatoria
    const size = 3; // Tamaño fijo para meteoritos grandes
    const speed = enemyFallSpeed + Math.random() * 2; // Velocidad aleatoria
    enemies.push({ x, y: -30, size, speed, dx: 0, hits: 2 }); // Agregar propiedad 'hits'
  }
}

// Explosión de meteorito grande
function explodeMeteorite(enemy) {
  const fragmentCount = 5; // Número de fragmentos por explosión
  for (let i = 0; i < fragmentCount; i++) {
    const dx = (Math.random() - 0.5) * 4; // Movimiento horizontal aleatorio
    const dy = -(Math.random() * 6 + 8); // Velocidad inicial hacia arriba (suben más)
    enemies.push({
      x: enemy.x, // Fragmentos empiezan en la posición del meteorito grande
      y: canvas.height - 30 * enemy.size, // Explota en el suelo
      size: 1, // Fragmentos más pequeños
      speed: dy, // Velocidad inicial vertical negativa (suben)
      dx, // Movimiento horizontal
      gravityEffect: true, // Indica que es un fragmento afectado por gravedad
    });
  }
}

// Actualizar meteoritos y fragmentos
function updateEnemies() {
  // Limitar el número total de enemigos activos
  const maxEnemies = 10; // Ajusta este número según el rendimiento deseado
  if (enemies.length < maxEnemies && Math.random() < enemySpawnRate) {
    generateEnemy();
  }

  enemies.forEach((enemy, index) => {
    // Movimiento horizontal y vertical
    enemy.x += enemy.dx || 0;
    enemy.y += enemy.speed;

    // Simular gravedad para fragmentos pequeños
    if (enemy.gravityEffect) {
      enemy.speed += gravity * 0.4; // Gravedad suave para parábola
    }

    // Explosión para meteoritos grandes al tocar el suelo
    if (enemy.size === 3 && enemy.y + 30 * enemy.size >= canvas.height) {
      explodeMeteorite(enemy); // Explota al tocar el suelo
      enemies.splice(index, 1); // Eliminar meteorito grande
    }

    // Eliminar fragmentos si salen del lienzo
    if (enemy.x < 0 || enemy.x > canvas.width || enemy.y > canvas.height) {
      enemies.splice(index, 1);
    }
  });
}

// Dibujar la roca giratoria
function drawEnemies() {
  enemies.forEach((enemy) => {
    if (enemy.spinning) {
      ctx.save();
      ctx.translate(enemy.x + 15 * enemy.size, enemy.y + 15 * enemy.size);
      ctx.rotate((Date.now() % 360) * (Math.PI / 180)); // Rotación constante
      ctx.drawImage(
        enemyImage,
        -12 * enemy.size,
        -12 * enemy.size,
        20 * enemy.size,
        20 * enemy.size
      );
      ctx.restore();
    } else {
      const sizeMultiplier = enemy.size; // Ajustar tamaño según el valor de `size`
      ctx.drawImage(
        enemyImage,
        enemy.x,
        enemy.y,
        15 * sizeMultiplier,
        15 * sizeMultiplier
      );
    }
  });
}

let bossMeteorActive = false; // Controla si el jefe está activo

function generateBossMeteor() {
  if (!bossMeteorActive) {
    enemies.push({
      x: canvas.width / 2 - 75, // Posición inicial centrada
      y: -100, // Aparece fuera del lienzo
      size: 3.5, // Tamaño grande
      speed: 1.5, // Velocidad lenta
      dx: 0, // Movimiento solo vertical
      hits: 10, // Necesita 10 disparos para destruirse
      boss: true, // Identificar como jefe
    });

    bossMeteorActive = true; // Marcar que el jefe está activo
    console.log("Meteorito jefe generado.");
  }
}

function handleHeartLoss() {
  // Separar el portal de los demás corazones
  const portales = hearts.filter((h) => h.isPortal);
  hearts = portales; // Conservar solo el portal

  bananas = [];
  enemies = [];
  shields = [];

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
      score += 15; // Aumentar el puntaje
      bananas.splice(index, 1); // Eliminar el plátano
    }
  });

  // Colisiones con meteoritos
  enemies.forEach((enemy, index) => {
    const meteorWidth = 15 * enemy.size * 0.8; // Ajuste de hitbox para mayor precisión
    const meteorHeight = 15 * enemy.size * 0.8;

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
        if (enemy.hits > 1) {
          enemy.hits--; // Reducir el contador de impactos
          projectiles.splice(projIndex, 1); // Eliminar el proyectil
        } else {
          if (enemy.boss) {
            console.log("Meteorito jefe destruido. Dividiendo en fragmentos.");
            // Dividir el meteorito jefe en meteoritos medianos
            for (let i = 0; i < 3; i++) {
              enemies.push({
                x: enemy.x + (i - 1) * 50, // Espaciado entre fragmentos
                y: enemy.y,
                size: 3, // Meteoritos medianos
                speed: enemy.speed + Math.random() * 2, // Velocidad alterada
                dx: (Math.random() - 0.5) * 2, // Movimiento horizontal aleatorio
                hits: 3, // Necesitan 3 disparos para destruirse
              });
            }
            bossMeteorActive = false; // Permitir generar un nuevo jefe
          } else if (enemy.size === 3) {
            console.log("Meteorito mediano destruido. Dividiendo en pequeños.");
            // Dividir meteoritos medianos en pequeños
            for (let i = 0; i < 2; i++) {
              enemies.push({
                x: enemy.x + (i === 0 ? -20 : 20), // Posición desplazada
                y: enemy.y,
                size: 1, // Meteoritos pequeños
                speed: enemy.speed + Math.random() * 2, // Velocidad alterada
                dx: (Math.random() - 0.5) * 2, // Movimiento horizontal aleatorio
                hits: 1, // Necesitan 1 disparo para destruirse
              });
            }
          }

          // Eliminar el meteorito original
          enemies.splice(enemyIndex, 1);
          projectiles.splice(projIndex, 1); // Eliminar el proyectil
          score += 2; // Incrementar el puntaje
        }
      }
    });
  });

  // Verificar colisión con escudos (si el mono recoge un escudo)
  shields.forEach((shield, index) => {
    if (
      shield.x < monkey.x + monkey.width &&
      shield.x + 30 > monkey.x &&
      shield.y < monkey.y + monkey.height &&
      shield.y + 30 > monkey.y
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
      heart.x + 16 > monkey.x &&
      heart.y < monkey.y + monkey.height &&
      heart.y + 16 > monkey.y
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
  cancelAnimationFrame(animationFrameId);
  bgMusic.pause(); // Pausar la música de fondo

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

  ctx.fillText(`Nivel:5 - ${level}`, canvas.width - 100, 30); // Muestra el nivel actual en la parte superior derecha
}
const victoryMusic = new Audio("../audio/victory.mp3");
victoryMusic.volume = 0.5;
function showVictoryModal() {
  gameOver = true;
  cancelAnimationFrame(animationFrameId);
  bgMusic.pause(); // Pausar música del jefe
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
  messageElement.innerText =
    "🎉 Lo lograste campeón, ya estamos más cerca de salvar a Monita.";
  messageElement.style.fontSize = "22px";
  messageElement.style.marginBottom = "15px";
  modal.appendChild(messageElement);

  // Mensaje de nivel desbloqueado
  const levelMessage = document.createElement("p");
  levelMessage.innerText = "🔥 Level 6 desbloqueado 🔓";
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
setTimeout(() => {
  updateGameArea(); // Comenzar el juego después del delay
}, 2000); // 4000 milisegundos = 4 segundos
