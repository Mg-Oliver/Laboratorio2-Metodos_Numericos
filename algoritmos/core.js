/* Motor compartido. Los bloques @codigo vinculan las operaciones ejecutadas
 * con el visor didáctico, sin mantener una segunda implementación. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Numerica = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const copiarMatriz = matriz => matriz.map(fila => [...fila]);
  const subindice = indice => String(indice + 1).replace(/\d/g, digito => '₀₁₂₃₄₅₆₇₈₉'[digito]);
  const formatear = valor => Number.isFinite(valor) ? Number(valor.toFixed(6)).toString() : '—';

  function validate(coeficientes, terminosIndependientes) {
    if (!Array.isArray(coeficientes) || !coeficientes.length || !Array.isArray(terminosIndependientes) || terminosIndependientes.length !== coeficientes.length)
      throw new Error('A debe ser una matriz no vacía y b debe tener una entrada por fila.');
    if (coeficientes.some(fila => !Array.isArray(fila) || fila.length !== coeficientes.length))
      throw new Error('La matriz A debe ser cuadrada (N × N).');
    if (coeficientes.some(fila => fila.some(valor => !Number.isFinite(valor))) || terminosIndependientes.some(valor => !Number.isFinite(valor)))
      throw new Error('Todos los coeficientes y demandas deben ser números finitos.');
  }
  function residual(coeficientes, terminosIndependientes, solucion) {
    return coeficientes.map((fila, indiceFila) => fila.reduce((suma, coeficiente, columna) => suma + coeficiente * solucion[columna], 0) - terminosIndependientes[indiceFila]);
  }

  function resolverDirecto(coeficientes, terminosIndependientes, esGaussJordan, opciones = {}) {
    validate(coeficientes, terminosIndependientes);
    // @codigo initial
    const numeroIncognitas = coeficientes.length;
    const matrizAumentada = coeficientes.map((fila, indiceFila) => [
      ...fila, terminosIndependientes[indiceFila]
    ]);
    const solucion = Array(numeroIncognitas).fill(null);
    // @fin
    const pasos = [];
    const escalas = coeficientes.map(fila => Math.max(...fila.map(Math.abs)));
    function registrarPaso(datos, matrizAnterior) {
      pasos.push({ ...datos, before: copiarMatriz(matrizAnterior || matrizAumentada), matriz: copiarMatriz(matrizAumentada), x: [...solucion] });
    }
    registrarPaso({ type: 'initial', titulo: 'Sistema inicial', descripcion: 'Cada fila representa una ecuación. La última columna contiene la demanda.', formula: '[A | b]', variables: {numeroIncognitas, esGaussJordan} });
    for (let filaPivote = 0; filaPivote < numeroIncognitas; filaPivote++) {
      let filaIntercambio = filaPivote;
      if (Math.abs(matrizAumentada[filaPivote][filaPivote]) <= Number.EPSILON * 32 * escalas[filaPivote]) {
        if (opciones.pivoting === false) throw new Error(`Pivote cero en F${subindice(filaPivote)}. Activa el pivoteo para intercambiar filas.`);
        for (let filaCandidata = filaPivote + 1; filaCandidata < numeroIncognitas; filaCandidata++) {
          if (Math.abs(matrizAumentada[filaCandidata][filaPivote]) / (escalas[filaCandidata] || 1) > Math.abs(matrizAumentada[filaIntercambio][filaPivote]) / (escalas[filaIntercambio] || 1)) filaIntercambio = filaCandidata;
        }
      }
      if (!escalas[filaIntercambio] || Math.abs(matrizAumentada[filaIntercambio][filaPivote]) <= Number.EPSILON * 32 * escalas[filaIntercambio])
        throw new Error('El sistema no tiene solución única: revisa si es incompatible o indeterminado.');
      if (filaIntercambio !== filaPivote) {
        const matrizAnterior = copiarMatriz(matrizAumentada);
        // @codigo swap
        [matrizAumentada[filaPivote], matrizAumentada[filaIntercambio]] =
          [matrizAumentada[filaIntercambio], matrizAumentada[filaPivote]];
        [escalas[filaPivote], escalas[filaIntercambio]] =
          [escalas[filaIntercambio], escalas[filaPivote]];
        // @fin
        registrarPaso({ type: 'swap', row: filaPivote, source: filaIntercambio, col: filaPivote, titulo: 'Intercambio de filas', formula: `F${subindice(filaPivote)} ↔ F${subindice(filaIntercambio)}`, descripcion: 'Las ecuaciones cambian de posición para obtener un pivote utilizable.', variables: {filaPivote, filaIntercambio} }, matrizAnterior);
      }
      let matrizAnterior = copiarMatriz(matrizAumentada);
      // @codigo normalize
      const pivote = matrizAumentada[filaPivote][filaPivote];
      for (let columna = 0; columna <= numeroIncognitas; columna++) {
        matrizAumentada[filaPivote][columna] /= pivote;
      }
      matrizAumentada[filaPivote][filaPivote] = 1;
      // @fin
      registrarPaso({ type: 'normalize', row: filaPivote, source: filaPivote, col: filaPivote, factor: pivote, titulo: `Normalizar F${subindice(filaPivote)}`, formula: `F${subindice(filaPivote)} ← F${subindice(filaPivote)} / ${formatear(pivote)}`, descripcion: 'Divide todos los términos de la fila, incluida la demanda, entre el pivote.', variables: {filaPivote, pivote, numeroIncognitas} }, matrizAnterior);
      // @codigo eliminate
      const primeraFilaDestino = esGaussJordan ? 0 : filaPivote + 1;
      for (let filaDestino = primeraFilaDestino; filaDestino < numeroIncognitas; filaDestino++) {
        if (filaDestino === filaPivote || matrizAumentada[filaDestino][filaPivote] === 0) continue;
        matrizAnterior = copiarMatriz(matrizAumentada);
        const multiplicador = matrizAumentada[filaDestino][filaPivote];
        for (let columna = 0; columna <= numeroIncognitas; columna++) {
          matrizAumentada[filaDestino][columna] -=
            multiplicador * matrizAumentada[filaPivote][columna];
        }
        matrizAumentada[filaDestino][filaPivote] = 0;
        // @fin
        registrarPaso({ type: 'eliminate', row: filaDestino, source: filaPivote, col: filaPivote, factor: multiplicador, titulo: `Eliminar x${subindice(filaPivote)} de F${subindice(filaDestino)}`, formula: `F${subindice(filaDestino)} ← F${subindice(filaDestino)} − (${formatear(multiplicador)}) · F${subindice(filaPivote)}`, descripcion: esGaussJordan ? 'Anula este coeficiente por encima o por debajo del pivote.' : 'Anula este coeficiente debajo del pivote para formar una matriz triangular.', variables: {filaPivote, filaDestino, primeraFilaDestino, multiplicador, esGaussJordan} }, matrizAnterior);
      }
    }
    if (esGaussJordan) {
      // @codigo solution
      matrizAumentada.forEach((fila, indiceFila) => {
        solucion[indiceFila] = fila[numeroIncognitas];
      });
      // @fin
      registrarPaso({ type: 'solution', titulo: 'Leer la solución', formula: '[I | x]', descripcion: 'La matriz identidad deja cada incógnita igual al término de la última columna.', variables: {numeroIncognitas, solucion: [...solucion]} });
    } else {
      // @codigo back
      for (let filaActual = numeroIncognitas - 1; filaActual >= 0; filaActual--) {
        let sumaConocida = 0;
        for (let columna = filaActual + 1; columna < numeroIncognitas; columna++) {
          sumaConocida += matrizAumentada[filaActual][columna] * solucion[columna];
        }
        solucion[filaActual] = matrizAumentada[filaActual][numeroIncognitas] - sumaConocida;
        // @fin
        const terminos = matrizAumentada[filaActual].slice(filaActual + 1, numeroIncognitas).map((valor, indice) => `(${formatear(valor)}) · (${formatear(solucion[filaActual + indice + 1])})`);
        registrarPaso({ type: 'back', row: filaActual, col: filaActual, titulo: `Sustituir para obtener x${subindice(filaActual)}`, formula: `x${subindice(filaActual)} = ${formatear(matrizAumentada[filaActual][numeroIncognitas])}${terminos.length ? ' − (' + terminos.join(' + ') + ')' : ''} = ${formatear(solucion[filaActual])}`, descripcion: 'Usa las incógnitas ya calculadas, desde la última ecuación hacia la primera.', variables: {filaActual, sumaConocida, valorCalculado: solucion[filaActual]} });
      }
    }
    if (solucion.some(valor => !Number.isFinite(valor))) throw new Error('El cálculo excede la precisión numérica disponible.');
    return { x: solucion, M: matrizAumentada, pasos, residual: residual(coeficientes, terminosIndependientes, solucion) };
  }
  function resolverGauss(coeficientes, terminosIndependientes, opciones) {
    return resolverDirecto(coeficientes, terminosIndependientes, false, opciones);
  }
  function resolverGaussJordan(coeficientes, terminosIndependientes, opciones) {
    return resolverDirecto(coeficientes, terminosIndependientes, true, opciones);
  }
  function resolverGaussSeidel(coeficientes, terminosIndependientes, opciones = {}) {
    validate(coeficientes, terminosIndependientes);
    // @codigo initial
    const numeroIncognitas = coeficientes.length;
    const toleranciaPorcentual = opciones.tol ?? 5;
    const maximoIteraciones = opciones.maxIter ?? 100;
    const solucion = [...(opciones.x0 ?? Array(numeroIncognitas).fill(0))];
    // @fin
    if (!Number.isFinite(toleranciaPorcentual) || toleranciaPorcentual <= 0 || !Number.isInteger(maximoIteraciones) || maximoIteraciones < 1)
      throw new Error('La tolerancia debe ser positiva y el máximo de iteraciones un entero positivo.');
    if (solucion.length !== numeroIncognitas || solucion.some(valor => !Number.isFinite(valor))) throw new Error('El vector inicial debe tener N números finitos.');
    if (coeficientes.some((fila, indiceFila) => fila[indiceFila] === 0)) throw new Error('Gauss-Seidel requiere coeficientes diagonales distintos de cero.');
    const historial = [], pasos = [];
    const matrizAumentada = coeficientes.map((fila, indiceFila) => [...fila, terminosIndependientes[indiceFila]]);
    pasos.push({ type: 'initial', titulo: 'Aproximación inicial', descripcion: 'A permanece fija; se actualiza el vector solución.', formula: 'x⁽⁰⁾ = [' + solucion.map(formatear).join(', ') + ']', matriz: copiarMatriz(matrizAumentada), before: copiarMatriz(matrizAumentada), x: [...solucion], variables: {numeroIncognitas, toleranciaPorcentual, maximoIteraciones} });
    let convergio = false, estado = 'max-iterations';
    for (let iteracion = 1; iteracion <= maximoIteraciones; iteracion++) {
      const solucionAnterior = [...solucion], erroresPorcentuales = [];
      for (let filaActual = 0; filaActual < numeroIncognitas; filaActual++) {
        const valoresUsados = [...solucion];
        // @codigo iterate
        let sumaConocida = 0;
        for (let columna = 0; columna < numeroIncognitas; columna++) {
          if (columna !== filaActual) {
            sumaConocida += coeficientes[filaActual][columna] * solucion[columna];
          }
        }
        solucion[filaActual] =
          (terminosIndependientes[filaActual] - sumaConocida) / coeficientes[filaActual][filaActual];
        // @fin
        // @codigo error
        const valorActual = solucion[filaActual];
        const valorAnterior = solucionAnterior[filaActual];
        erroresPorcentuales[filaActual] = iteracion === 1 ? null
          : valorActual === 0 ? (valorAnterior === 0 ? 0 : Infinity)
          : Math.abs((valorActual - valorAnterior) / valorActual) * 100;
        // @fin
        const terminos = coeficientes[filaActual].map((coeficiente, columna) => columna === filaActual ? null : `(${formatear(coeficiente)}) · (${formatear(valoresUsados[columna])})`).filter(Boolean);
        const variables = {iteracion, filaActual, sumaConocida, valorActual, valorAnterior, errorPorcentual: erroresPorcentuales[filaActual]};
        const basePaso = {iter: iteracion, row: filaActual, col: filaActual, matriz: copiarMatriz(matrizAumentada), before: copiarMatriz(matrizAumentada), previousX: valoresUsados, x: [...solucion], ea: [...erroresPorcentuales], variables};
        pasos.push({ ...basePaso, type: 'iterate', titulo: `Iteración ${iteracion} · actualizar x${subindice(filaActual)}`, formula: `x${subindice(filaActual)}⁽${iteracion}⁾ = (${formatear(terminosIndependientes[filaActual])} − (${terminos.join(' + ') || '0'})) / ${formatear(coeficientes[filaActual][filaActual])} = ${formatear(valorActual)}`, descripcion: 'La solución se actualiza en el mismo vector: los valores nuevos se usan inmediatamente.' });
        pasos.push({ ...basePaso, type: 'error', titulo: `Medir el cambio de x${subindice(filaActual)}`, formula: iteracion === 1 ? 'Primera iteración: no se evalúa el error relativo.' : `Eₐ(x${subindice(filaActual)}) = ${Number.isFinite(erroresPorcentuales[filaActual]) ? formatear(erroresPorcentuales[filaActual]) + ' %' : '∞'}`, descripcion: 'Compara el valor recién calculado con el de la iteración anterior. Si ambos son cero, el cambio se define como cero.' });
      }
      const valoresFinitos = solucion.every(Number.isFinite);
      const residuo = valoresFinitos ? residual(coeficientes, terminosIndependientes, solucion) : Array(numeroIncognitas).fill(Infinity);
      historial.push({iter: iteracion, x: [...solucion], ea: [...erroresPorcentuales], residual: residuo});
      if (!valoresFinitos) { estado = 'non-finite'; break; }
      // @codigo check
      convergio = iteracion > 1 && erroresPorcentuales.every(
        errorPorcentual => errorPorcentual <= toleranciaPorcentual
      );
      // @fin
      pasos.push({ type: 'check', iter: iteracion, titulo: 'Comprobar el criterio de parada', formula: convergio ? 'Todos los errores cumplen la tolerancia: detener.' : 'Aún no se cumple el criterio: continuar si quedan iteraciones.', descripcion: 'La primera vuelta no se usa para detenerse por error relativo. Después se exige que todas las incógnitas cumplan la tolerancia.', matriz: copiarMatriz(matrizAumentada), before: copiarMatriz(matrizAumentada), x: [...solucion], ea: [...erroresPorcentuales], variables: {iteracion, erroresPorcentuales: [...erroresPorcentuales], toleranciaPorcentual, convergio} });
      if (convergio) { estado = 'converged'; break; }
    }
    return { x: solucion, iterations: historial.length, converged: convergio, status: estado, history: historial, pasos, residual: residual(coeficientes, terminosIndependientes, solucion) };
  }

  // Se extrae el código de las funciones que realmente producen las trazas.
  function obtenerBloqueCodigo(metodo, tipoPaso) {
    const fuente = (metodo === 'seidel' ? resolverGaussSeidel : resolverDirecto).toString().replace(/\r\n/g, '\n');
    const inicio = fuente.indexOf('// @codigo ' + tipoPaso + '\n');
    if (inicio < 0) throw new Error('No existe código asociado al paso ' + tipoPaso);
    const inicioBloque = fuente.indexOf('\n', inicio) + 1;
    const finalBloque = fuente.indexOf('// @fin', inicioBloque);
    const lineas = fuente.slice(inicioBloque, finalBloque).trimEnd().split('\n');
    const sangria = Math.min(...lineas.filter(linea => linea.trim()).map(linea => linea.match(/^ */)[0].length));
    const bloque = lineas.map(linea => linea.slice(sangria));
    // El cierre del bucle está después del registro de la traza en el motor.
    if (tipoPaso === 'eliminate' || tipoPaso === 'back') bloque.push('}');
    return bloque;
  }
  return { resolverGauss, resolverGaussJordan, resolverGaussSeidel, residual, validate, obtenerBloqueCodigo, sourceDirect: resolverDirecto.toString() };
});
