/**
 * @file reversi-terminal.js
 * @description Versión para terminal del juego Reversi (Othello).
 */

const readline = require("readline");

let tablero = [];
let turno = "Xs";

const DIRECCIONES = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Inicializa la matriz del tablero con el estado inicial del juego.
 */
function iniciarJuego() {
  for (let i = 0; i < 8; i++) {
    tablero[i] = [" ", " ", " ", " ", " ", " ", " ", " "];
  }
  tablero[3][3] = "X";
  tablero[4][4] = "X";
  tablero[3][4] = "O";
  tablero[4][3] = "O";
}

/**
 * Dibuja el estado actual del tablero y el marcador en la terminal.
 */
function pintarTablero() {
  process.stdout.write("\u001b[2J\u001b[0;0H");

  let blancas = 0;
  let negras = 0;
  for (let f = 0; f < 8; f++) {
    for (let c = 0; c < 8; c++) {
      if (tablero[f][c] === "X") blancas++;
      if (tablero[f][c] === "O") negras++;
    }
  }

  let vista = "";
  vista += "=== REVERSI ===\n";
  vista += `Jugador 1 ("Xs"): ${blancas} | Jugador 2 ("Os"): ${negras}\n`;
  vista += `Turno: ${turno === "Xs" ? "Xs" : "Os"}\n\n`;
  vista += "    a   b   c   d   e   f   g   h\n";
  vista += "  +---+---+---+---+---+---+---+---+\n";

  for (let f = 0; f < 8; f++) {
    let fila = `${f + 1} |`;
    for (let c = 0; c < 8; c++) {
      fila += ` ${tablero[f][c]} |`;
    }
    vista += fila + "\n";
    vista += "  +---+---+---+---+---+---+---+---\n";
  }

  process.stdout.write(vista);
}

/**
 * Calcula qué fichas se pueden voltear desde una posición inicial.
 * * @param {number} filaInicio - Fila de la casilla seleccionada.
 * @param {number} columnaInicio - Columna de la casilla seleccionada.
 * @param {string} colorActual - Color del jugador que mueve ('blanca' o 'negra').
 * @returns {Array<Array<number>>} Coordenadas de las fichas a voltear.
 */
function obtenerFichasAVoltear(filaInicio, columnaInicio, colorActual) {
  let fichasParaVoltear = [];

  const fichaMia = colorActual === "Xs" ? "X" : "O";
  const fichaRival = colorActual === "Xs" ? "O" : "X";

  DIRECCIONES.forEach(([dirFila, dirColumna]) => {
    let pasoFila = filaInicio + dirFila;
    let pasoColumna = columnaInicio + dirColumna;
    let posibles = [];

    while (
      pasoFila >= 0 &&
      pasoFila < 8 &&
      pasoColumna >= 0 &&
      pasoColumna < 8
    ) {
      const casillaActual = tablero[pasoFila][pasoColumna];

      if (casillaActual === " ") {
        break;
      }

      if (casillaActual === fichaRival) {
        posibles.push([pasoFila, pasoColumna]);
      } else if (casillaActual === fichaMia) {
        if (posibles.length > 0) {
          fichasParaVoltear = fichasParaVoltear.concat(posibles);
        }
        break;
      }

      pasoFila += dirFila;
      pasoColumna += dirColumna;
    }
  });

  return fichasParaVoltear;
}

/**
 * Verifica si un jugador tiene movimientos legales disponibles en el tablero.
 * * @param {string} color - El color del jugador a evaluar.
 * @returns {boolean} True si tiene al menos un movimiento válido.
 */
