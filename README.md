# Daily Fashion — Moda Feminina V1.2.0

Site profissional de moda feminina com catálogo, carrinho, pedidos, WhatsApp, galeria, vídeos e painel administrativo.

## O que está incluído

- Site público responsivo.
- Banner inicial em carrossel usando as imagens existentes do Daily Fashion.
- Catálogo feminino alimentado pela API/painel.
- Filtros por categoria.
- Destaques de produtos no início.
- Carrinho com quantidades e total.
- Registro de pedido no servidor.
- Número de pedido no formato `DF-00001`.
- Finalização/continuidade do atendimento pelo WhatsApp.
- Galeria de vídeos locais e links de Instagram/Facebook/YouTube.
- Painel `/admin` com login.
- CRUD de produtos.
- Upload real de fotos e vídeos.
- Gestão de pedidos e alteração de status.
- Configurações de WhatsApp, redes sociais e horário.
- Persistência local em JSON, sem banco nativo obrigatório.
- Endpoint `/health` para homologação/monitoramento.

## Rodar localmente

Requer Node.js 18 ou superior.

```bash
npm install
npm run check
npm start
```

Abra `http://localhost:3000`.

Admin: `http://localhost:3000/admin`.

## Criar administrador

Defina as variáveis e execute:

```bash
ADMIN_EMAIL=admin@seudominio.com ADMIN_PASSWORD='SuaSenhaForteCom12OuMaisCaracteres' npm run admin:create
```

No Windows/Git Bash, também é possível colocar as variáveis em `.env`/ambiente local conforme a documentação de Hostinger.

## Persistência

A aplicação usa `data/db.json` e `storage/uploads/`. Esses diretórios precisam permanecer graváveis pela aplicação Node.js.

Para produção com muitos pedidos, recomenda-se migrar a persistência para MySQL em uma etapa posterior. Esta versão não exige MySQL e não apaga os dados atuais.

## Hostinger

Consulte `HOSTINGER-PASSO-A-PASSO.md` para a publicação completa.
