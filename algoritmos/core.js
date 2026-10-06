/* Motor compartido de consola y navegador. Las trazas conservan cada operación
 * sin redondear los cálculos; el redondeo pertenece exclusivamente a la vista. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Numerica = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const copy = M => M.map(row => [...row]);
  const sub = i => String(i + 1).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
  const fmt = v => Number.isFinite(v) ? Number(v.toFixed(6)).toString() : '—';
  function validate(A, b) {
    if (!Array.isArray(A) || !A.length || !Array.isArray(b) || b.length !== A.length)
      throw new Error('A debe ser una matriz no vacía y b debe tener una entrada por fila.');
    if (A.some(row => !Array.isArray(row) || row.length !== A.length))
      throw new Error('La matriz A debe ser cuadrada (N × N).');
    if (A.some(row => row.some(v => !Number.isFinite(v))) || b.some(v => !Number.isFinite(v)))
      throw new Error('Todos los coeficientes y demandas deben ser números finitos.');
  }
  function residual(A, b, x) {
    return A.map((row, i) => row.reduce((s, v, j) => s + v * x[j], 0) - b[i]);
  }
  function direct(A, b, jordan, options = {}) {
    validate(A, b);
    const n = A.length, M = A.map((row, i) => [...row, b[i]]), pasos = [];
    const x = Array(n).fill(null);
    const scales = A.map(row => Math.max(...row.map(Math.abs)));
    const record = (data, before) => pasos.push({ ...data, before: copy(before || M), matriz: copy(M), x: [...x] });
    record({ type: 'initial', titulo: 'Sistema inicial', descripcion: 'Cada fila representa una ecuación. La última columna contiene la demanda.', formula: '[A | b]' });
    for (let i = 0; i < n; i++) {
      // Pivoteo escalado: respeta las filas originales cuando ya son adecuadas.
      let p = i;
      if (Math.abs(M[i][i]) <= Number.EPSILON * 32 * scales[i]) {
        if (options.pivoting === false) throw new Error(`Pivote cero en F${sub(i)}. Activa el pivoteo para intercambiar filas.`);
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(M[k][i]) / (scales[k] || 1) > Math.abs(M[p][i]) / (scales[p] || 1)) p = k;
        }
      }
      if (!scales[p] || Math.abs(M[p][i]) <= Number.EPSILON * 32 * scales[p])
        throw new Error('El sistema no tiene solución única: revisa si es incompatible o indeterminado.');
      if (p !== i) {
        const before = copy(M); [M[i], M[p]] = [M[p], M[i]]; [scales[i], scales[p]] = [scales[p], scales[i]];
        record({ type: 'swap', row: i, source: p, col: i, titulo: 'Intercambio de filas', formula: `F${sub(i)} ↔ F${sub(p)}`, descripcion: 'Las ecuaciones cambian de posición para obtener un pivote utilizable.' }, before);
      }
      let before = copy(M), divisor = M[i][i];
      for (let j = 0; j <= n; j++) M[i][j] /= divisor;
      M[i][i] = 1;
      record({ type: 'normalize', row: i, source: i, col: i, factor: divisor, titulo: `Normalizar F${sub(i)}`, formula: `F${sub(i)} ← F${sub(i)} / ${fmt(divisor)}`, descripcion: 'Divide todos los términos de la fila, incluida la demanda, entre el pivote.' }, before);
      for (let k = jordan ? 0 : i + 1; k < n; k++) {
        if (k === i || M[k][i] === 0) continue;
        before = copy(M); const factor = M[k][i];
        for (let j = 0; j <= n; j++) M[k][j] -= factor * M[i][j];
        M[k][i] = 0;
        record({ type: 'eliminate', row: k, source: i, col: i, factor, titulo: `Eliminar x${sub(i)} de F${sub(k)}`, formula: `F${sub(k)} ← F${sub(k)} − (${fmt(factor)}) · F${sub(i)}`, descripcion: jordan ? 'Anula este coeficiente por encima o por debajo del pivote.' : 'Anula este coeficiente debajo del pivote para formar una matriz triangular.' }, before);
      }
    }
    if (jordan) {
      M.forEach((row, i) => x[i] = row[n]);
      record({ type: 'solution', titulo: 'Leer la solución', formula: '[I | x]', descripcion: 'La matriz identidad deja cada incógnita igual al término de la última columna.' });
    } else {
      for (let i = n - 1; i >= 0; i--) {
        x[i] = M[i][n] - M[i].slice(i + 1, n).reduce((s, v, j) => s + v * x[i + j + 1], 0);
        const terms = M[i].slice(i + 1, n).map((v, j) => `(${fmt(v)}) · (${fmt(x[i + j + 1])})`);
        record({ type: 'back', row: i, col: i, titulo: `Sustituir para obtener x${sub(i)}`, formula: `x${sub(i)} = ${fmt(M[i][n])}${terms.length ? ' − (' + terms.join(' + ') + ')' : ''} = ${fmt(x[i])}`, descripcion: 'Usa las incógnitas ya calculadas, desde la última ecuación hacia la primera.' });
      }
    }
    if (x.some(v => !Number.isFinite(v))) throw new Error('El cálculo excede la precisión numérica disponible.');
    return { x, M, pasos, residual: residual(A, b, x) };
  }
  function resolverGauss(A, b, options) { return direct(A, b, false, options); }
  function resolverGaussJordan(A, b, options) { return direct(A, b, true, options); }
  function resolverGaussSeidel(A, b, options = {}) {
    validate(A, b);
    const n = A.length, tol = options.tol ?? 5, maxIter = options.maxIter ?? 100;
    let x = [...(options.x0 ?? Array(n).fill(0))];
    if (!Number.isFinite(tol) || tol <= 0 || !Number.isInteger(maxIter) || maxIter < 1)
      throw new Error('La tolerancia debe ser positiva y el máximo de iteraciones un entero positivo.');
    if (x.length !== n || x.some(v => !Number.isFinite(v))) throw new Error('El vector inicial debe tener N números finitos.');
    if (A.some((row, i) => row[i] === 0)) throw new Error('Gauss-Seidel requiere coeficientes diagonales distintos de cero.');
    const history = [], pasos = [];
    const M = A.map((row, i) => [...row, b[i]]);
    pasos.push({ type: 'initial', titulo: 'Aproximación inicial', descripcion: 'Comienza con todas las incógnitas en cero. A permanece fija; se actualiza el vector x.', formula: 'x⁽⁰⁾ = [' + x.map(fmt).join(', ') + ']', matriz: copy(M), before: copy(M), x: [...x] });
    let converged = false, status = 'max-iterations';
    for (let iter = 1; iter <= maxIter; iter++) {
      const prev = [...x], ea = [];
      for (let i = 0; i < n; i++) {
        const used = [...x], sum = A[i].reduce((s, a, j) => j === i ? s : s + a * x[j], 0);
        x[i] = (b[i] - sum) / A[i][i];
        ea[i] = iter === 1 ? null : x[i] === 0 ? (prev[i] === 0 ? 0 : Infinity) : Math.abs((x[i] - prev[i]) / x[i]) * 100;
        const terms = A[i].map((a, j) => j === i ? null : `(${fmt(a)}) · (${fmt(used[j])})`).filter(Boolean);
        pasos.push({ type: 'iterate', iter, row: i, col: i, titulo: `Iteración ${iter} · actualizar x${sub(i)}`, formula: `x${sub(i)}⁽${iter}⁾ = (${fmt(b[i])} − (${terms.join(' + ') || '0'})) / ${fmt(A[i][i])} = ${fmt(x[i])}`, descripcion: 'Las incógnitas anteriores de esta vuelta usan su valor nuevo; las siguientes conservan el de la vuelta anterior.', matriz: copy(M), before: copy(M), previousX: used, x: [...x], ea: [...ea] });
      }
      const finite = x.every(Number.isFinite);
      const r = finite ? residual(A, b, x) : Array(n).fill(Infinity);
      history.push({ iter, x: [...x], ea: [...ea], residual: r });
      if (!finite) { status = 'non-finite'; break; }
      converged = iter > 1 && ea.every(e => e <= tol);
      if (converged) { status = 'converged'; break; }
    }
    return { x, iterations: history.length, converged, status, history, pasos, residual: residual(A, b, x) };
  }
  return { resolverGauss, resolverGaussJordan, resolverGaussSeidel, residual, validate, sourceDirect: direct.toString() };
});
