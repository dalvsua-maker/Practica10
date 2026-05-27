/**
 * @file reversi-terminal.js
 * @description Versión para terminal del juego Reversi (Othello).
 */

const readline = require("readline");

let tablero = [];
let turno = "blanca";

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
  tablero[3][3] = "B";
  tablero[4][4] = "B";
  tablero[3][4] = "N";
  tablero[4][3] = "N";
}

/**
 * Dibuja el estado actual del tablero y el marcador en la terminal.
 */
function pintarTablero() {
  console.clear();
  console.log("=== REVERSI ===");

  let blancas = 0;
  let negras = 0;
  for (let f = 0; f < 8; f++) {
    for (let c = 0; c < 8; c++) {
      if (tablero[f][c] === "B") blancas++;
      if (tablero[f][c] === "N") negras++;
    }
  }

  console.log(
    `Jugador 1 (Blancas): ${blancas} | Jugador 2 (Negras): ${negras}`,
  );
  console.log(`Turno: ${turno === "blanca" ? "Blancas" : "Negras"}\n`);

  console.log("    a   b   c   d   e   f   g   h");
  console.log("  +---+---+---+---+---+---+---+---+");

  for (let f = 0; f < 8; f++) {
    let fila = `${f + 1} |`;
    for (let c = 0; c < 8; c++) {
      fila += ` ${tablero[f][c]} |`;
    }
    console.log(fila);
    console.log("  +---+---+---+---+---+---+---+---+");
  }
  console.log();
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

  const fichaMia = colorActual === "blanca" ? "B" : "N";
  const fichaRival = colorActual === "blanca" ? "N" : "B";

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
 * Controla el flujo del turno actual, gestionando la entrada de usuario y los cambios de estado.
 */
function jugarTurno() {
  if (!puedeMover(turno)) {
    let rival = turno === "blanca" ? "negra" : "blanca";

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
    setTimeout(jugarTurno, 2000);
    return;
  }

  pintarTablero();

  rl.question("Introduce casilla (ej. e3): ", (input) => {
    const jugada = input.trim().toLowerCase();

    if (jugada.length !== 2) {
      console.log("Error: Pon una letra y un número (ej: c4)");
      setTimeout(jugarTurno, 1500);
      return;
    }

    const letras = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };
    const fila = parseInt(jugada[1]) - 1;
    const columna = letras[jugada[0]];

    if (columna === undefined || isNaN(fila) || fila < 0 || fila > 7) {
      console.log("Error: Esa posición no existe.");
      setTimeout(jugarTurno, 1500);
      return;
    }

    if (tablero[fila][columna] !== " ") {
      console.log("¡Esa casilla ya está ocupada!");
      setTimeout(jugarTurno, 1500);
      return;
    }

    const capturadas = obtenerFichasAVoltear(fila, columna, turno);

    if (capturadas.length > 0) {
      tablero[fila][columna] = turno === "blanca" ? "B" : "N";

      capturadas.forEach(([f, c]) => {
        tablero[f][c] = turno === "blanca" ? "B" : "N";
      });

      turno = turno === "blanca" ? "negra" : "blanca";
      jugarTurno();
    } else {
      console.log(
        "Movimiento inválido: debes encerrar al menos una ficha rival.",
      );
      setTimeout(jugarTurno, 1500);
    }
  });
}

iniciarJuego();
jugarTurno();
