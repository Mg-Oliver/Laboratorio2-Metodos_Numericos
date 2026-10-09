const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const server = require('node:child_process').spawn(process.execPath, [require('node:path').join(__dirname, 'serve.js')], {env:{...process.env,PORT:'4186'},stdio:['ignore','pipe','pipe']});
(async()=>{
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Servidor terminado: '+code)));});
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Bloquea peticiones remotas: la interacción debe funcionar sin CDN.
  await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:4186') ? route.continue() : route.abort());
  await page.goto('http://127.0.0.1:4186');
  // El desplazamiento suave de la página no debe competir con los clics de QA.
  await page.addStyleTag({content:'html { scroll-behavior: auto !important; }'});
  await page.waitForSelector('.matrix-player');
  assert.equal(await page.locator('.matrix-player').count(),4);
  // El código y las variables deben seguir al paso, también al retroceder.
  for(const [id,positions] of [['metodo-gauss',[0,1,2,9]],['metodo-jordan',[0,1,2,10]],['metodo-seidel',[0,1,2,7,28]]]){
    const visor=page.locator('#'+id+' .matrix-player');
    for(const position of positions){
      await visor.locator('.step-range').fill(String(position));
      assert.ok(await visor.locator('.code-line-active').count()>0);
      assert.equal(await visor.locator('.code-step-label').innerText(),await visor.locator('.operation-title h4').innerText());
      assert.ok(await visor.locator('.step-variables dt').count()>0);
    }
    await visor.getByRole('button',{name:'Volver al inicio',exact:true}).click();
  }
  const player=page.locator('#metodo-gauss .matrix-player');
  await player.scrollIntoViewIfNeeded();
  await player.getByRole('button',{name:'Paso siguiente',exact:true}).click();
  await page.waitForTimeout(900);
  assert.match(await player.locator('.formula-display').innerText(),/F₁ ← F₁/);
  assert.equal(await player.locator('.arithmetic-card').count(),4);
  assert.match(await player.locator('.step-code').innerText(),/matrizAumentada\[filaPivote\]\[columna\] \/= pivote/);
  await player.getByRole('button',{name:'Paso siguiente',exact:true}).click();
  assert.equal(await player.locator('.travelling-row').count(),1);
  await page.waitForTimeout(950);
  fs.mkdirSync('tmp/qa',{recursive:true});
  await player.screenshot({path:'tmp/qa/matrices-desktop.png'});
  await player.getByRole('button',{name:'Reproducir'}).click();await page.waitForTimeout(2700);
  await player.getByRole('button',{name:'Pausar'}).click();
  const pos=await player.locator('.player-count').innerText();await page.waitForTimeout(2700);
  assert.equal(await player.locator('.player-count').innerText(),pos);
  await player.locator('.step-range').fill(await player.locator('.step-range').getAttribute('max'));await page.waitForTimeout(900);
  assert.match(await player.locator('.notice').innerText(),/4,011/);
  await page.locator('#demand-0').fill('');assert.match(await page.locator('.sim-results').innerText(),/Completa/);
  for(let i=0;i<3;i++)await page.locator('#demand-'+i).fill('0');
  assert.match(await page.locator('.sim-results').innerText(),/2 iteraciones/);
  await page.locator('#demand-0').fill('100');assert.match(await page.locator('.sim-results').innerText(),/no es viable/);
  await page.locator('#demand-0').fill('-1');assert.match(await page.locator('.sim-results').innerText(),/no pueden ser negativas/);
  await page.getByRole('button',{name:'Restaurar problema original'}).click();
  await page.locator('#tolerance').fill('0');assert.match(await page.locator('.sim-results').innerText(),/mayor que cero/);
  await page.getByRole('button',{name:'Restaurar problema original'}).click();
  await page.locator('#simulador .method-selector').getByRole('button',{name:'Gauss-Seidel',exact:true}).click();
  const seidel=page.locator('#simulador .matrix-player');await seidel.getByRole('button',{name:'Paso siguiente',exact:true}).click();await page.waitForTimeout(900);
  assert.equal(await seidel.locator('.vector-active').count(),1);
  assert.match(await seidel.locator('.step-code').innerText(),/sumaConocida/);
  await seidel.getByRole('button',{name:'Paso siguiente',exact:true}).click();
  assert.match(await seidel.locator('.step-code').innerText(),/valorAnterior/);
  await page.locator('#metodo-gauss details').evaluate(el=>el.open=true);
  await page.locator('#metodo-gauss .apunte-btn').first().click();await page.waitForSelector('[role=dialog]');await page.keyboard.press('Escape');assert.equal(await page.locator('[role=dialog]').count(),0);
  await page.locator('#metodo-gauss details').evaluate(el=>el.open=false);
  await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4186');await page.waitForSelector('.matrix-player');
  await page.addStyleTag({content:'html { scroll-behavior: auto !important; }'});
  await page.getByRole('button',{name:/Secciones/}).click();assert.equal(await page.locator('.nav-links.menu-open').count(),1);
  await page.locator('.nav-links a[href="#metodo-gauss"]').click();
  await page.locator('#metodo-gauss .matrix-player').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.locator('#metodo-gauss .matrix-player').screenshot({path:'tmp/qa/matrices-mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForSelector('.matrix-player');
  await page.locator('#metodo-gauss .matrix-player').getByRole('button',{name:'Paso siguiente',exact:true}).click();
  assert.equal(await page.locator('#metodo-gauss .matrix-player.is-moving').count(),0);
  assert.deepEqual(errors,[]);console.log('UI: matrices, desplazamientos, pausa, solución, validaciones, simulador, modal, móvil y movimiento reducido: OK.');
  await browser.close();server.kill();
})().catch(e=>{console.error(e);server.kill();process.exit(1);});
