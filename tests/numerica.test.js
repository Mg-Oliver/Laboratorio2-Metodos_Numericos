const test = require('node:test');
const assert = require('node:assert/strict');
const {resolverGauss:g,resolverGaussJordan:j,resolverGaussSeidel:s,obtenerBloqueCodigo} = require('../algoritmos/core');
const A = [[.52,.2,.25],[.3,.5,.2],[.18,.3,.55]], b = [4800,5810,5690];
const close = (a,b,tol=1e-8) => assert.ok(Math.abs(a-b)<=tol, `${a} != ${b}`);
for (const [name,fn] of [['Gauss',g],['Jordan',j]]) {
  test(name+': solución de referencia y entradas inmutables',()=>{
    const input=JSON.stringify([A,b]),r=fn(A,b);
    r.x.forEach((v,i)=>close(v,[172500/43,308000/43,220400/43][i]));
    r.residual.forEach(v=>close(v,0));assert.equal(JSON.stringify([A,b]),input);
  });
  test(name+': cada traza corresponde a la operación indicada',()=>{
    for(const p of fn(A,b).pasos){
      if(p.type==='normalize')p.matriz[p.row].forEach((v,c)=>close(v,p.before[p.row][c]/p.factor));
      if(p.type==='eliminate')p.matriz[p.row].forEach((v,c)=>close(v,p.before[p.row][c]-p.factor*p.before[p.source][c]));
    }
  });
  test(name+': pivote cero, singularidad y escala',()=>{
    assert.deepEqual(fn([[0,1],[1,1]],[1,2]).x,[1,1]);
    assert.throws(()=>fn([[1,1],[2,2]],[1,2]),/solución única/);
    assert.throws(()=>fn([[0,1],[1,1]],[1,2],{pivoting:false}),/Pivote cero/);
    assert.deepEqual(fn([[1e-20,0],[0,1e-20]],[1e-20,2e-20]).x,[1,2]);
  });
}
test('Seidel: cuatro iteraciones y uso inmediato de valores nuevos',()=>{
  const r=s(A,b);assert.equal(r.iterations,4);assert.equal(r.converged,true);
  close(r.history[0].x[0],4800/.52);close(r.history[0].x[1],(5810-.3*r.history[0].x[0])/.5);
  assert.equal(r.pasos.filter(p=>p.type==='iterate').length,12);
  assert.equal(r.pasos.filter(p=>p.type==='error').length,12);
  assert.equal(r.pasos.filter(p=>p.type==='check').length,4);
  assert.ok(r.history.at(-1).ea.every(e=>e<=5));
  assert.equal(s(A,b,{tol:.0001}).converged,true);
});
test('Cada paso tiene código real y variables correspondientes a su operación',()=>{
  for(const [metodo,fn] of [['gauss',g],['jordan',j],['seidel',s]]){
    const resultado=fn(A,b);
    for(const paso of resultado.pasos){
      const bloque=obtenerBloqueCodigo(metodo,paso.type).join('\n');
      assert.ok(bloque.length>20);
      assert.ok(!bloque.includes('@codigo')&&!bloque.includes('@fin'));
      assert.ok(paso.variables);
      if(paso.type==='normalize')close(paso.variables.pivote,paso.before[paso.row][paso.col]);
      if(paso.type==='eliminate')close(paso.variables.multiplicador,paso.before[paso.row][paso.col]);
      if(paso.type==='iterate')close(paso.variables.valorActual,paso.x[paso.row]);
      if(paso.type==='error')assert.equal(paso.variables.errorPorcentual,paso.ea[paso.row]);
    }
    if(metodo==='seidel')assert.equal(resultado.pasos.at(-1).variables.convergio,true);
  }
  const intercambio=g([[0,1],[1,1]],[1,2]).pasos.find(p=>p.type==='swap');
  assert.match(obtenerBloqueCodigo('gauss',intercambio.type).join('\n'),/filaIntercambio/);
  assert.match(obtenerBloqueCodigo('jordan','eliminate').join('\n'),/esGaussJordan \? 0 : filaPivote \+ 1/);
});
test('Seidel: soluciones cero y detección del límite',()=>{
  const zero=s(A,[0,0,0]);assert.equal(zero.converged,true);assert.equal(zero.iterations,2);
  assert.deepEqual(zero.x,[0,0,0]);assert.equal(s([[1,2],[2,1]],[1,1]).converged,false);
  assert.equal(s(A,b,{maxIter:1}).status,'max-iterations');
});
test('Validaciones de datos y parámetros',()=>{
  for(const fn of [g,j,s]){
    assert.throws(()=>fn([[1],[0]],[1,2]),/cuadrada/);
    assert.throws(()=>fn([[NaN,0],[0,1]],[1,2]),/finitos/);
    assert.throws(()=>fn([],[]));
  }
  assert.throws(()=>s(A,b,{x0:[0]}));assert.throws(()=>s(A,b,{tol:0}));
  assert.throws(()=>s(A,b,{maxIter:0}));assert.throws(()=>s([[0]],[1]));
});
