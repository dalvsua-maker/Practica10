// 1. Elementos del DOM
const tablero = document.querySelector(".tablero");
const casillas = document.querySelectorAll(".tablero > div");
const textoTurno = document.querySelector(".turno");
const textoBlancas = document.querySelector(".jugador1");
const textoNegras = document.querySelector(".jugador2");

// 2. Estado del juego
let turnoActual = "blanca"; // Puede ser 'blanca' o 'negra'

// 3. Las 8 direcciones posibles en el plano (fila, columna)
const DIRECCIONES = [
  [-1, 0], // Arriba
  [1, 0], // Abajo
  [0, -1], // Izquierda
  [0, 1], // Derecha
  [-1, -1], // Diagonal Arriba-Izquierda
  [-1, 1], // Diagonal Arriba-Derecha
  [1, -1], // Diagonal Abajo-Izquierda
  [1, 1], // Diagonal Abajo-Derecha
];

// 4. Inicializar casillas con coordenadas (fila, columna)
casillas.forEach((casilla, indice) => {
  const fila = Math.floor(indice / 8);
  const columna = indice % 8;

  // Guardamos las coordenadas en el propio elemento HTML
  casilla.dataset.fila = fila;
  casilla.dataset.columna = columna;

  // Escuchar el click de cada casilla
  casilla.addEventListener("click", manejarClickCasilla);
});

// 5. Manejador del Click Principal


function manejarClickCasilla(evento) {
  const casilla = evento.currentTarget;
  const fila = parseInt(casilla.dataset.fila);
  const columna = parseInt(casilla.dataset.columna);

  // ¿La casilla ya tiene una ficha?
  if (casilla.innerHTML.trim() !== "") {
    mostrarError("¡Esa casilla ya está ocupada!");
    return;
  }

  // Obtener la lista de fichas que se encerrarían
  const fichasAVoltear = obtenerFichasAVoltear(fila, columna, turnoActual);

  // Si la lista tiene elementos, el movimiento es válido
  if (fichasAVoltear.length > 0) {
    colocarFicha(casilla, turnoActual);
    voltearFichas(fichasAVoltear);
    cambiarTurno();
    actualizarMarcador();
  } else {
    // Si no encierra ninguna ficha, el movimiento es ilegal en Reversi
    mostrarError(
      "Movimiento inválido: debes encerrar al menos una ficha rival.",
    );
  }
}

// 6. Obtener casilla por coordenadas
function obtenerCasilla(fila, columna) {
  return document.querySelector(
    `.tablero > div[data-fila="${fila}"][data-columna="${columna}"]`,
  );
}

// 7. Lógica fundamental: Buscar encerronas en las 8 direcciones
function obtenerFichasAVoltear(filaInicio, columnaInicio, colorActual) {
  let fichasParaVoltear = [];
  const colorRival = colorActual === "blanca" ? "negra" : "blanca";

  DIRECCIONES.forEach(([dirFila, dirColumna]) => {
    let pasoFila = filaInicio + dirFila;
    let pasoColumna = columnaInicio + dirColumna;
    let posiblesFichasEnEstaDireccion = [];

    // Avanzar mientras estemos dentro de los límites del tablero
    while (
      pasoFila >= 0 &&
      pasoFila < 8 &&
      pasoColumna >= 0 &&
      pasoColumna < 8
    ) {
      const casillaActual = obtenerCasilla(pasoFila, pasoColumna);
      const fichaHTML = casillaActual.querySelector(".ficha");

      // Si la casilla está vacía, se corta la línea de encierro
      if (!fichaHTML) break;

      // Si es una ficha rival, se guarda como candidata
      if (fichaHTML.classList.contains(colorRival)) {
        posiblesFichasEnEstaDireccion.push(casillaActual);
      }
      // Si encontramos una ficha aliada...
      else if (fichaHTML.classList.contains(colorActual)) {
        // Si había rivales atrapadas en medio, las sumamos al total
        if (posiblesFichasEnEstaDireccion.length > 0) {
          fichasParaVoltear = fichasParaVoltear.concat(
            posiblesFichasEnEstaDireccion,
          );
        }
        break; // Línea cerrada con éxito, dejamos de buscar en esta dirección
      }

      // Continuar avanzando en la misma dirección
      pasoFila += dirFila;
      pasoColumna += dirColumna;
    }
  });

  return fichasParaVoltear;
}

// 8. Modificaciones visuales en el Tablero
function colocarFicha(casilla, color) {
  casilla.innerHTML = `<div class="ficha ${color}"></div>`;
}

function voltearFichas(listaCasillas) {
  listaCasillas.forEach((casilla) => {
    const ficha = casilla.querySelector(".ficha");
    if (ficha) {
      ficha.classList.remove("blanca", "negra");
      ficha.classList.add(turnoActual);
    }
  });
}

function cambiarTurno() {
  turnoActual = turnoActual === "blanca" ? "negra" : "blanca";
  textoTurno.textContent = `Turno: ${turnoActual === "blanca" ? "Blancas" : "Negras"}`;
}

function actualizarMarcador() {
  const totalBlancas = document.querySelectorAll(".ficha.blanca").length;
  const totalNegras = document.querySelectorAll(".ficha.negra").length;

  textoBlancas.textContent = `Jugador 1 (Blancas): ${totalBlancas}`;
  textoNegras.textContent = `Jugador 2 (Negras): ${totalNegras}`;
}
function mostrarError(mensaje) {
  const contenedorError = document.getElementById("alerta-error");
  contenedorError.textContent = mensaje;

  // Limpiamos cualquier temporizador anterior para que no se pisen
  if (window.timerError) clearTimeout(window.timerError);

  // Borrar el mensaje automáticamente tras 2 segundos
  window.timerError = setTimeout(() => {
    contenedorError.textContent = "";
  }, 2000);
}
