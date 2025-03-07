// Configuración inicial del lienzo
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Cambiar dinámicamente a filtro de cómic
setTimeout(() => {
  canvas.classList.add("comic-style");
}, 2000); // Activa el estilo cómic después de 2 segundos

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
  backgroundMusic.volume = 0.2; // Volumen suave
  backgroundMusic
    .play()
    .catch((error) => console.log("El navegador bloqueó la música: ", error));
});

// Ajustar el tamaño del canvas según el fondo
backgroundImage.onload = () => {
  canvas.width = backgroundImage.width;
  canvas.height = backgroundImage.height;

  monkey.y = canvas.height - monkey.height;
  femaleMonkey.y = canvas.height - femaleMonkey.height;

  animate(); // Iniciar la animación cuando el fondo esté cargado
};

// Propiedades del mono
const monkey = {
  x: canvas.width / 2 - 50, // Mono en el centro
  y: canvas.height - 100, // En el suelo
  width: 100,
  height: 100,
};

// Propiedades de la mona
const femaleMonkey = {
  x: canvas.width / 2 - 40,
  y: -100, // Aparece desde arriba en el rayo
  width: 80,
  height: 80,
  abducted: false,
};

// Propiedades de la nave
const spaceship = {
  x: canvas.width / 2 - 125,
  y: canvas.height + 100, // Comienza desde abajo
  width: 250,
  height: 300,
  targetY: canvas.height / 2 - 50,
  visible: false,
};

// Rayo de abducción
let abductionActive = false;
let abductionComplete = false;

function drawAbductionRay() {
  if (abductionActive) {
    ctx.fillStyle = "rgba(0, 191, 255, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.fillStyle = "rgba(173, 216, 230, 0.7)";
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
  }
}

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
  ctx.shadowBlur = 0;
}

function drawMonkey() {
  ctx.drawImage(monkeyImage, monkey.x, monkey.y, monkey.width, monkey.height);
}

function drawFemaleMonkey() {
  if (!abductionComplete) {
    ctx.drawImage(
      femaleMonkeyImage,
      femaleMonkey.x,
      femaleMonkey.y,
      femaleMonkey.width,
      femaleMonkey.height
    );
  }
}

function showBossDialogue() {
  bossDialogue.classList.remove("hidden");
  typeText(
    bossDialogue,
    "¡Si quieres volver a verla, deberás acabar con mi flota y traerme muchos muchos plátanos!",
    50
  );
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  drawMonkey();
  drawSpaceship();
  drawAbductionRay();
  drawFemaleMonkey();

  if (spaceship.y > spaceship.targetY) {
    spaceship.y -= 2;
    spaceship.visible = true;
  } else if (!abductionActive) {
    setTimeout(() => {
      abductionActive = true;
      playSound(abductionSound);
    }, 1000);
  }

  if (abductionActive && femaleMonkey.y < spaceship.y + spaceship.height) {
    femaleMonkey.y += 2;
  } else if (abductionActive && !abductionComplete) {
    setTimeout(() => {
      abductionActive = false;
      abductionComplete = true;
      showBossDialogue();
    }, 3000);
  }

  requestAnimationFrame(animate);
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
