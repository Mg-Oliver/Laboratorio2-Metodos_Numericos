/**
 * Métodos Numéricos para Ingenieros - Laboratorio N°2
 * Algoritmo 3: Método Iterativo de Gauss - Seidel (Matriz General N x N)
 * 
 * Universidad Tecnológica de Panamá - Centro Regional de Azuero
 */

function resolverGaussSeidel(A, b, options = {}) {
  const n = A.length;
  const x0 = options.x0 || new Array(n).fill(0);
  const tol = options.tol !== undefined ? options.tol : 5.0; // Error asignado 5% según el documento
  const maxIter = options.maxIter || 100;
  const verbose = options.verbose !== false;

  if (b.length !== n) {
    throw new Error("El número de filas de A debe ser igual a la dimensión del vector b.");
  }

  let xPrev = [...x0];
  let xCurr = [...x0];
  const historial = [];

  if (verbose) {
    console.log("========================================================================");
    console.log("                  MÉTODO 3: GAUSS - SEIDEL");
    console.log("========================================================================");
    console.log(`▸ Criterio de parada asignado: Error aproximado Ea ≤ ${tol}%`);
    console.log(`▸ Valores iniciales asumidos: [ ${x0.join(", ")} ]\n`);
    
    let headerStr = "┌──────";
    for (let i = 0; i < n; i++) {
      headerStr += `┬────────────┬──────────`;
    }
    headerStr += "┐";
    console.log(headerStr);

    let colNames = "│ Iter ";
    for (let i = 0; i < n; i++) {
      colNames += `│   x_${i + 1}      │  Ea(x_${i + 1})  `;
    }
    colNames += "│";
    console.log(colNames);

    let sepStr = "├──────";
    for (let i = 0; i < n; i++) {
      sepStr += `┼────────────┼──────────`;
    }
    sepStr += "┤";
    console.log(sepStr);
  }

  let iter = 0;
  let convergido = false;

  while (iter < maxIter && !convergido) {
    iter++;
    const ea = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let suma = b[i];
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          suma -= A[i][j] * xCurr[j];
        }
      }
      
      if (Math.abs(A[i][i]) < 1e-12) {
        throw new Error(`Elemento diagonal a_${i+1}${i+1} es cero. No se puede despejar x_${i+1}.`);
      }

      const valNuevo = suma / A[i][i];

      if (iter > 1) {
        ea[i] = Math.abs((valNuevo - xPrev[i]) / valNuevo) * 100;
      } else {
        ea[i] = null; // No hay valor previo para calcular error en iteración 1
      }

      xCurr[i] = valNuevo;
    }

    historial.push({
      iter,
      x: [...xCurr],
      ea: [...ea]
    });

    if (verbose) {
      let rowStr = `│ ${iter.toString().padStart(4)} │`;
      for (let i = 0; i < n; i++) {
        const valStr = xCurr[i].toFixed(2).padStart(10);
        const eaStr = ea[i] !== null ? `${ea[i].toFixed(2)}%`.padStart(8) : "       -";
        rowStr += ` ${valStr} │ ${eaStr} │`;
      }
      console.log(rowStr);
    }

    if (iter > 1) {
      convergido = ea.every(e => e <= tol);
    }

    xPrev = [...xCurr];
  }

  if (verbose) {
    let footerStr = "└──────";
    for (let i = 0; i < n; i++) {
      footerStr += `┴────────────┴──────────`;
    }
    footerStr += "┘";
    console.log(footerStr);
  }

  return {
    x: xCurr,
    iterations: iter,
    converged: convergido,
    history: historial
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolverGaussSeidel };
}
