# Daily Fashion — Hostinger: VS Code → GitHub → Hostinger

## 1. VS Code

Abra a pasta do projeto.

Execute um comando por vez:

```bash
npm install
npm run check
npm start
```

Teste:

- `http://localhost:3000`
- `http://localhost:3000/health`
- `http://localhost:3000/admin`

## 2. Criar o administrador local

No Git Bash:

```bash
ADMIN_EMAIL=admin@seudominio.com ADMIN_PASSWORD='SenhaForteCom12OuMaisCaracteres' npm run admin:create
```

Não coloque uma senha real dentro do GitHub.

## 3. GitHub

Se o projeto ainda não tiver Git:

```bash
git init
git branch -M main
git add .
git commit -m "Daily Fashion feminina V1.2.0"
```

Crie um repositório vazio no GitHub e depois:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Confira:

```bash
git remote -v
git status
```

O `.gitignore` já evita `.env`, `data/db.json` e uploads privados.

## 4. Hostinger

A aplicação precisa de hospedagem com suporte a Node.js. Um plano puramente estático não executa `server.js`.

No hPanel, abra a área de aplicação Node.js disponível para seu plano e configure aproximadamente:

- Node.js: 18 ou superior (20+ recomendado se disponível)
- Branch: `main`
- Diretório: pasta da aplicação
- Arquivo de inicialização: `server.js`
- Comando de instalação: `npm install` ou o mecanismo de build da plataforma
- Comando de início: `npm start`

Os nomes exatos dos campos podem variar na interface da Hostinger.

## 5. Variáveis de ambiente

Cadastre na Hostinger:

```text
NODE_ENV=production
ADMIN_EMAIL=seu-email-administrativo
ADMIN_PASSWORD=sua-senha-forte
SESSION_SECRET=uma-chave-secreta-grande
```

Se a Hostinger fornecer a porta automaticamente, deixe o sistema usar `process.env.PORT`.

## 6. Permissões e persistência

A aplicação precisa conseguir gravar em:

```text
data/
storage/uploads/
```

Faça backup de `data/db.json` e `storage/uploads/` antes de atualizações.

## 7. Teste após publicar

Abra:

```text
https://SEU-DOMINIO/health
https://SEU-DOMINIO/
https://SEU-DOMINIO/admin
```

Depois teste:

1. Login.
2. Criar uma peça de teste.
3. Editar a peça.
4. Publicar/despublicar.
5. Fazer upload de uma foto.
6. Fazer upload de um vídeo.
7. Abrir o site público.
8. Adicionar peça ao carrinho.
9. Finalizar pedido.
10. Conferir o pedido no painel.
11. Alterar status do pedido.
12. Abrir WhatsApp.

## 8. Atualizações futuras

Antes de atualizar o código:

- faça cópia de `data/db.json`;
- faça cópia de `storage/uploads/`;
- atualize o código pelo GitHub;
- rode `npm run check`;
- reinicie a aplicação Node.js;
- teste `/health`, site e `/admin`.

## 9. Banco MySQL

Esta V1.2.0 usa JSON para reduzir risco durante a publicação inicial. Para crescimento do negócio, a próxima versão pode migrar produtos, pedidos, clientes e configurações para MySQL da Hostinger, mantendo backup e importação dos dados antes da migração.
