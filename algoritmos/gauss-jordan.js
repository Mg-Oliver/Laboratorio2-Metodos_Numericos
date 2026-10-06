/**
 * Métodos Numéricos para Ingenieros - Laboratorio N°2
 * Algoritmo 2: Método de Gauss - Jordan (Matriz General N x N)
 * 
 * Universidad Tecnológica de Panamá - Centro Regional de Azuero
 */

function resolverGaussJordan(A, b, options = { verbose: true }) {
  const verbose = options.verbose !== false;
  const n = A.length;

  if (b.length !== n) {
    throw new Error("El número de filas de A debe ser igual a la dimensión del vector b.");
  }
  for (let i = 0; i < n; i++) {
    if (A[i].length !== n) {
      throw new Error(`La matriz debe ser cuadrada (N x N). Fila ${i + 1} tiene dimensión ${A[i].length}.`);
    }
  }

  // Copia profunda de la matriz aumentada [A|b]
  let M = A.map((row, i) => [...row, b[i]]);
  const pasos = [];

  function registrarPaso(titulo, descripcion) {
    const snapshot = M.map(row => [...row]);
    pasos.push({ titulo, descripcion, matriz: snapshot });
    if (verbose) {
      console.log(`\n📌 ${titulo}`);
      console.log(`   ${descripcion}`);
      imprimirMatriz(snapshot, n);
    }
  }

  function imprimirMatriz(mat, nCols) {
    console.log("   ┌" + "─".repeat(nCols * 14 + 18) + "┐");
    mat.forEach((row) => {
      const coefs = row.slice(0, nCols).map(v => v.toFixed(6).padStart(12)).join(" ");
      const indep = row[nCols].toFixed(4).padStart(14);
      console.log(`   │ ${coefs} │ ${indep} │`);
    });
    console.log("   └" + "─".repeat(nCols * 14 + 18) + "┘");
  }

  if (verbose) {
    console.log("========================================================================");
    console.log("                  MÉTODO 2: GAUSS - JORDAN");
    console.log("========================================================================");
  }

  registrarPaso("Paso 1: Matriz Aumentada Inicial [A | b]", `Dimensiones del sistema: ${n} x ${n}`);

  // Reducción a Matriz Identidad
  for (let i = 0; i < n; i++) {
    const pivote = M[i][i];
    if (Math.abs(pivote) < 1e-12) {
      throw new Error(`Pivote nulo o muy cercano a cero en la fila ${i + 1}.`);
    }

    // Normalizar la fila pivote Fila i
    for (let j = 0; j <= n; j++) {
      M[i][j] /= pivote;
    }
    registrarPaso(
      `Normalización Fila ${i + 1}`,
      `Dividir Fila ${i + 1} entre su elemento pivote a_${i + 1}${i + 1} = ${pivote.toFixed(6)}`
    );

    // Hacer ceros por encima y por debajo de la fila pivote k != i
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        if (Math.abs(factor) > 1e-12) {
          for (let j = 0; j <= n; j++) {
            M[k][j] -= factor * M[i][j];
          }
          registrarPaso(
            `Eliminación en Fila ${k + 1}`,
            `Fila ${k + 1} = Fila ${k + 1} - (${factor.toFixed(6)}) × Fila ${i + 1} (normalizada)`
          );
        }
      }
    }
  }

  // Extraer el vector solución directamente de la última columna
  const x = M.map(row => row[n]);

  return { x, pasos, M };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolverGaussJordan };
}
