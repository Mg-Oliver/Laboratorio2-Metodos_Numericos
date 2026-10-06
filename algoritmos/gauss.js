/**
 * Métodos Numéricos para Ingenieros - Laboratorio N°2
 * Algoritmo 1: Eliminación Gaussiana Simple (Matriz General N x N)
 * 
 * Universidad Tecnológica de Panamá - Centro Regional de Azuero
 */

function resolverGauss(A, b, options = { verbose: true }) {
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
    console.log("             MÉTODO 1: ELIMINACIÓN GAUSSIANA (SIMPLE)");
    console.log("========================================================================");
  }

  registrarPaso("Paso 1: Matriz Aumentada Inicial [A | b]", `Dimensiones del sistema: ${n} x ${n}`);

  // Eliminación hacia adelante con normalización de fila pivote
  for (let i = 0; i < n; i++) {
    const pivote = M[i][i];
    if (Math.abs(pivote) < 1e-12) {
      throw new Error(`Pivote nulo o muy cercano a cero en la fila ${i + 1}. Requiere pivoteo.`);
    }

    // Normalizar la fila pivote Fila i
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivote;
    }
    registrarPaso(
      `Normalización Fila ${i + 1}`,
      `Dividir Fila ${i + 1} entre el coeficiente pivote a_${i + 1}${i + 1} = ${pivote.toFixed(6)}`
    );

    // Eliminar la incógnita x_{i+1} en las filas inferiores (k > i)
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i];
      if (Math.abs(factor) > 1e-12) {
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
        registrarPaso(
          `Eliminación de x_${i + 1} en Fila ${k + 1}`,
          `Fila ${k + 1} = Fila ${k + 1} - (${factor.toFixed(6)}) × Fila ${i + 1} (normalizada)`
        );
      }
    }
  }

  // Sustitución hacia atrás
  const x = new Array(n).fill(0);
  if (verbose) {
    console.log("\n========================================================================");
    console.log("                     SUSTITUCIÓN HACIA ATRÁS");
    console.log("========================================================================");
  }

  for (let i = n - 1; i >= 0; i--) {
    let suma = M[i][n];
    for (let j = i + 1; j < n; j++) {
      suma -= M[i][j] * x[j];
    }
    x[i] = suma;
    if (verbose) {
      console.log(`▸ x_${i + 1} = ${x[i].toFixed(4)} (Valor exacto: ${x[i].toFixed(6)})`);
    }
  }

  return { x, pasos, M };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolverGauss };
}
