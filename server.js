'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),url=require('url');
const ROOT=__dirname, PORT=Number(process.env.PORT||3000), DATA_DIR=path.join(ROOT,'data'), DB_FILE=process.env.DB_PATH||path.join(DATA_DIR,'db.json'), UPLOAD_DIR=path.join(ROOT,'storage','uploads');
fs.mkdirSync(DATA_DIR,{recursive:true});fs.mkdirSync(UPLOAD_DIR,{recursive:true});

function detectMediaType(u){const s=String(u||'');if(/instagram\.com/i.test(s))return 'instagram';if(/facebook\.com|fb\.watch/i.test(s))return 'facebook';if(/youtube\.com|youtu\.be/i.test(s))return 'youtube';return 'local'}

const defaults={business_name:'Daily Fashion',whatsapp:'5521996431650',instagram:'https://www.instagram.com/',facebook:'https://www.facebook.com/',business_hours:'Segunda a sábado, 9h às 18h'};

const seedProducts=[
 {name:'Vestido Essência',category:'Vestidos',price:'R$ 189,90',encomenda:'nao',prazo:'',image:'img/daily.jpg',status:'publicado',order:1},
 {name:'Conjunto Áurea',category:'Conjuntos',price:'R$ 219,90',encomenda:'nao',prazo:'',image:'img/daily 0.jpg',status:'publicado',order:2},
 {name:'Blusa Encanto',category:'Blusas',price:'R$ 99,90',encomenda:'nao',prazo:'',image:'img/daily2.jpg',status:'publicado',order:3},
 {name:'Vestido Sob Medida',category:'Vestidos',price:'R$ 259,90',encomenda:'sim',prazo:'10 dias úteis',image:'img/daily3.jpg',status:'publicado',order:4},
 {name:'Conjunto Bela',category:'Conjuntos',price:'R$ 229,90',encomenda:'nao',prazo:'',image:'img/daily4.jpg',status:'publicado',order:5},
 {name:'Blusa Personalizada',category:'Blusas',price:'R$ 119,90',encomenda:'sim',prazo:'7 dias úteis',image:'img/daily5.jpg',status:'publicado',order:6},
 {name:'Vestido Charme',category:'Vestidos',price:'R$ 199,90',encomenda:'nao',prazo:'',image:'img/daily6.jpg',status:'publicado',order:7},
 {name:'Conjunto Sob Encomenda',category:'Conjuntos',price:'R$ 249,90',encomenda:'sim',prazo:'12 dias úteis',image:'img/daily7.jpg',status:'publicado',order:8},
 {name:'Blusa Diária',category:'Blusas',price:'R$ 89,90',encomenda:'nao',prazo:'',image:'img/daily8.jpg',status:'publicado',order:9},
 {name:'Vestido Exclusivo',category:'Vestidos',price:'R$ 279,90',encomenda:'sim',prazo:'10 dias úteis',image:'img/daily(9.jpg',status:'publicado',order:10},
 {name:'Conjunto Elegance',category:'Conjuntos',price:'R$ 239,90',encomenda:'nao',prazo:'',image:'img/daily10.jpg',status:'publicado',order:11}
];
const seedVideos=[
 {title:'Bastidores da coleção',category:'Institucional',url:'img/video1.mp4',type:'local',caption:'Direto do ateliê da Daily Fashion',status:'publicado',order:1},
 {title:'Daily Fashion — Reel',category:'Coleção',url:'img/dailyfashion.tere_20260502_reel_3888175437201716175_1_3888175437201716175 (2).mp4',type:'local',caption:'Vídeo da coleção Daily Fashion',status:'publicado',order:2}
];

function hashPassword(p,s=crypto.randomBytes(16).toString('hex')){return `${s}:${crypto.scryptSync(p,s,64).toString('hex')}`}
function verifyPassword(p,h){try{const [s,x]=h.split(':');const y=crypto.scryptSync(p,s,64).toString('hex');return crypto.timingSafeEqual(Buffer.from(x,'hex'),Buffer.from(y,'hex'))}catch{return false}}

