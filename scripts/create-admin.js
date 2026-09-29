'use strict';
// Cria (ou redefine) o usuário administrador do painel.
// Uso: node scripts/create-admin.js email@exemplo.com "SenhaForte123"
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const DATA_DIR=path.join(__dirname,'..','data'), DB_FILE=path.join(DATA_DIR,'db.json');
const [,,email,password]=process.argv;
if(!email||!password){console.error('Uso: node scripts/create-admin.js email@exemplo.com "SenhaForte123"');process.exit(1)}
fs.mkdirSync(DATA_DIR,{recursive:true});
function hashPassword(p){const s=crypto.randomBytes(16).toString('hex');return `${s}:${crypto.scryptSync(p,s,64).toString('hex')}`}
let db=fs.existsSync(DB_FILE)?JSON.parse(fs.readFileSync(DB_FILE,'utf8')):{seq:{users:0,products:0,videos:0},users:[],products:[],videos:[],settings:{}};
if(!db.seq)db.seq={users:0};
const existing=db.users.find(u=>u.email.toLowerCase()===email.toLowerCase());
if(existing){existing.password_hash=hashPassword(password);console.log('Senha atualizada para',email)}
else{db.seq.users=(db.seq.users||0)+1;db.users.push({id:db.seq.users,email,password_hash:hashPassword(password),role:'admin',created_at:new Date().toISOString()});console.log('Administrador criado:',email)}
fs.writeFileSync(DB_FILE,JSON.stringify(db,null,2));
