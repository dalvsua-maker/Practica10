/**
 * @file scripts.js
 * @description Lógica principal para el juego de mesa Reversi (Othello).
 * Gestiona el tablero, la validación de movimientos, el cambio de turnos y el marcador.
 */

// 1. Elementos del DOM
/** @type {HTMLElement} Contenedor principal del tablero de juego */
const tablero = document.querySelector(".tablero");

/** @type {NodeList} Colección de todas las casillas (divs) dentro del tablero */
const casillas = document.querySelectorAll(".tablero > div");

/** @type {HTMLElement} Elemento que muestra el turno actual del juego */
const textoTurno = document.querySelector(".turno");

/** @type {HTMLElement} Elemento que muestra la puntuación del Jugador 1 (Blancas) */
const textoBlancas = document.querySelector(".jugador1");

/** @type {HTMLElement} Elemento que muestra la puntuación del Jugador 2 (Negras) */
const textoNegras = document.querySelector(".jugador2");

// 2. Estado del juego
/** @type {string} Color de la ficha que tiene el turno actual ('blanca' o 'negra') */
let turnoActual = "blanca";

// 3. Las 8 direcciones posibles en el plano (fila, columna)
/** 
 * @constant {Array<Array<number>>} 
 * Representa los desplazamientos relativos para explorar las 8 direcciones adyacentes 
 */
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

  // Guardamos las coordenadas en el propio elemento HTML usando dataset
  casilla.dataset.fila = fila;
  casilla.dataset.columna = columna;

  // Asignar el evento de clic a cada casilla
  casilla.addEventListener("click", manejarClickCasilla);
});

// 5. Manejador del Click Principal

/**
 * Gestiona la acción de hacer clic sobre una casilla del tablero.
 * Valida si el movimiento es legal, coloca la ficha, voltea las capturadas y actualiza el juego.
 * 
 * @param {PointerEvent} evento - El evento del clic generado por el usuario.
 * @returns {void}
 */
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
/**
 * Busca y retorna el elemento HTML de la casilla correspondiente a unas coordenadas dadas.
 * 
 * @param {number} fila - Índice de la fila (0-7).
 * @param {number} columna - Índice de la columna (0-7).
 * @returns {HTMLElement|null} El elemento DOM de la casilla o null si no se encuentra.
 */
function obtenerCasilla(fila, columna) {
  return document.querySelector(
    `.tablero > div[data-fila="${fila}"][data-columna="${columna}"]`,
  );
}

// 7. Lógica fundamental: Buscar encerronas en las 8 direcciones
/**
 * Calcula qué fichas del oponente serían capturadas si se coloca una ficha en la posición dada.
 * Explora las 8 direcciones desde el punto de origen.
 * 
 * @param {number} filaInicio - Fila donde se intenta colocar la ficha.
 * @param {number} columnaInicio - Columna donde se intenta colocar la ficha.
 * @param {string} colorActual - Color de la ficha que realiza el movimiento.
 * @returns {Array<HTMLElement>} Lista de elementos (casillas) cuyas fichas deben ser volteadas.
 */
function obtenerFichasAVoltear(filaInicio, columnaInicio, colorActual) {
  let fichasParaVoltear = [];
  const colorRival = colorActual === "blanca" ? "negra" : "blanca";

  DIRECCIONES.forEach(([dirFila, dirColumna]) => {
    let pasoFila = filaInicio + dirFila;
    let pasoColumna = columnaInicio + dirColumna;
    let posiblesFichasEnEstaDireccion = [];

    // Avanzar mientras estemos dentro de los límites del tablero (8x8)
    while (
      pasoFila >= 0 &&
      pasoFila < 8 &&
      pasoColumna >= 0 &&
      pasoColumna < 8
    ) {
      const casillaActual = obtenerCasilla(pasoFila, pasoColumna);
      const fichaHTML = casillaActual.querySelector(".ficha");

      // Si la casilla está vacía, se corta la posibilidad de encierro en esta dirección
      if (!fichaHTML) break;

      // Si es una ficha rival, se guarda como candidata para ser capturada
      if (fichaHTML.classList.contains(colorRival)) {
        posiblesFichasEnEstaDireccion.push(casillaActual);
      }
      // Si encontramos una ficha del color propio (aliada)...
      else if (fichaHTML.classList.contains(colorActual)) {
        // Si hay fichas rivales atrapadas entre la nueva y la aliada, las sumamos al total
        if (posiblesFichasEnEstaDireccion.length > 0) {
          fichasParaVoltear = fichasParaVoltear.concat(
            posiblesFichasEnEstaDireccion,
          );
        }
        break; // Línea cerrada con éxito, dejamos de buscar en esta dirección
      }

      // Continuar avanzando en la misma dirección (paso a paso)
      pasoFila += dirFila;
      pasoColumna += dirColumna;
    }
  });

  return fichasParaVoltear;
}

// 8. Modificaciones visuales en el Tablero
/**
 * Crea e inserta visualmente una ficha de un color determinado en una casilla.
 * 
 * @param {HTMLElement} casilla - El elemento DOM de la casilla donde se colocará la ficha.
 * @param {string} color - El color de la ficha ('blanca' o 'negra').
 * @returns {void}
 */
function colocarFicha(casilla, color) {
  casilla.innerHTML = `<div class="ficha ${color}"></div>`;
}

/**
 * Cambia el color de una lista de fichas al color del jugador actual.
 * 
 * @param {Array<HTMLElement>} listaCasillas - Array de elementos DOM que contienen fichas a voltear.
 * @returns {void}
 */
function voltearFichas(listaCasillas) {
  listaCasillas.forEach((casilla) => {
    const ficha = casilla.querySelector(".ficha");
    if (ficha) {
      ficha.classList.remove("blanca", "negra");
      ficha.classList.add(turnoActual);
    }
  });
}

/**
 * Cambia el turno del juego entre 'blanca' y 'negra' y actualiza la interfaz.
 * 
 * @returns {void}
 */
function cambiarTurno() {
  turnoActual = turnoActual === "blanca" ? "negra" : "blanca";
  textoTurno.textContent = `Turno: ${turnoActual === "blanca" ? "Blancas" : "Negras"}`;
}

/**
 * Cuenta las fichas de cada color en el tablero y actualiza los marcadores de puntuación.
 * 
 * @returns {void}
 */
function actualizarMarcador() {
  const totalBlancas = document.querySelectorAll(".ficha.blanca").length;
  const totalNegras = document.querySelectorAll(".ficha.negra").length;

  textoBlancas.textContent = `Jugador 1 (Blancas): ${totalBlancas}`;
  textoNegras.textContent = `Jugador 2 (Negras): ${totalNegras}`;
}

/**
 * Muestra un mensaje de error temporal en la interfaz de usuario.
 * 
 * @param {string} mensaje - El texto que se desea mostrar como alerta.
 * @returns {void}
 */
function mostrarError(mensaje) {
  const contenedorError = document.getElementById("alerta-error");
  contenedorError.textContent = mensaje;

  // Limpiamos cualquier temporizador anterior para evitar conflictos visuales
  if (window.timerError) clearTimeout(window.timerError);

  // Borrar el mensaje automáticamente tras 2 segundos (2000 ms)
  window.timerError = setTimeout(() => {
    contenedorError.textContent = "";
  }, 2000);
}
