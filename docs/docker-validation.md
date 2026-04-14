# Guia de Validação Docker — ai-pkm

Este documento define o fluxo canônico para validar localmente o artefato distribuível da Phase 7. Ele cobre apenas o runtime empacotado da aplicação, não o fluxo de desenvolvimento via `npm run dev`.

## Quando usar este guia

- Use este guia para provar que a imagem local builda e sobe com o contrato real de runtime
- Use [docs/dev-setup.md](/home/henrico/github/henricos/ai-pkm/docs/dev-setup.md) quando o objetivo for desenvolver a aplicação localmente com `npm run dev`

## Contrato do runtime validado nesta fase

### Dados dinâmicos montados externamente

- `pkm` entra por bind mount externo e deve ser exposto ao container em `/data/pkm`
- `index` entra por bind mount externo e deve ser exposto ao container em `/data/index`
- `PKM_PATH` e `INDEX_PATH` apontam para esses caminhos dentro do container

### Artefatos versionados na release

Os itens abaixo fazem parte da versão da aplicação e são empacotados junto da imagem:

- `models`
- `reference`
- `.agents/skills`
- `AGENTS.md`

Enquanto `index` continuar dinâmico, ele não deve ser cristalizado dentro da imagem. O contrato operacional desta fase exige refresh conjunto de `pkm` e `index`.

## Pré-requisitos

- Docker Engine com `docker compose`
- Arquivo `.env.compose` local derivado de `.env.compose.example`
- Paths absolutos válidos no host para `PKM_HOST_PATH` e `INDEX_HOST_PATH`
- Credenciais reais para `AUTH_USERNAME`, `AUTH_PASSWORD`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL`
- `AUTH_TRUST_HOST=true` no runtime validado por compose

## 1. Preparar o arquivo de env local

Copie o template:

```bash
cp .env.compose.example .env.compose
```

Edite `.env.compose` e preencha os valores reais:

```env
PKM_HOST_PATH=/absolute/path/to/pkm
INDEX_HOST_PATH=/absolute/path/to/ai-pkm/index
WEB_HOST_PORT=3000
AUTH_USERNAME=seu_usuario
AUTH_PASSWORD=sua_senha_segura
AUTH_TRUST_HOST=true
NEXTAUTH_SECRET=string_aleatoria_com_pelo_menos_32_chars
NEXTAUTH_URL=http://localhost:3000
```

Regras:

- `PKM_HOST_PATH` deve apontar para o repositório privado `pkm` no host
- `INDEX_HOST_PATH` deve apontar para o diretório `index/` que acompanha o mesmo estado do acervo
- não use paths relativos
- não use segredos reais de produção em arquivos commitados

## 2. Validar o contrato resolvido pelo compose

Rode:

```bash
docker compose --env-file .env.compose config
```

Confirme no output:

- `PKM_HOST_PATH` está montado em `/data/pkm`
- `INDEX_HOST_PATH` está montado em `/data/index`
- `PKM_PATH=/data/pkm`
- `INDEX_PATH=/data/index`
- a porta interna exposta pela aplicação continua `3000`

Se o arquivo resolvido não refletir esse contrato, não prossiga para o build.

## 3. Buildar a imagem local

Rode:

```bash
docker compose --env-file .env.compose build web
```

Resultado esperado:

- o build termina com sucesso
- a imagem final não depende de `pkm` nem `index` embutidos no contexto
- o runtime final usa o contrato standalone e sobe como usuário não root

## 4. Subir o runtime validado

Rode:

```bash
docker compose --env-file .env.compose up -d web
docker compose --env-file .env.compose ps
```

Resultado esperado:

- o serviço `web` fica `Up`
- a aplicação responde em `http://localhost:3000`
- os mounts externos continuam visíveis no contrato do compose

Para encerrar depois do teste:

```bash
docker compose --env-file .env.compose down
```

## 5. Checkpoint operacional no navegador

1. Abra `http://localhost:3000`
2. Confirme que o login continua obrigatório
3. Faça login com as credenciais configuradas no `.env.compose`
4. Navegue pela árvore e abra itens reais do acervo
5. Confirme que a leitura funciona com `pkm` e `index` montados externamente
6. Confirme ausência de erro por índice ausente ou dependência do `cwd` antigo do workspace

O checkpoint desta fase só passa quando a autenticação e a leitura do acervo montado estiverem coerentes ao mesmo tempo.

## Healthcheck nesta fase

Esta fase não adiciona `healthcheck` ao stack. A decisão é consciente: ainda não existe um endpoint seguro e desacoplado de autenticação e proxy que prove prontidão real sem abrir uma superfície operacional errada. O smoke canônico permanece:

- `docker compose config`
- `docker compose build web`
- `docker compose up -d web`
- login real no browser
- leitura real do acervo montado

## Contrato futuro de refresh externo

O primeiro refresh operacional de acervo desta linha de runtime deve acontecer fora da UI web e fora do processo principal da aplicação. Nesta fase, isso significa:

- a aplicação não expõe endpoint de refresh
- a UI web não executa `git pull`
- um mecanismo externo ao container deve atualizar `pkm` e `index` em conjunto

Esse mecanismo futuro pode ser um script no servidor, um job operacional ou outro processo auxiliar, desde que preserve o mesmo contrato de mounts externos já validado aqui.

## Impacto para agentes no mesmo runtime

O contrato acima não impede um milestone futuro em que agentes rodem no mesmo ambiente da aplicação. O que fica estabelecido agora é apenas a separação entre:

- dados dinâmicos de runtime: `pkm` e `index`
- artefatos versionados da release: `models`, `reference`, `.agents/skills`, `AGENTS.md`

Se um agente passar a operar no mesmo runtime no futuro, ele deve encontrar esses artefatos versionados dentro da release e consumir `pkm` + `index` pelos mesmos paths externos já validados nesta fase.
