// Servidor local sin dependencias: npm run dev.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end();return; }
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root+path.sep) || target.includes(path.sep+'.git'+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(target,(error,data)=>{if(error){res.writeHead(404).end('No encontrado');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
}).listen(Number(process.env.PORT)||4185,'127.0.0.1',()=>console.log('Laboratorio: http://127.0.0.1:'+(process.env.PORT||4185)));
