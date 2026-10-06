// Adaptador de consola: el navegador utiliza el mismo motor de cálculo.
const core = require('./core.js');
function resolverGaussSeidel(A, b, options = {}) {
  const result = core.resolverGaussSeidel(A, b, options);
  if (options.verbose !== false) {
    console.log('\nresolverGaussSeidel');
    for (const paso of result.pasos) {
      console.log('\n' + paso.titulo + ': ' + paso.formula);
      if (paso.type !== 'iterate') console.table(paso.matriz);
    }
    if (result.history) console.table(result.history.map(h => ({iter: h.iter, x: h.x.join(', '), error: h.ea.join(', ')})));
    console.log('Solución:', result.x);
  }
  return result;
}
module.exports = { resolverGaussSeidel };