function puedeMover(color) {
  for (let f = 0; f < 8; f++) {
    for (let c = 0; c < 8; c++) {
      if (
        tablero[f][c] === " " &&
        obtenerFichasAVoltear(f, c, color).length > 0
      ) {
        return true;
      }
    }
  }
  return false;
}
/**
 * Comprueba si el rival puede mover cuando el jugador actual está bloqueado.
 * Si el rival tampoco puede mover, finaliza la partida y cierra la interfaz.
 * Si el rival sí puede mover, le cede el turno y programa la continuación del juego.
 *
 * @function comprobarEstado
 * @returns {void} No devuelve ningún valor.
 */
function comprobarEstado() {
  const rival = turno === "Xs" ? "Os" : "Xs";

  if (!puedeMover(rival)) {
    pintarTablero();
    console.log("¡Fin de la partida! Nadie más puede mover.");
    rl.close();
    return;
  }

  console.log(
    `Las ${turno} se saltan el turno por no tener movimientos válidos.`,
  );
  turno = rival;
  reintentarTurno(2000);
}
/**
 * Valida el formato, la existencia y la disponibilidad de la casilla introducida por el usuario.
 *
 * @function validarCoordenadas
 * @param {string} jugada - La cadena de texto introducida por el usuario (ej. "e3").
 * @returns {{fila: number, columna: number}|null} Un objeto con los índices basados en cero de la matriz `tablero`,
 *                                                 o `null` si la jugada no es válida.
 */
function validarCoordenadas(jugada) {
  if (jugada.length !== 2) {
    console.log("Error: Pon una letra y un número (ej: c4)");
    reintentarTurno(1500);
    return null;
  }

  const letras = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };
  const fila = parseInt(jugada[1]) - 1;
  const columna = letras[jugada[0]];

  if (columna === undefined || isNaN(fila) || fila < 0 || fila > 7) {
    console.log("Error: Esa posición no existe.");
    reintentarTurno(1500);
    return null;
  }

  if (tablero[fila][columna] !== " ") {
    console.log("¡Esa casilla ya está ocupada!");
    reintentarTurno(1500);
    return null;
  }

  return { fila, columna };
}
/**
 * Procesa el movimiento del jugador: verifica las capturas de fichas válidas,
 * actualiza el tablero de juego y cambia el turno al siguiente jugador.
 *
 * @function procesarJugada
 * @param {number} fila - El índice de la fila en el tablero (0 a 7).
 * @param {number} columna - El índice de la columna en el tablero (0 a 7).
 * @returns {void} No devuelve ningún valor.
 */
function procesarJugada(fila, columna) {
  const capturadas = obtenerFichasAVoltear(fila, columna, turno);

  if (capturadas.length === 0) {
    console.log(
      "Movimiento inválido: debes encerrar al menos una ficha rival.",
    );
    reintentarTurno(1500);
    return;
  }

  const ficha = turno === "Xs" ? "X" : "O";
  tablero[fila][columna] = ficha;

  capturadas.forEach(([f, c]) => {
    tablero[f][c] = ficha;
  });

  turno = turno === "Xs" ? "Os" : "Xs";
  jugarTurno();
}
/**
 * Programa la ejecución del próximo turno tras un retraso en milisegundos.
 * Se utiliza principalmente para dar tiempo al usuario a leer mensajes en la consola.
 *
 * @function reintentarTurno
 * @param {number} ms - El tiempo de espera en milisegundos antes de invocar a `jugarTurno`.
 * @returns {void} No devuelve ningún valor.
 */
function reintentarTurno(ms) {
  setTimeout(jugarTurno, ms);
}
/**
 * Controla el flujo del turno actual, gestionando la entrada de usuario y los cambios de estado.
 */
function jugarTurno() {
  if (!puedeMover(turno)) {
    comprobarEstado();
    return;
  }
  pintarTablero();
  rl.question("Introduce casilla (ej. e3): ", (input) => {
    const jugada = input.trim().toLowerCase();

    const coordenadas = validarCoordenadas(jugada);
    if (!coordenadas) return;

    const { fila, columna } = coordenadas;

    procesarJugada(fila, columna);
  });
}

iniciarJuego();
jugarTurno();
