/* La web y la consola comparten algoritmos/core.js. */
const { createApp, ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;
const ORIGINAL_A = [[.52,.20,.25],[.30,.50,.20],[.18,.30,.55]];
const ORIGINAL_B = [4800,5810,5690];
const f = (v, digits = 4) => v == null ? '—' : !Number.isFinite(v) ? '∞' : new Intl.NumberFormat('es-PA', {maximumFractionDigits:digits}).format(Math.abs(v) < 1e-10 ? 0 : v);
const subs = ['₁','₂','₃'];
const MatrixPlayer = {
  props: {method:String, matrix:Array, demands:Array, tolerance:{default:5}},
  setup(props) {
    const position=ref(0), playing=ref(false), speed=ref(1), phase=ref('after');
    const media=window.matchMedia('(prefers-reduced-motion: reduce)'), reduced=ref(media.matches);
    const smallMedia=window.matchMedia('(max-width:600px)'), small=ref(smallMedia.matches);
    const cellFormat=(v,j)=>f(v,small.value?(j===props.matrix.length?2:4):6);
    let timer, motionTimer;
    const result=computed(() => {
      try {
        const fn=props.method==='jordan' ? Numerica.resolverGaussJordan : props.method==='seidel' ? Numerica.resolverGaussSeidel : Numerica.resolverGauss;
        return {data:fn(props.matrix,props.demands,{tol:Number(props.tolerance)})};
      } catch(e) {return {error:e.message};}
    });
    const steps=computed(()=>result.value.data?.pasos || []);
    const step=computed(()=>steps.value[Math.min(position.value,steps.value.length-1)]);
    const shown=computed(()=>phase.value==='moving' ? step.value.before : step.value.matriz);
    const vector=computed(()=>phase.value==='moving' && step.value.type==='iterate' ? step.value.previousX : step.value.x);
    const methodLabel=computed(()=>({gauss:'Gauss',jordan:'Gauss-Jordan',seidel:'Gauss-Seidel'}[props.method]));
    const codePanel=ref(null);
    const codeLines=computed(()=>step.value ? Numerica.obtenerBloqueCodigo(props.method,step.value.type) : []);
    const activeInstruction=computed(()=>({initial:'const solucion',normalize:'matrizAumentada[filaPivote][columna] /=',eliminate:'matrizAumentada[filaDestino][columna] -=',back:'solucion[filaActual] =',solution:'solucion[indiceFila] =',iterate:'solucion[filaActual] =',error:'erroresPorcentuales[filaActual] =',check:'convergio =',swap:'[matrizAumentada[filaPivote]'}[step.value?.type]));
    const activeCodeLines=computed(()=>{
      const start=codeLines.value.findIndex(line=>line.includes(activeInstruction.value));
      if(start<0)return [];
      const indices=[];
      for(let index=start;index<codeLines.value.length;index++){
        indices.push(index);
        if(codeLines.value[index].includes(';'))break;
      }
      return indices;
    });
    const codeExplanation=computed(()=>({
      initial:props.method==='seidel'?'Se prepara el vector solución y se fijan la tolerancia y el límite de iteraciones.':'Se construye [A | b] agregando la demanda al final de cada fila y se reserva el vector solución.',
      normalize:'El bucle recorre todos los coeficientes y también la última columna. Cada elemento de la fila se divide entre el pivote.',
      eliminate:props.method==='jordan'?'esGaussJordan = true: se recorren todas las filas excepto la del pivote, para eliminar por encima y por debajo.':'esGaussJordan = false: se comienza en filaPivote + 1 para eliminar únicamente debajo del pivote.',
      back:'Se suman los términos con incógnitas conocidas y se restan de la demanda. Las filas se recorren desde la última hacia la primera.',
      solution:'La matriz ya es la identidad. Se copia la última columna directamente al vector solución.',
      iterate:'Se suman los términos ajenos a la diagonal y se despeja la incógnita. Se sobrescribe solucion[filaActual], por eso la siguiente ecuación utiliza el valor nuevo.',
      error:'valorAnterior pertenece a la vuelta anterior. Se calcula el cambio relativo porcentual, con tratamiento explícito del cero y de la primera iteración.',
      check:'every exige que todas las incógnitas cumplan la tolerancia. Si convergio es true, se termina el ciclo de iteraciones.',
      swap:'Se intercambian dos ecuaciones para conseguir un pivote utilizable sin cambiar el sistema.'
    }[step.value?.type] || ''));
    const variableDescriptions={numeroIncognitas:'Cantidad de ecuaciones e incógnitas.',esGaussJordan:'true: elimina arriba y abajo; false: solo abajo.',filaPivote:'Índice de la fila que aporta el pivote.',filaDestino:'Índice de la fila que se modifica.',primeraFilaDestino:'Índice desde el que empieza la eliminación.',filaIntercambio:'Índice de la fila que se intercambia.',filaActual:'Índice de la ecuación que se está resolviendo.',pivote:'Coeficiente por el que se divide la fila.',multiplicador:'Factor con el que se multiplica la fila pivote.',sumaConocida:'Suma de los términos con valores disponibles.',valorCalculado:'Valor de la incógnita obtenida en este paso.',iteracion:'Número de vuelta del método iterativo.',valorActual:'Aproximación recién calculada.',valorAnterior:'Aproximación de la vuelta anterior.',errorPorcentual:'Cambio relativo de esta incógnita (%).',erroresPorcentuales:'Cambios relativos de todas las incógnitas (%).',toleranciaPorcentual:'Máximo cambio relativo permitido (%).',maximoIteraciones:'Máximo número de vueltas permitidas.',convergio:'Indica si ya se cumple el criterio de parada.',solucion:'Vector con las incógnitas calculadas.'};
    const variableValues=computed(()=>Object.entries(step.value?.variables || {}).map(([name,value])=>({name,description:variableDescriptions[name],value: typeof value==='boolean'?String(value):Array.isArray(value)?'['+value.map(v=>f(v,4)).join('; ')+']':name.startsWith('fila')||name==='primeraFilaDestino'?`${value} → F${subs[value] || value+1}`:f(value,6)})));
    watch(codeLines,async()=>{
      await nextTick();
      const scroll=codePanel.value?.querySelector('.step-code-scroll');
      const active=codePanel.value?.querySelector('.code-line-active');
      if(scroll && active)scroll.scrollTop=Math.max(0,active.offsetTop-90);
    });
    const stop=()=>{playing.value=false;clearTimeout(timer);};
    function animate() {
      clearTimeout(motionTimer);
      phase.value=reduced.value || position.value===0 ? 'after' : 'moving';
      if(phase.value==='moving') motionTimer=setTimeout(()=>{phase.value='after';},760/speed.value);
    }
    function go(index) {stop();position.value=Math.max(0,Math.min(steps.value.length-1,index));animate();}
    function schedule() {
      clearTimeout(timer);
      if(!playing.value)return;
      timer=setTimeout(()=>{
        if(position.value>=steps.value.length-1){stop();return;}
        position.value++;animate();schedule();
      },2400/speed.value);
    }
    function play() {
      if(playing.value){stop();return;}
      if(position.value===steps.value.length-1){position.value=0;phase.value='after';}
      playing.value=true;schedule();
    }
    const replay=()=>{stop();animate();};
    watch(()=>[props.matrix,props.demands,props.tolerance,props.method],()=>{stop();clearTimeout(motionTimer);position.value=0;phase.value='after';},{deep:true});
    watch(speed,()=>{if(playing.value)schedule();});
    const preferenceChanged=e=>{reduced.value=e.matches;};
    const sizeChanged=e=>{small.value=e.matches;};
    onMounted(()=>{media.addEventListener('change',preferenceChanged);smallMedia.addEventListener('change',sizeChanged);});
    onUnmounted(()=>{stop();clearTimeout(motionTimer);media.removeEventListener('change',preferenceChanged);smallMedia.removeEventListener('change',sizeChanged);});
    const numerator=computed(()=>{
      const s=step.value;if(s?.type!=='iterate')return '';
      return f(props.demands[s.row],4)+' − ('+props.matrix[s.row].map((a,j)=>j===s.row?null:`${f(a)} × ${f(s.previousX[j])}`).filter(Boolean).join(' + ')+')';
    });
    const arithmetic=computed(()=>{
      const s=step.value;
      if(!s || !['normalize','eliminate'].includes(s.type))return [];
      return s.matriz[s.row].map((v,j)=>({label:j===props.matrix.length?'b':'x'+subs[j],
        expression:s.type==='normalize' ? `${f(s.before[s.row][j],6)} ÷ ${f(s.factor,6)}` : `${f(s.before[s.row][j],6)} − (${f(s.factor,6)} × ${f(s.before[s.source][j],6)})`,after:v}));
    });
    function key(e) {
      if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return;
      if(e.key==='ArrowRight'){e.preventDefault();go(position.value+1);}
      if(e.key==='ArrowLeft'){e.preventDefault();go(position.value-1);}
      if(e.key===' '){e.preventDefault();play();}
    }
    return {position,playing,speed,phase,reduced,result,steps,step,shown,vector,go,play,replay,arithmetic,key,f,subs,cellFormat,numerator,methodLabel,codePanel,codeLines,activeCodeLines,codeExplanation,variableValues};
  },
  template:`
  <div class="matrix-player" :class="{'is-moving':phase==='moving','reduced-motion':reduced}" tabindex="0" @keydown="key" :aria-label="'Animación paso a paso: '+method">
    <div class="player-heading"><div><span class="eyebrow">LABORATORIO VISUAL</span><h3>{{method==='seidel'?'Una incógnita a la vez':'Observa cada operación de fila'}}</h3></div><span class="player-count" v-if="steps.length">{{position+1}} / {{steps.length}}</span></div>
    <p v-if="result.error" class="notice error" role="alert">{{result.error}}</p>
    <template v-else-if="step">
      <div class="player-controls">
        <button @click="go(0)" :disabled="position===0" aria-label="Volver al inicio">↺ Inicio</button>
        <button @click="go(position-1)" :disabled="position===0" aria-label="Paso anterior">← Anterior</button>
        <button class="primary" @click="play">{{playing?'Ⅱ Pausar':'▶ Reproducir'}}</button>
        <button @click="go(position+1)" :disabled="position===steps.length-1" aria-label="Paso siguiente">Siguiente →</button>
        <button @click="replay" :disabled="position===0">Repetir paso</button>
        <label class="speed-label">Velocidad <select v-model.number="speed"><option :value="0.5">0.5×</option><option :value="1">1×</option><option :value="1.5">1.5×</option><option :value="2">2×</option></select></label>
      </div>
      <input class="step-range" type="range" min="0" :max="steps.length-1" :value="position" @input="go(Number($event.target.value))" aria-label="Elegir paso">
      <div class="operation-title" aria-live="polite"><span class="step-num-badge">{{step.iter?'Iteración '+step.iter:'Paso '+(position+1)}}</span><h4>{{step.titulo}}</h4><p>{{step.descripcion}}</p></div>
      <div class="formula-display structured-math" v-if="step.type==='iterate'"><span>x<sub>{{step.row+1}}</sub><sup>({{step.iter}})</sup> = </span><span class="math-fraction"><span>{{numerator}}</span><span>{{f(matrix[step.row][step.row])}}</span></span><span> ≈ {{f(step.x[step.row],6)}}</span></div>
      <div class="formula-display" v-else>{{step.formula}}</div>
      <div class="execution-layout">
      <div class="execution-math">
      <div class="visual-stage" :class="{'seidel-stage':method==='seidel'}">
        <div class="matrix-panel">
          <div class="matrix-caption"><span>{{method==='seidel'?'Matriz A fija · sistema original':phase==='moving'?'Antes de aplicar la operación':'Matriz después de la operación'}}</span><span class="stage-pill">{{phase==='moving'?'Aplicando…':'Resultado'}}</span></div>
          <div class="matrix-board" :style="{'--motion-duration':(760/speed)+'ms'}">
            <div class="matrix-column-labels"><span></span><span v-for="(r,j) in matrix" :key="j">x{{subs[j]}}</span><span>b</span></div>
            <div v-for="(row,i) in shown" :key="i" class="animated-row" :class="{'target-row':i===step.row,'source-row':i===step.source,'normalizing':phase==='moving'&&step.type==='normalize'&&i===step.row}">
              <span class="row-name">F{{subs[i]}}</span>
              <div v-for="(v,j) in row" :key="j" class="animated-cell" :class="{'rhs-cell':j===matrix.length,'pivot-cell':j===step.col&&i===(step.source??step.row),'changed-cell':phase==='after'&&step.before[i][j]!==v}">
                <Transition name="number" mode="out-in"><span :key="cellFormat(v,j)">{{cellFormat(v,j)}}</span></Transition>
              </div>
            </div>
            <div v-if="phase==='moving'&&(step.type==='eliminate'||step.type==='swap')" :key="position" class="travelling-row" :style="{'--from':(step.source*56+30)+'px','--distance':((step.row-step.source)*56)+'px'}">
              <span class="row-name">{{step.type==='swap'?'↔':'× '+f(step.factor,2)}}</span><span v-for="(v,j) in step.before[step.source]" :key="j">{{cellFormat(step.type==='swap'?v:v*step.factor,j)}}</span>
            </div>
          </div>
          <div class="matrix-legend"><span><i class="legend-pivot"></i>Pivote</span><span><i class="legend-source"></i>Fila utilizada</span><span><i class="legend-target"></i>Fila actualizada</span></div>
        </div>
        <div class="vector-panel" v-if="method==='seidel'||step.type==='back'||step.type==='solution'">
          <h4>{{method==='seidel'?'Valores usados en esta vuelta':'Solución por sustitución'}}</h4>
          <div v-for="(v,j) in vector" :key="j" class="vector-value" :class="{'vector-active':j===step.row,'vector-new':method==='seidel'&&(step.type==='check'||j<step.row)}"><span>x{{subs[j]}}</span><Transition name="number" mode="out-in"><strong :key="f(v)">{{f(v)}}</strong></Transition><small>{{phase==='moving'&&step.type==='iterate'&&j===step.row?'calculando…':method==='seidel'&&step.iter?(step.type==='check'||j<=step.row)?'nuevo · vuelta '+step.iter:'anterior · vuelta '+(step.iter-1):v===null?'por calcular':'m³'}}</small></div>
          <p class="small-note" v-if="method==='seidel'">El valor recién calculado se usa inmediatamente en la siguiente ecuación.</p>
        </div>
      </div>
      <div class="arithmetic-grid" v-if="arithmetic.length"><div v-for="(a,j) in arithmetic" :key="position+':'+j" class="arithmetic-card"><span class="eyebrow">{{a.label==='b'?'TÉRMINO INDEPENDIENTE':'COEFICIENTE DE '+a.label}}</span><p>{{a.expression}}</p><strong>≈ {{f(a.after,6)}}</strong></div></div>
      </div>
      <aside class="step-code-panel" ref="codePanel" :aria-label="'Código sincronizado de '+methodLabel">
        <div class="step-code-heading"><span class="eyebrow">CÓDIGO EN ESTE PASO</span><strong>{{methodLabel}}</strong><span class="code-language">JavaScript</span></div>
        <p class="code-step-label">{{step.titulo}}</p>
        <div class="step-code-scroll" tabindex="0" aria-label="Fragmento de código del paso actual"><pre class="step-code"><code><span v-for="(line,index) in codeLines" :key="step.type+':'+index" class="step-code-line" :class="{'code-line-active':activeCodeLines.includes(index)}"><span class="code-line-number" aria-hidden="true">{{index+1}}</span><span class="code-line-text">{{line || ' '}}</span><span class="code-active-marker" v-if="activeCodeLines.includes(index)" aria-label="Instrucción activa">←</span></span></code></pre></div>
        <p class="code-explanation">{{codeExplanation}}</p>
        <div class="step-variables"><h4>Variables en este paso</h4><dl><div v-for="variable in variableValues" :key="variable.name"><dt><code>{{variable.name}}</code><small>{{variable.description}}</small></dt><dd>{{variable.value}}</dd></div></dl></div>
        <p class="code-source-note"><code>coeficientes</code> = A · <code>terminosIndependientes</code> = b · <code>solucion</code> = x.<br>Fragmento del motor real <a href="algoritmos/core.js" target="_blank" rel="noopener">core.js</a>; omite el registro de las trazas. Los índices empiezan en 0: índice 0 = fila 1. La numeración es relativa a este bloque.</p>
      </aside>
      </div>
      <div class="notice" v-if="position===steps.length-1"><strong>{{method==='seidel'?result.data.converged?'Criterio de parada alcanzado':'No se alcanzó la tolerancia':'Solución calculada'}}</strong><p>x = [{{result.data.x.map(v=>f(v)).join('; ')}}] m³ · Máximo |Ax − b| = {{f(Math.max(...result.data.residual.map(Math.abs)),8)}} m³</p><p v-if="method==='seidel'">Ea mide el cambio entre iteraciones; no es el error respecto de la solución de referencia.</p></div>
      <p class="player-help">Flechas ← →: avanzar. Espacio: reproducir o pausar. Las cifras mostradas están redondeadas; los cálculos conservan su precisión.</p>
    </template>
  </div>`
};

const app=createApp({
  setup() {
    const activeSection=ref('portada'),menuOpen=ref(false);
    const matrixA=ref(ORIGINAL_A.map(r=>[...r])),vectorB=ref([...ORIGINAL_B]),seidelTol=ref(5),simMethod=ref('gauss');
    const validation=computed(()=>{
      if(vectorB.value.some(v=>typeof v!=='number'||!Number.isFinite(v)))return 'Completa las tres demandas con números finitos.';
      if(vectorB.value.some(v=>v<0))return 'Las demandas de materiales no pueden ser negativas.';
      if(!Number.isFinite(seidelTol.value)||seidelTol.value<=0)return 'La tolerancia debe ser mayor que cero.';
      return '';
    });
    const simulation=computed(()=>{
      if(validation.value)return {error:validation.value};
      try{return {gauss:Numerica.resolverGauss(matrixA.value,vectorB.value),jordan:Numerica.resolverGaussJordan(matrixA.value,vectorB.value),seidel:Numerica.resolverGaussSeidel(matrixA.value,vectorB.value,{tol:seidelTol.value})};}
      catch(e){return {error:e.message};}
    });
    const calcGauss=computed(()=>simulation.value.gauss?.x||[0,0,0]),calcSeidel=computed(()=>simulation.value.seidel);
    const feasible=computed(()=>!simulation.value.error&&calcGauss.value.every(v=>v>=-1e-8));
    const totalVolumenCalc=computed(()=>calcGauss.value.reduce((s,v)=>s+v,0)),maxValCalc=computed(()=>Math.max(...calcGauss.value,1));
    const pct=j=>computed(()=>totalVolumenCalc.value>0?f(Math.max(0,calcGauss.value[j])/totalVolumenCalc.value*100,1):'0');
    const seidelIterations=Numerica.resolverGaussSeidel(ORIGINAL_A,ORIGINAL_B).history.map(h=>({iter:h.iter,x1:h.x[0],x2:h.x[1],x3:h.x[2],ea1:h.ea[0],ea2:h.ea[1],ea3:h.ea[2]}));
    const codeGauss=Numerica.resolverGauss.toString()+'\n\n// Implementación común de métodos directos.\n'+Numerica.sourceDirect;
    const codeJordan=Numerica.resolverGaussJordan.toString()+'\n\n// Implementación común de métodos directos.\n'+Numerica.sourceDirect;
    const codeSeidel=Numerica.resolverGaussSeidel.toString();
    const apunteModal=ref({show:false,img:'',title:''});let previousFocus;
    const closeApunte=()=>{apunteModal.value.show=false;document.body.style.overflow='';previousFocus?.focus();};
    const openApunte=async(img,title)=>{previousFocus=document.activeElement;apunteModal.value={show:true,img,title};document.body.style.overflow='hidden';await nextTick();document.querySelector('.apunte-modal-close').focus();};
    const keyboard=e=>{if(!apunteModal.value.show)return;if(e.key==='Escape')closeApunte();if(e.key==='Tab'){e.preventDefault();document.querySelector('.apunte-modal-close').focus();}};
    const reset=()=>{vectorB.value=[...ORIGINAL_B];seidelTol.value=5;};let observer;
    onMounted(()=>{document.addEventListener('keydown',keyboard);observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)activeSection.value=e.target.id;},{rootMargin:'-15% 0px -70% 0px'});document.querySelectorAll('section[id]').forEach(el=>observer.observe(el));});
    onUnmounted(()=>{observer?.disconnect();document.removeEventListener('keydown',keyboard);document.body.style.overflow='';});
    return {activeSection,menuOpen,codeGauss,codeJordan,codeSeidel,seidelIterations,matrixA,vectorB,seidelTol,simMethod,originalA:ORIGINAL_A,originalB:ORIGINAL_B,simulation,validation,feasible,calcGauss,calcSeidel,totalVolumenCalc,maxValCalc,pctX1:pct(0),pctX2:pct(1),pctX3:pct(2),apunteModal,openApunte,closeApunte,reset,f};
  }
});
app.component('matrix-player',MatrixPlayer);
app.mount('#app');
