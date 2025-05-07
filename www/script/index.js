document.addEventListener("DOMContentLoaded", () => {
  // ⚠️ SOLO si quieres desbloquearlos siempre desbloquearTodosLosNiveles();
  cargarProgreso(); // Cargar los niveles desbloqueados al abrir el menú

  const logo = document.querySelector(
    "img[alt='Logo del juego Mono Aventurero']"
  );
  const creditsModal = document.getElementById("creditsModal");

  logo.addEventListener("click", () => {
    creditsModal.style.display = "flex"; // Mostrar el modal

    // Cerrar automáticamente después de la animación (8s)
    setTimeout(() => {
      creditsModal.style.display = "none";
    }, 15000); // Debe coincidir con la duración de la animación
  });
});

function openInstructions() {
  const modal = document.getElementById("newModal2");
  if (modal) {
    modal.style.display = "block";
  } else {
    console.error("El modal de instrucciones (newModal2) no se encontró.");
  }
}
function closeBanner() {
  const banner = document.getElementById("fullscreenBanner");
  banner.style.display = "none";
}
function closeInstructions() {
  const modal = document.getElementById("newModal2");
  if (modal) {
    modal.style.display = "none";
  } else {
    console.error("El modal de instrucciones (newModal2) no se encontró.");
  }
}

// Abre el modal de selección de niveles
function openLevelModal() {
  document.getElementById("levelModal").style.display = "block";
}

// Cierra el modal de selección de niveles
function closeLevelModal() {
  document.getElementById("levelModal").style.display = "none";
}

// Función para iniciar el juego en el nivel seleccionado
function startGame(level) {
  const overlay = document.getElementById("darkOverlay");
  overlay.style.opacity = "1";
  overlay.style.visibility = "visible";

  // ⛔ Detener la música del menú antes de salir
  const music = document.getElementById("indexMusic");
  if (music) {
    music.pause();
    music.currentTime = 0;
  }

  // Redirigir al archivo correspondiente
  setTimeout(() => {
    if (level === 1) {
      window.location.href = "animacion.html";
    } else if (level === 2) {
      window.location.href = "animacion2.html";
    } else if (level === 3) {
      window.location.href = "game3.html";
    } else if (level === 4) {
      window.location.href = "game4.html";
    } else if (level === 5) {
      window.location.href = "game5.html";
    } else if (level === 6) {
      window.location.href = "game6.html";
    } else if (level === 7) {
      window.location.href = "game7.html";
    } else if (level === 8) {
      window.location.href = "game8.html";
    } else if (level === 9) {
      window.location.href = "animacionJefe.html";
    }
  }, 1000);

  closeLevelModal();
}
window.addEventListener("load", () => {
  const audio = document.getElementById("indexMusic");
  if (audio) {
    audio.play().catch((error) => {
      console.log("Reproducción de música bloqueada por el navegador:", error);
      // Puedes mostrar un botón tipo "Reactivar sonido" si quieres
    });
  }
});
let musicaIniciada = false;

function iniciarMusica() {
  if (!musicaIniciada) {
    const audio = document.getElementById("indexMusic");
    if (audio) {
      audio
        .play()
        .then(() => {
          console.log("🎵 Música iniciada tras interacción");
          musicaIniciada = true;
        })
        .catch((err) => {
          console.warn("⚠️ Error al reproducir música:", err);
        });
    }
  }
}

window.addEventListener("touchstart", iniciarMusica, { once: true });
window.addEventListener("click", iniciarMusica, { once: true }); // Por si es navegador de escritorio

// Cuando inicias el juego
document.getElementById("startButton").addEventListener("click", () => {
  openLevelModal(); // Abre el modal para seleccionar nivel
});

window.addEventListener("load", () => {
  const audio = document.querySelector("audio");
  audio.play().catch((error) => {
    console.log("El navegador bloqueó el audio:", error);
  });
});
const audio = document.querySelector("audio");
audio
  .play()
  .then(() => {
    console.log("La música está sonando");
  })
  .catch((error) => {
    console.log("Error al intentar reproducir la música:", error);
  });

// Variables globales
let nivelesDesbloqueados = [true, false, false]; // Nivel 1 desbloqueado al inicio

function cargarProgreso() {
  const progresoGuardado = localStorage.getItem("nivelesDesbloqueados");
  if (progresoGuardado) {
    nivelesDesbloqueados = JSON.parse(progresoGuardado);
  }
  actualizarPantallaDeNiveles();
}
/*function desbloquearTodosLosNiveles() {
  const totalNiveles = 18;
  nivelesDesbloqueados = Array(totalNiveles).fill(true); // ACTUALIZA LA VARIABLE GLOBAL
  localStorage.setItem(
    "nivelesDesbloqueados",
    JSON.stringify(nivelesDesbloqueados)
  );
  actualizarPantallaDeNiveles(); // REFRESCA LA UI
  console.log("✅ Todos los niveles desbloqueados");
}*/

// Guardar progreso en localStorage
function desbloquearNivel(nivel) {
  nivelesDesbloqueados[nivel] = true;
  localStorage.setItem(
    "nivelesDesbloqueados",
    JSON.stringify(nivelesDesbloqueados)
  );
}
let currentLevelPage = 1;

function actualizarPantallaDeNiveles() {
  const botones = document.querySelectorAll(".nivel-boton");
  const comingSoonText = document.getElementById("comingSoonText");

  botones.forEach((boton, index) => {
    const isPage1 = index < 9; // Niveles 1-9 en página 1
    const isPage2 = index >= 9; // Niveles 10-18 en página 2

    if (
      (currentLevelPage === 1 && isPage1) ||
      (currentLevelPage === 2 && isPage2)
    ) {
      boton.style.display = "inline-block";
    } else {
      boton.style.display = "none";
    }

    if (index < 9) {
      // Desbloqueo normal (solo página 1)
      if (nivelesDesbloqueados[index]) {
        boton.disabled = false;
        boton.classList.remove("disabled");
      } else {
        boton.disabled = true;
        boton.classList.add("disabled");
      }
    } else {
      // Niveles futuros (página 2 - siempre bloqueados)
      boton.disabled = true;
      boton.classList.add("disabled");
    }
  });

  // Mostrar/ocultar el texto "Próximamente"
  if (currentLevelPage === 2) {
    comingSoonText.classList.add("visible");
  } else {
    comingSoonText.classList.remove("visible");
  }

  document
    .getElementById("prevPage")
    .classList.toggle("hidden", currentLevelPage === 1);
  document
    .getElementById("nextPage")
    .classList.toggle("hidden", currentLevelPage === 2);
}

document.getElementById("prevPage").addEventListener("click", () => {
  currentLevelPage = 1;
  actualizarPantallaDeNiveles();
});

document.getElementById("nextPage").addEventListener("click", () => {
  currentLevelPage = 2;
  actualizarPantallaDeNiveles();
});
document
  .getElementById("closeLevelModalButton")
  .addEventListener("click", () => {
    closeLevelModal();
  });

let isGameClosed = false;

// Detectamos cuando el jugador cierra la pestaña
window.onbeforeunload = function () {
  if (isGameClosed) {
    // Borrar solo cuando se cierre la pestaña
    localStorage.clear();
  }
};

// Función para marcar que el juego está cerrado
