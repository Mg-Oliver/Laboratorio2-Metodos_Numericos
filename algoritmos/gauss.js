// Adaptador de consola: el navegador utiliza el mismo motor de cálculo.
const core = require('./core.js');
function resolverGauss(coeficientes, terminosIndependientes, opciones = {}) {
  const resultado = core.resolverGauss(coeficientes, terminosIndependientes, opciones);
  if (opciones.verbose !== false) {
    console.log('\nresolverGauss');
    for (const paso of resultado.pasos) {
      console.log('\n' + paso.titulo + ': ' + paso.formula);
      if (paso.type !== 'iterate') console.table(paso.matriz);
    }
    if (resultado.history) console.table(resultado.history.map(h => ({iter: h.iter, x: h.x.join(', '), error: h.ea.join(', ')})));
    console.log('Solución:', resultado.x);
  }
  return resultado;
}
module.exports = { resolverGauss };
