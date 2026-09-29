# Relatório — Daily Fashion Moda Feminina V1.2.0

## Objetivo

Manter o Daily Fashion como uma marca/site de **moda feminina**, acrescentando um sistema integrado de catálogo, vendas/pedidos e administração, sem substituir as mídias existentes.

## Dados e mídias preservados

A versão foi construída sobre o pacote Daily Fashion existente. Foram preservadas as imagens e vídeos que já estavam no projeto, incluindo banners, fotos de peças, `video1.mp4` e o reel MP4 existente.

Os 11 produtos cadastrados na base inicial continuam sendo o catálogo público da versão inicial. O administrador pode editar nomes, categorias, preços, disponibilidade e imagens.

## Melhorias visuais

- Banner inicial corrigido: a versão anterior apontava para `img/banerbrmirian.png`, arquivo que não existia.
- O hero agora usa um carrossel com imagens existentes:
  - `img/banner.png`
  - `img/banermirian.jfif`
  - `img/destaque-especial.png`
  - `img/Gemini_Generated_Image_v81hejv81hejv81h.png`
- Visual geral clareado, mantendo uma estética de moda feminina elegante.
- Destaques de produtos aparecem logo no início.
- Vídeos foram ajustados para proporção 16:9, evitando uma área vertical excessiva.
- Layout responsivo para desktop e celular.

## Sistema de vendas

O catálogo permite:

- ver peças;
- filtrar por categoria;
- abrir detalhes;
- adicionar ao carrinho;
- alterar quantidades;
- remover itens;
- calcular total;
- preencher dados do cliente;
- registrar o pedido no servidor;
- receber número de pedido `DF-00001`, `DF-00002` etc.;
- continuar o atendimento pelo WhatsApp.

Os pedidos ficam armazenados em `data/db.json` nesta versão.

## Painel administrativo

Rota:

`/admin`

Funções:

- login/logout;
- dashboard;
- catálogo de peças;
- criar, editar e excluir produtos;
- publicar, deixar em rascunho, inativar ou marcar como esgotado;
- upload real de fotos;
- cadastro/edição de vídeos;
- upload real de vídeos;
- configurações do negócio;
- WhatsApp e redes sociais;
- horário de atendimento;
- consulta de pedidos;
- alteração de status dos pedidos;
- exclusão de pedidos.

## Segurança básica implementada

- senha administrativa armazenada com `scrypt` e salt;
- sessão em cookie `HttpOnly`;
- `SameSite=Strict`;
- `Secure` em produção;
- limite de tentativas de login;
- proteção de origem para mutações da API;
- cabeçalhos de segurança;
- limite de 25 MB para upload;
- extensões de imagem/vídeo permitidas controladas.

## Testes de homologação realizados

Em uma instalação limpa, com banco JSON novo e administrador de teste:

- `node --check server.js` — OK
- `node --check script.js` — OK
- `node --check scripts/create-admin.js` — OK
- `/health` — HTTP 200
- `/` — HTTP 200
- `/admin` — HTTP 200
- `/img/banner.png` — HTTP 200
- `/api/public` — catálogo e vídeos retornados
- login administrativo — OK
- dashboard — OK
- criação de pedido — HTTP 201
- pedido apareceu no painel — OK
- alteração do status do pedido — OK
- criação de produto via API — OK
- configurações — OK

O teste de produção local usou dados temporários e esses registros de teste não fazem parte do pacote final.

## Limitação consciente desta versão

A persistência ainda é baseada em JSON. Isso é adequado para a primeira publicação e reduz o risco de uma migração de banco durante a implantação. Para crescimento de pedidos e múltiplos administradores, recomenda-se uma V1.3 com MySQL da Hostinger.

## Publicação

O pacote está preparado para uma hospedagem que execute Node.js. O relatório `HOSTINGER-PASSO-A-PASSO.md` contém a sequência VS Code → GitHub → Hostinger e os testes pós-publicação.
