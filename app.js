// Lógica de Presentación Web Continua en Vue 3
// Métodos Numéricos - Laboratorio N°2 (UTP Azuero)

const { createApp, ref, computed, onMounted, onUnmounted } = Vue;

const app = createApp({
  setup() {
    const activeSection = ref('portada');

    // Datos del problema en el simulador interactivo
    const matrixA = ref([
      [0.52, 0.20, 0.25],
      [0.30, 0.50, 0.20],
      [0.18, 0.30, 0.55]
    ]);
    const vectorB = ref([4800, 5810, 5690]);
    const seidelTol = ref(5.0);

    // Códigos fuente completos y documentados en JavaScript
    const codeGauss = `/**
 * MÉTODO 1: ELIMINACIÓN GAUSSIANA SIMPLE (N x N)
 * Archivo: gauss.js
 *
 * Implementa la normalización de la fila pivote y eliminación hacia adelante,
 * generando una matriz triangular superior, seguida de sustitución regresiva.
 */
function resolverGauss(A, b) {
  const n = A.length;
  // Construcción de la matriz aumentada [A | b]
  let M = A.map((row, i) => [...row, b[i]]);

  // 1. Eliminación hacia adelante (Normalización e interacciones)
  for (let i = 0; i < n; i++) {
    const pivote = M[i][i];
    if (Math.abs(pivote) < 1e-12) {
      throw new Error(\`Pivote nulo en fila \${i + 1}\`);
    }

    // Normalizar la fila pivote Fila i
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivote;
    }

    // Eliminar incógnita en filas inferiores
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i];
      if (Math.abs(factor) > 1e-12) {
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  // 2. Sustitución hacia atrás
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let suma = M[i][n];
    for (let j = i + 1; j < n; j++) {
      suma -= M[i][j] * x[j];
    }
    x[i] = suma;
  }

  return x;
}`;

    const codeJordan = `/**
 * MÉTODO 2: GAUSS - JORDAN (N x N)
 * Archivo: gauss-jordan.js
 *
 * Transforma la matriz aumentada [A | b] directamente a la Matriz Identidad [I | x]
 * mediante eliminación simultánea por encima y por debajo de cada pivote.
 */
function resolverGaussJordan(A, b) {
  const n = A.length;
  // Construcción de la matriz aumentada [A | b]
  let M = A.map((row, i) => [...row, b[i]]);

  // Eliminación sistemática para cada columna pivote
  for (let i = 0; i < n; i++) {
    const pivote = M[i][i];
    if (Math.abs(pivote) < 1e-12) {
      throw new Error(\`Pivote nulo en fila \${i + 1}\`);
    }

    // Normalizar la fila pivote dividiendo entre el elemento diagonal
    for (let j = 0; j <= n; j++) {
      M[i][j] /= pivote;
    }

    // Hacer ceros en todas las demás filas (arriba y abajo)
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        if (Math.abs(factor) > 1e-12) {
          for (let j = 0; j <= n; j++) {
            M[k][j] -= factor * M[i][j];
          }
        }
      }
    }
  }

  // El vector solución x se obtiene directamente de la última columna
  return M.map(row => row[n]);
}`;

    const codeSeidel = `/**
 * MÉTODO 3: GAUSS - SEIDEL ITERATIVO (N x N)
 * Archivo: gauss-seidel.js
 *
 * Despeja cada incógnita de la diagonal principal y sustituye inmediatamente
 * los valores más recientes calculados, evaluando Ea = |(Va - Vant) / Va| * 100 <= tol.
 */
function resolverGaussSeidel(A, b, tol = 5.0) {
  const n = A.length;
  let xPrev = new Array(n).fill(0);
  let xCurr = new Array(n).fill(0);
  let iter = 0;
  let convergido = false;

  while (iter < 100 && !convergido) {
    iter++;
    const ea = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let suma = b[i];
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          suma -= A[i][j] * xCurr[j];
        }
      }

      const valNuevo = suma / A[i][i];

      // Cálculo del error relativo porcentual Ea
      if (iter > 1) {
        ea[i] = Math.abs((valNuevo - xPrev[i]) / valNuevo) * 100;
      }

      xCurr[i] = valNuevo;
    }

    // Verificación del criterio de parada para todas las incógnitas
    if (iter > 1) {
      convergido = ea.every(e => e <= tol);
    }

    xPrev = [...xCurr];
  }

  return { x: xCurr, iter };
}`;

    // Desglose de iteraciones de Gauss-Seidel
    const seidelIterations = [
      { iter: 1, x1: 9230.77, ea1: null, x2: 6081.54, ea2: null, x3: 4007.27, ea3: null },
      { iter: 2, x1: 4965.14, ea1: 85.91, x2: 7038.01, ea2: 13.59, x3: 4881.59, ea3: 17.91 },
      { iter: 3, x1: 4176.93, ea1: 18.87, x2: 7161.21, ea2: 1.72, x3: 5072.35, ea3: 3.76 },
      { iter: 4, x1: 4037.83, ea1: 3.44, x2: 7168.36, ea2: 0.10, x3: 5113.97, ea3: 0.81 }
    ];

    // Cálculos dinámicos para el simulador
    const calcGauss = computed(() => {
      const A = matrixA.value.map(row => [...row]);
      const b = [...vectorB.value];
      const n = A.length;
      let M = A.map((row, i) => [...row, b[i]]);

      for (let i = 0; i < n; i++) {
        const p = M[i][i];
        for (let j = i; j <= n; j++) M[i][j] /= p;
        for (let k = i + 1; k < n; k++) {
          const f = M[k][i];
          for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j];
        }
      }
      const x = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let suma = M[i][n];
        for (let j = i + 1; j < n; j++) suma -= M[i][j] * x[j];
        x[i] = suma;
      }
      return x;
    });

    const calcSeidel = computed(() => {
      const A = matrixA.value;
      const b = vectorB.value;
      const n = A.length;
      const tol = seidelTol.value;
      let xPrev = new Array(n).fill(0);
      let xCurr = new Array(n).fill(0);
      let iter = 0;
      let conv = false;

      while (iter < 100 && !conv) {
        iter++;
        const ea = new Array(n).fill(0);
        for (let i = 0; i < n; i++) {
          let suma = b[i];
          for (let j = 0; j < n; j++) if (i !== j) suma -= A[i][j] * xCurr[j];
          const val = suma / A[i][i];
          if (iter > 1) ea[i] = Math.abs((val - xPrev[i]) / val) * 100;
          xCurr[i] = val;
        }
        if (iter > 1) conv = ea.every(e => e <= tol);
        xPrev = [...xCurr];
      }
      return { x: xCurr, iter };
    });

    // Cálculos reactivos de volúmenes y porcentajes para gráficas dinámicas
    const totalVolumenCalc = computed(() => {
      const g = calcGauss.value;
      return g[0] + g[1] + g[2];
    });

    const maxValCalc = computed(() => {
      const g = calcGauss.value;
      return Math.max(...g, 1);
    });

    const pctX1 = computed(() => {
      if (totalVolumenCalc.value <= 0) return 0;
      return ((calcGauss.value[0] / totalVolumenCalc.value) * 100).toFixed(1);
    });

    const pctX2 = computed(() => {
      if (totalVolumenCalc.value <= 0) return 0;
      return ((calcGauss.value[1] / totalVolumenCalc.value) * 100).toFixed(1);
    });

    const pctX3 = computed(() => {
      if (totalVolumenCalc.value <= 0) return 0;
      return ((calcGauss.value[2] / totalVolumenCalc.value) * 100).toFixed(1);
    });

    // Control de Modal para Apuntes Manuscritos de Clase
    const apunteModal = ref({
      show: false,
      img: '',
      title: ''
    });

    const openApunte = (imgSrc, title) => {
      apunteModal.value = {
        show: true,
        img: imgSrc,
        title: title
      };
    };

    const closeApunte = () => {
      apunteModal.value.show = false;
    };

    // Control de ScrollSpy
    const handleScroll = () => {
      const sectionIds = [
        'portada', 'introduccion', 'formulacion', 
        'metodo-gauss', 'metodo-jordan', 'metodo-seidel', 
        'simulador', 'comparativa', 'conclusion'
      ];
      const scrollPos = window.scrollY + 220;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            activeSection.value = id;
            break;
          }
        }
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      activeSection,
      codeGauss,
      codeJordan,
      codeSeidel,
      seidelIterations,
      matrixA,
      vectorB,
      seidelTol,
      calcGauss,
      calcSeidel,
      totalVolumenCalc,
      maxValCalc,
      pctX1,
      pctX2,
      pctX3,
      apunteModal,
      openApunte,
      closeApunte
    };
  }
});

app.mount('#app');