function readDB(){
 if(!fs.existsSync(DB_FILE)){
  const db={seq:{users:0,products:0,videos:0,orders:0},users:[],products:seedProducts.map((x,i)=>({...x,id:i+1,created_at:new Date().toISOString()})),videos:seedVideos.map((x,i)=>({...x,id:i+1,created_at:new Date().toISOString()})),settings:defaults};
  db.seq.products=seedProducts.length;db.seq.videos=seedVideos.length;db.seq.orders=0;db.orders=[];
  if(process.env.ADMIN_PASSWORD){const email=process.env.ADMIN_EMAIL||'admin@dailyfashion.com';db.users.push({id:1,email,password_hash:hashPassword(process.env.ADMIN_PASSWORD),role:'admin',created_at:new Date().toISOString()});db.seq.users=1}
  fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2));return db
 }
 const db=JSON.parse(fs.readFileSync(DB_FILE,'utf8')); let migrated=false;
 if(!db.seq)db.seq={};
 db.settings={...defaults,...db.settings};
 for(const k of ['products','videos','orders'])if(!Array.isArray(db[k]))db[k]=[];
 db.seq={users:0,products:0,videos:0,orders:0,...db.seq};
 if(!db.products.length){db.products=seedProducts.map((x,i)=>({...x,id:i+1,created_at:new Date().toISOString()}));db.seq.products=seedProducts.length;migrated=true}
 if(!db.videos.length){db.videos=seedVideos.map((x,i)=>({...x,id:i+1,created_at:new Date().toISOString()}));db.seq.videos=seedVideos.length;migrated=true}
 if(!db.orders)db.orders=[]; if(migrated)fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2));
 return db
}
let db=readDB();
if(!db.users.length) console.warn('Nenhum administrador configurado. Defina ADMIN_PASSWORD e ADMIN_EMAIL e execute npm run admin:create.');
function save(){const tmp=DB_FILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,DB_FILE)}
function next(k){db.seq[k]=(db.seq[k]||0)+1;return db.seq[k]}
function add(k,o){o.id=next(k);o.created_at=new Date().toISOString();db[k].push(o);save();return o}
function find(k,id){return db[k].find(x=>x.id===Number(id))}

const securityHeaders={'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(),microphone=(),geolocation=()','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://www.facebook.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"};
function send(res,status,body,headers={}){const data=Buffer.from(JSON.stringify(body));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':data.length,'Cache-Control':'no-store',...securityHeaders,...headers});res.end(data)}
function html(res,status,body){const data=Buffer.from(body);res.writeHead(status,{'Content-Type':'text/html; charset=utf-8','Content-Length':data.length,'Cache-Control':'no-store',...securityHeaders});res.end(data)}
function parseCookies(req){const out={};for(const p of (req.headers.cookie||'').split(';')){const i=p.indexOf('=');if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())}return out}
const sessions=new Map(), attempts=new Map();
function session(req){const t=parseCookies(req).daily_session;const s=t&&sessions.get(t);if(!s||s.expires<Date.now()){if(t)sessions.delete(t);return null}return s}
function requireAuth(req,res){const s=session(req);if(!s){send(res,401,{error:'Não autenticado'});return null}return s}
function sameOrigin(req){if(['GET','HEAD','OPTIONS'].includes(req.method))return true;const origin=req.headers.origin;if(!origin)return true;return origin===`http://${req.headers.host}`||origin===`https://${req.headers.host}`}
function readBody(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>1e6)req.destroy()});req.on('end',()=>{try{resolve(b?JSON.parse(b):{})}catch{reject(new Error('JSON inválido'))}});req.on('error',reject)})}
function publicPath(p){let fp=path.normalize(path.join(ROOT,p));if(!fp.startsWith(ROOT))return null;return fp}
function mime(fp){return ({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.jfif':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.ico':'image/x-icon'})[path.extname(fp).toLowerCase()]||'application/octet-stream'}
function staticFile(req,res,p){const fp=publicPath(p);if(!fp||!fs.existsSync(fp)||fs.statSync(fp).isDirectory())return false;res.writeHead(200,{'Content-Type':mime(fp),...securityHeaders,'Cache-Control':p.startsWith('img/')||p.startsWith('storage/')?'public,max-age=604800':'no-cache'});fs.createReadStream(fp).pipe(res);return true}
function safe(v){if(v===undefined||v===null)return '';return String(v).slice(0,5000)}

