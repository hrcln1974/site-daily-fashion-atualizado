# Daily Fashion — Deploy Hostinger

## 1. Preparar no VS Code

```bash
npm install
npm start
```

Teste:
```bash
curl http://localhost:3000/health
```

Resultado esperado:
```json
{"ok":true,"service":"daily-fashion","version":"1.1.0-hostinger"}
```

Abra `/admin` e teste login, cadastro de produto, upload de foto, cadastro de vídeo e configurações.

## 2. GitHub

Dentro da pasta do projeto:

```bash
git init
git branch -M main
git add .
git commit -m "feat: Daily Fashion produção Hostinger"
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Se o repositório já existir, confira antes:

```bash
git remote -v
git status
git log -1 --oneline
```

## 3. Hostinger

No painel da Hostinger, escolha o recurso de aplicação Node.js disponível no seu plano.

Configure:
- Node.js: 20+ (ou a versão estável disponível)
- Start file: `server.js`
- Port: usar a variável `PORT` fornecida pela Hostinger
- Root directory: pasta do projeto
- Environment:
  - `NODE_ENV=production`
  - `ADMIN_EMAIL=seu-email-administrativo`
  - `ADMIN_PASSWORD=uma-senha-forte`

Não coloque a senha no GitHub.

## 4. Arquivos persistentes

Antes de atualizar a aplicação, preserve:

```text
data/db.json
storage/uploads/
```

Esses arquivos contêm catálogo, vídeos, configurações e uploads.

Faça backup antes de cada publicação.

## 5. Primeiro acesso

Após iniciar a aplicação:

```text
https://SEU-DOMINIO/admin
```

Teste:
1. Login.
2. Dashboard.
3. Criar produto.
4. Upload de foto.
5. Editar produto.
6. Publicar/inativar.
7. Criar vídeo.
8. Upload de MP4.
9. Configurar WhatsApp.
10. Abrir o site público.
11. Clicar em COMPRAR.
12. Conferir o WhatsApp.

## 6. Atualizações futuras

```bash
git status
git add .
git commit -m "update: Daily Fashion"
git push
```

Depois faça o deploy/restart pelo painel da Hostinger.

## 7. Rollback

Antes do deploy, mantenha uma cópia de:

```text
data/db.json
storage/uploads/
```

Se uma atualização falhar, restaure esses dados e volte para o commit anterior.

## 8. Checklist final

- [ ] domínio apontado
- [ ] SSL ativo
- [ ] Node.js ativo
- [ ] `server.js` iniciando
- [ ] `/health` respondendo
- [ ] `/admin` abrindo
- [ ] login funcionando
- [ ] catálogo funcionando
- [ ] upload de fotos funcionando
- [ ] vídeos funcionando
- [ ] WhatsApp funcionando
- [ ] backup realizado
- [ ] GitHub atualizado
