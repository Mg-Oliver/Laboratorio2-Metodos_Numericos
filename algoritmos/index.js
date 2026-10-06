/**
 * UNIVERSIDAD TECNOLÓGICA DE PANAMÁ - CENTRO REGIONAL DE AZUERO
 * FACULTAD DE INGENIERÍA DE SISTEMAS COMPUTACIONALES
 * MÉTODOS NUMÉRICOS PARA INGENIEROS
 * 
 * LABORATORIO N° 2: MÉTODOS DE ECUACIONES LINEALES SIMULTÁNEAS
 * (Eliminación Gaussiana, Gauss - Jordan y Gauss - Seidel)
 * 
 * Estudiantes:
 * - Miguel Oliver (8-1050-1381)
 * - Juan Rodríguez (6-728-1695)
 * Profesora: Mariluz Centella | Grupo: 7IL121
 */

const { resolverGauss } = require('./gauss.js');
const { resolverGaussJordan } = require('./gauss-jordan.js');
const { resolverGaussSeidel } = require('./gauss-seidel.js');

function ejecutarLaboratorioCanteras() {
  console.log("========================================================================");
  console.log("     UNIVERSIDAD TECNOLÓGICA DE PANAMÁ - FACULTAD DE SISTEMAS");
  console.log("          LABORATORIO N°2: ECUACIONES LINEALES SIMULTÁNEAS");
  console.log("========================================================================\n");

  console.log("📋 REDACCIÓN DEL PROBLEMA (INGENIERO CIVIL):");
  console.log("Un ingeniero civil requiere 4,800 m³ de arena, 5,810 m³ de grava fina y 5,690 m³ de grava gruesa");
  console.log("para la construcción de un proyecto. La empresa cuenta con 3 canteras con la siguiente composición:");
  console.log("  • Cantera 1: 52% Arena, 30% Grava Fina, 18% Grava Gruesa");
  console.log("  • Cantera 2: 20% Arena, 50% Grava Fina, 30% Grava Gruesa");
  console.log("  • Cantera 3: 25% Arena, 20% Grava Fina, 55% Grava Gruesa\n");

  console.log("📐 FORMULACIÓN DEL SISTEMA DE ECUACIONES:");
  console.log("  Variables: x₁ = m³ Cantera 1 | x₂ = m³ Cantera 2 | x₃ = m³ Cantera 3");
  console.log("  (Ec. 1 - Arena):       0.52 x₁ + 0.20 x₂ + 0.25 x₃ = 4,800 m³");
  console.log("  (Ec. 2 - Grava Fina):  0.30 x₁ + 0.50 x₂ + 0.20 x₃ = 5,810 m³");
  console.log("  (Ec. 3 - Grava Gruesa):0.18 x₁ + 0.30 x₂ + 0.55 x₃ = 5,690 m³\n");

  const A = [
    [0.52, 0.20, 0.25],
    [0.30, 0.50, 0.20],
    [0.18, 0.30, 0.55]
  ];
  const b = [4800, 5810, 5690];

  // 1. Ejecución Eliminación Gaussiana
  const resGauss = resolverGauss(A, b, { verbose: true });

  // 2. Ejecución Gauss - Jordan
  const resJordan = resolverGaussJordan(A, b, { verbose: true });

  // 3. Ejecución Gauss - Seidel (Error asignado a 5%)
  const resSeidel = resolverGaussSeidel(A, b, { tol: 5.0, verbose: true });

  // Cuadro Comparativo
  console.log("\n========================================================================");
  console.log("                     CUADRO COMPARATIVO DE RESULTADOS");
  console.log("========================================================================");
  console.log("┌───────────────────────────────────┬──────────────┬──────────────┬──────────────┐");
  console.log("│ Método Aplicado                   │ x₁ (Cantera 1)│ x₂ (Cantera 2)│ x₃ (Cantera 3)│");
  console.log("├───────────────────────────────────┼──────────────┼──────────────┼──────────────┤");
  console.log(`│ 1. Eliminación de Gauss           │ ${resGauss.x[0].toFixed(2).padStart(8)} m³ │ ${resGauss.x[1].toFixed(2).padStart(8)} m³ │ ${resGauss.x[2].toFixed(2).padStart(8)} m³ │`);
  console.log(`│ 2. Gauss - Jordan                 │ ${resJordan.x[0].toFixed(2).padStart(8)} m³ │ ${resJordan.x[1].toFixed(2).padStart(8)} m³ │ ${resJordan.x[2].toFixed(2).padStart(8)} m³ │`);
  console.log(`│ 3. Gauss - Seidel (Iteración ${resSeidel.iterations}, 5%)│ ${resSeidel.x[0].toFixed(2).padStart(8)} m³ │ ${resSeidel.x[1].toFixed(2).padStart(8)} m³ │ ${resSeidel.x[2].toFixed(2).padStart(8)} m³ │`);
  console.log("└───────────────────────────────────┴──────────────┴──────────────┴──────────────┘");

  console.log("\n========================================================================");
  console.log("           INTERPRETACIÓN DE RESULTADOS Y PREGUNTAS DEL LABORATORIO");
  console.log("========================================================================");
  
  console.log("\n❓ 1. ¿Cuál método converge más rápido?");
  console.log("  ▸ Respuesta: Los métodos directos (Gauss y Gauss-Jordan) obtienen el resultado");
  console.log("    exacto en un número fijo y determinado de pasos (operaciones matriciales directo).");
  console.log("    Gauss-Seidel es un método iterativo que para la tolerancia asignada del 5% al canzar");
  console.log(`    el criterio de parada en ${resSeidel.iterations} iteraciones. Para sistemas 3x3 pequeños, Gauss simple`);
  console.log("    requiere menor número global de operaciones aritméticas.");

  console.log("\n❓ 2. ¿Cuál es más preciso?");
  console.log("  ▸ Respuesta: Los métodos directos (Gauss y Gauss-Jordan) son más precisos al no depender");
  console.log("    de un criterio de tolerancia de detención; la precisión solo está limitada por");
  console.log("    la aritmética de punto flotante de la máquina.");

  console.log("\n❓ 3. ¿Cuál es más exacto?");
  console.log("  ▸ Respuesta: Eliminación Gaussiana y Gauss-Jordan ofrecen la solución matemática exacta");
  console.log("    del sistema de ecuaciones simultáneas.");

  console.log("\n❓ 4. Respuesta a la pregunta del problema:");
  console.log("  ▸ Para cumplir con la demanda de 4,800 m³ de arena, 5,810 m³ de grava fina y 5,690 m³ de grava gruesa,");
  console.log("    el ingeniero civil debe extraer:");
  console.log(`      • Cantera 1: ${resGauss.x[0].toFixed(2)} m³  (Exacto: ${resGauss.x[0].toFixed(4)} m³)`);
  console.log(`      • Cantera 2: ${resGauss.x[1].toFixed(2)} m³  (Exacto: ${resGauss.x[1].toFixed(4)} m³)`);
  console.log(`      • Cantera 3: ${resGauss.x[2].toFixed(2)} m³  (Exacto: ${resGauss.x[2].toFixed(4)} m³)`);
  console.log("========================================================================\n");
}

if (require.main === module) {
  ejecutarLaboratorioCanteras();
}

module.exports = { ejecutarLaboratorioCanteras };