async function readMultipart(req){
 const ct=String(req.headers['content-type']||'');
 const bm=ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i); if(!bm) throw Error('Multipart inválido');
 const boundary=Buffer.from('--'+(bm[1]||bm[2]));
 const chunks=[]; for await(const chunk of req) chunks.push(chunk);
 const body=Buffer.concat(chunks); const out={fields:{},files:[]};
 let pos=0;
 while((pos=body.indexOf(boundary,pos))!==-1){
  pos+=boundary.length;
  if(body.slice(pos,pos+2).toString()==='--') break;
  if(body.slice(pos,pos+2).toString()==='\r\n') pos+=2;
  const headEnd=body.indexOf(Buffer.from('\r\n\r\n'),pos); if(headEnd<0) break;
  const headers=body.slice(pos,headEnd).toString('utf8'); const next=body.indexOf(boundary,headEnd+4); if(next<0) break;
  const dataEnd=next-2; const data=body.slice(headEnd+4,dataEnd);
  const nm=headers.match(/name="([^"]+)"/i)?.[1]||'';
  const fn=headers.match(/filename="([^"]*)"/i)?.[1]||'';
  if(fn){out.files.push({field:nm,filename:fn,contentType:headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]||'application/octet-stream',data});}
  else out.fields[nm]=data.toString('utf8');
  pos=next;
 }
 return out;
}

const fields={products:['name','category','price','encomenda','prazo','image','status','order'],videos:['title','category','url','type','caption','status','order']};
const adminHTML=fs.readFileSync(path.join(ROOT,'public/admin/index.html'),'utf8');
const siteHTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');

