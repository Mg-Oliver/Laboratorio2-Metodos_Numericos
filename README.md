# Laboratorio N.º 2 · Métodos numéricos

Universidad Tecnológica de Panamá · Centro Regional de Azuero

Miguel Oliver (8-1050-1381) y Juan Rodríguez (9-728-1695)

Profesora: Mariluz Centella · Grupo: 7IL121

Presentación del problema de las tres canteras con Gauss, Gauss-Jordan y Gauss-Seidel. Se conservaron las demandas, composiciones y resultados del PDF del laboratorio.

## Abrir la presentación

Abre `index.html` directamente o ejecuta:

```sh
npm run dev
```

Visita http://127.0.0.1:4185. Vue 3.5.22 está incluido en `vendor/`, por lo que las animaciones no requieren conexión. Las fuentes externas tienen alternativas locales del sistema.

## Matrices animadas

Cada método incluye controles de anterior/siguiente, inicio, reproducción, pausa, repetición y velocidad. También puedes elegir cualquier paso con la barra. Con el visor enfocado, usa las flechas o la barra espaciadora.

- Gauss: normalización, desplazamiento de la fila multiplicada, eliminación inferior y sustitución regresiva.
- Gauss-Jordan: eliminación inferior y superior hasta llegar a [I | x].
- Gauss-Seidel: actualización individual de incógnitas y distinción entre valores nuevos y anteriores. La matriz de coeficientes permanece fija.

Cada visor muestra también el código correspondiente al paso actual, con la instrucción activa resaltada y un diccionario de variables con valores reales. Los fragmentos se extraen del motor compartido; los nombres `matrizAumentada`, `filaPivote`, `filaDestino`, `multiplicador` y `solucion` describen su función. Gauss-Seidel separa actualización, cálculo de error y comprobación de parada, conservando las cuatro iteraciones del problema original.

Los cuadros muestran la operación por columna. El redondeo es visual y no se utiliza en operaciones posteriores. En móvil las matrices muestran menos decimales para que se vea también la columna b. Se respeta la preferencia de movimiento reducido.

## Simulador

Modifica las tres demandas y la tolerancia. Compara los resultados y el máximo valor absoluto del residuo Ax − b. El visor se reinicia cuando cambian los datos.

Se rechazan campos vacíos, valores no finitos, demandas negativas y tolerancias no positivas. Una solución con volúmenes negativos se identifica como físicamente inviable. Gauss-Seidel informa si alcanzó la tolerancia o el límite de 100 iteraciones. Su error aproximado mide el cambio entre iteraciones, no el error verdadero. Para un valor actual y anterior ambos cero, se define cambio cero; si solo el actual es cero, el cambio relativo se considera infinito.

## Motor y consola

```sh
npm start
npm test
```

`algoritmos/core.js` es el motor compartido por navegador y consola; genera resultados, residuos y trazas antes/después de cada operación. Los adaptadores de `algoritmos/` conservan la interfaz de consola. Gauss y Gauss-Jordan intercambian filas cuando el pivote no es utilizable. Para exigir Gauss simple sin intercambio, pasa `{pivoting: false}`.

Las pruebas numéricas comprueban la solución de referencia, operaciones de las trazas, inmutabilidad, pivotes cero, sistemas singulares, escalas pequeñas, datos inválidos, convergencia y límite de iteraciones.

La prueba de navegador está en `scripts/check-ui.cjs` y requiere Playwright y Chrome. Ejecuta `node scripts/check-ui.cjs` con Playwright instalado, o configura `PLAYWRIGHT_PATH` al paquete del entorno. Inicia y termina su propio servidor en el puerto 4186. Verifica animación, pausa, navegación, entradas, modal, móvil y movimiento reducido con recursos externos bloqueados. Las capturas temporales van a `tmp/qa/`.

## Estructura

- `index.html`, `styles.css`, `app.js`: presentación y componente animado reutilizable.
- `algoritmos/core.js`: cálculo y trazas de los tres métodos.
- `algoritmos/index.js`: laboratorio en consola.
- `assets/apuntes/`: imágenes originales de apuntes.
- `vendor/`: Vue y su licencia MIT.
- `tests/`, `scripts/`: verificación y servidor local.
- `vercel.json`: configuración del sitio estático.

El sitio conserva la configuración de Vercel; los cambios locales no publican automáticamente una nueva versión.