async function route(req,res){
 const u=url.parse(req.url,true), p=u.pathname;
 if(p==='/health')return send(res,200,{ok:true,service:'daily-fashion',version:'1.2.0-hostinger'});
 if(p==='/admin')return html(res,200,adminHTML);
 if(p==='/api/public'&&req.method==='GET')return send(res,200,{settings:db.settings,products:db.products.filter(x=>x.status==='publicado').sort((a,b)=>Number(a.order||0)-Number(b.order||0)),videos:db.videos.filter(x=>x.status==='publicado').sort((a,b)=>Number(a.order||0)-Number(b.order||0))});

 if(p==='/api/orders'&&req.method==='POST'){try{const b=await readBody(req);const items=Array.isArray(b.items)?b.items:[];if(!items.length)return send(res,400,{error:'O carrinho está vazio'});const cleanItems=items.map(i=>({product_id:Number(i.product_id),name:safe(i.name),price:safe(i.price),quantity:Math.max(1,Number(i.quantity)||1)}));const order=add('orders',{customer_name:safe(b.customer_name),customer_phone:safe(b.customer_phone),customer_email:safe(b.customer_email),address:safe(b.address),notes:safe(b.notes),items:cleanItems,total:safe(b.total),status:'novo',source:'site'});return send(res,201,{ok:true,order_id:order.id,order_number:`DF-${String(order.id).padStart(5,'0')}`})}catch(e){return send(res,400,{error:e.message})}}

 if(p==='/api/auth/login'&&req.method==='POST'){const now=Date.now(),ip=req.socket.remoteAddress||'unknown',a=attempts.get(ip)||{n:0,t:now};if(now-a.t>15*60e3){a.n=0;a.t=now}if(a.n>=10)return send(res,429,{error:'Muitas tentativas. Tente novamente em alguns minutos.'});try{const b=await readBody(req),us=db.users.find(x=>x.email.toLowerCase()===String(b.email||'').toLowerCase());if(!us||!verifyPassword(String(b.password||''),us.password_hash)){a.n++;attempts.set(ip,a);return send(res,401,{error:'E-mail ou senha inválidos'})}a.n=0;attempts.set(ip,a);const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{user:{id:us.id,email:us.email,role:us.role},expires:Date.now()+8*3600e3});return send(res,200,{ok:true,user:{email:us.email,role:us.role}},{'Set-Cookie':`daily_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV==='production'?'; Secure':''}`})}catch(e){return send(res,400,{error:e.message})}}
 if(p==='/api/auth/logout'&&req.method==='POST'){const t=parseCookies(req).daily_session;if(t)sessions.delete(t);return send(res,200,{ok:true},{'Set-Cookie':'daily_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'})}
 if(p==='/api/auth/me'&&req.method==='GET'){const s=requireAuth(req,res);if(!s)return;return send(res,200,{user:s.user})}

 if(p==='/api/upload'&&req.method==='POST'){
  const s0=requireAuth(req,res);if(!s0)return;
  const ct=String(req.headers['content-type']||'');
  if(!ct.toLowerCase().startsWith('multipart/form-data'))return send(res,415,{error:'Envie um arquivo em multipart/form-data'});
  const mp=await readMultipart(req); const file=mp.files[0];
  if(!file||!file.data.length)return send(res,400,{error:'Nenhum arquivo enviado'});
  if(file.data.length>25*1024*1024)return send(res,413,{error:'Arquivo excede 25 MB'});
  const ext=path.extname(file.filename).toLowerCase();
  const imageExt=['.jpg','.jpeg','.png','.webp','.gif']; const videoExt=['.mp4','.webm','.mov'];
  if(!imageExt.includes(ext)&&!videoExt.includes(ext))return send(res,400,{error:'Formato não permitido'});
  const prefix=videoExt.includes(ext)?'video':'foto';
  const filename=`${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR,filename),file.data);
  const publicUrl=`/storage/uploads/${filename}`;
  return send(res,201,{ok:true,url:publicUrl,type:videoExt.includes(ext)?'video':'image',filename});
 }

 if(p.startsWith('/api/')&&!sameOrigin(req))return send(res,403,{error:'Origem não autorizada'});
 const s=(p.startsWith('/api/')?requireAuth(req,res):null);if(p.startsWith('/api/')&&!s)return;
 if(p==='/api/dashboard'){return send(res,200,{products:db.products.length,videos:db.videos.length,encomenda:db.products.filter(x=>x.encomenda==='sim').length,publicados:db.products.filter(x=>x.status==='publicado').length,orders:db.orders.length,newOrders:db.orders.filter(x=>x.status==='novo').length})}
 if(p==='/api/orders'&&req.method==='GET')return send(res,200,db.orders.slice(-500).reverse());
 const om=p.match(/^\/api\/orders\/(\d+)$/); if(om){const o=find('orders',om[1]);if(!o)return send(res,404,{error:'Pedido não encontrado'});if(req.method==='PUT'){const b=await readBody(req);if(b.status)o.status=safe(b.status);o.updated_at=new Date().toISOString();save();return send(res,200,{ok:true})}if(req.method==='DELETE'){db.orders=db.orders.filter(x=>x.id!==Number(om[1]));save();return send(res,200,{ok:true})}}
 if(p==='/api/settings'&&req.method==='GET')return send(res,200,db.settings);
 if(p==='/api/settings'&&req.method==='PUT'){const b=await readBody(req);for(const k of Object.keys(defaults))if(k in b)db.settings[k]=safe(b[k]);save();return send(res,200,{ok:true})}

 const m=p.match(/^\/api\/(products|videos)(?:\/(\d+))?$/);
 if(m){
  const k=m[1],id=m[2],fspec=fields[k];
  if(req.method==='GET')return send(res,200,db[k].slice(-1000).reverse());
  if(req.method==='POST'){
   const b=await readBody(req),o={}; for(const f of fspec)o[f]=safe(b[f]);
   if(k==='products'&&!o.name)return send(res,400,{error:'Nome da peça é obrigatório'});
   if(k==='videos'){if(!o.url)return send(res,400,{error:'Informe ou envie um vídeo antes de salvar'});if(!o.type)o.type=detectMediaType(o.url)}
   if(!o.status)o.status='publicado'; if(!o.order)o.order=db[k].length+1;
   const x=add(k,o); return send(res,201,{id:x.id});
  }
  if(id&&req.method==='PUT'){
   const o=find(k,id); if(!o)return send(res,404,{error:'Registro não encontrado'});
   const b=await readBody(req); for(const f of fspec)if(f in b)o[f]=safe(b[f]);
   if(k==='videos'&&!o.type)o.type=detectMediaType(o.url);
   o.updated_at=new Date().toISOString(); save(); return send(res,200,{ok:true});
  }
  if(id&&req.method==='DELETE'){
   const idx=db[k].findIndex(x=>x.id===Number(id)); if(idx<0)return send(res,404,{error:'Registro não encontrado'});
   db[k].splice(idx,1); save(); return send(res,200,{ok:true});
  }
 }

 if(p==='/'&&req.method==='GET')return html(res,200,siteHTML);
 if(staticFile(req,res,p.slice(1)))return;
 return html(res,404,'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Página não encontrada</title></head><body style="background:#0d0b0b;color:#fff;font-family:Arial;text-align:center;padding:80px"><h1>Página não encontrada</h1><p><a href="/" style="color:#d8a04f">Voltar ao início</a></p></body></html>');
}
const server=http.createServer((req,res)=>{route(req,res).catch(e=>{console.error(e);send(res,500,{error:'Erro interno'})})});
server.listen(PORT,()=>console.log(`Daily Fashion — http://localhost:${PORT}`));
