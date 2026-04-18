# ai-pkm

Plataforma web file-first para navegar um PKM pessoal operado por IA.

## O que é

O `ai-pkm` é uma plataforma web file-first para navegar um PKM pessoal operado por IA. O acervo vive em um repositório privado `pkm`, separado da aplicação e montado externamente no runtime.

### Modelo de operação

- a IA atua como única editora de conteúdo da base
- o humano orienta, aprova e navega o acervo
- a aplicação web e a operação via CLI coexistem sobre a mesma fonte de verdade

### O que este repositório contém

Este repositório contém a aplicação, as skills operacionais, a documentação e os artefatos de apoio ao sistema. O conteúdo do conhecimento continua fora daqui, no repositório `pkm`.

### Também é

Além da aplicação em si, o projeto também serve como laboratório prático de desenvolvimento guiado por especificação com apoio de IA.

### Por que existe

Hoje, soluções populares para PKM com IA costumam seguir caminhos como Obsidian + Claude ou propostas mais recentes como a LLM Wiki de Andrej Karpathy. O `ai-pkm` segue outra direção. Em vez de depender de uma interface genérica, ele busca uma experiência feita sob medida, que pode ser refinada para servir exatamente ao fluxo desejado, sem carregar os excessos e as limitações típicas de ferramentas mais amplas.

O outro diferencial é o papel intencional do humano no loop. Aqui, a IA escreve o conteúdo, mas a classificação, a organização e a validação continuam passando pelo humano. Isso não é um detalhe operacional; é parte do modelo. A ideia não é delegar toda a aprendizagem à máquina, nem reduzir a IA a um classificador auxiliar. O objetivo é usar a IA para fazer o trabalho pesado de escrita e estruturação, enquanto o humano continua exposto às fontes, decide o que entra, como se conecta e o que merece ser consolidado. Esse atrito é desejado, porque força absorção real de conhecimento em vez de transformar o sistema numa fábrica invisível de notas que o próprio autor nunca leu.

## Quickstart do runtime container

Use este fluxo quando o objetivo for subir ou atualizar a aplicação pela imagem publicada em `ghcr.io/henricos/ai-pkm:latest`.

Pré-requisitos:

- Docker Engine com `docker compose`
- Um path absoluto no host para o repositório `pkm`
- Um path absoluto no host para o diretório `index/` deste repositório
- Credenciais reais para `AUTH_USERNAME`, `AUTH_PASSWORD`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` e `APP_BASE_PATH`

Crie um diretório de runtime e salve nele um `compose.yaml` com os valores reais do seu ambiente:

`compose.yaml`

```yaml
services:
  ai-pkm:
    image: ghcr.io/henricos/ai-pkm:latest
    container_name: ai-pkm
    environment:
      APP_ROOT_PATH: /app
      APP_BASE_PATH: /pkm
      PKM_PATH: /data/pkm
      INDEX_PATH: /data/index
      AUTH_USERNAME: curator
      AUTH_PASSWORD: uma-senha-segura
      NEXTAUTH_SECRET: troque-por-uma-string-aleatoria-com-pelo-menos-32-caracteres
      NEXTAUTH_URL: http://SEU-HOST:3030/pkm
    volumes:
      - /absolute/path/to/pkm:/data/pkm:ro
      - /absolute/path/to/ai-pkm/index:/data/index:ro
    ports:
      - "3030:3000"
    restart: unless-stopped
```

Troque todos os placeholders antes de subir:

- `AUTH_USERNAME` e `AUTH_PASSWORD`: credenciais reais de login
- `NEXTAUTH_SECRET`: string aleatória com pelo menos 32 caracteres
- `APP_BASE_PATH`: prefixo de rota — use `/pkm` (padrão) ou outro prefixo, mas veja nota abaixo
- `NEXTAUTH_URL`: URL pública real do runtime incluindo o prefixo (ex: `https://meuhost.com/pkm`)
- paths dos volumes: paths absolutos reais do `pkm` e do `index`
- `3030:3000`: altere a porta à esquerda se quiser expor em outra porta do host

Suba a aplicação:

```bash
docker compose up -d
```

Atualize para a imagem mais recente publicada:

```bash
docker compose pull
docker compose up -d
```

Depois, abra `http://SEU-HOST:3030/pkm` e confirme que a aplicação chega à tela de login. A raiz `http://SEU-HOST:3030/` retorna 404 — isso é esperado.

## Contrato dos 3 lugares de configuração

O `basePath` da aplicação (`APP_BASE_PATH`) é configurado em **3 lugares distintos**,
cada um com papel diferente:

| Lugar | Arquivo | Tipo | Valor padrão |
|-------|---------|------|--------------|
| Desenvolvimento local | `.env` / `.env.local` | Variável de ambiente runtime | `APP_BASE_PATH=/pkm` |
| Build da imagem Docker | `.github/workflows/release-ghcr.yml` (build-arg) | Baked no build, hardcoded | `APP_BASE_PATH=/pkm` |
| Runtime do container | `compose.yaml` (environment) | Variável de ambiente runtime | `APP_BASE_PATH=/pkm` |

> **Importante:** O valor de `APP_BASE_PATH` no workflow (`release-ghcr.yml`) é
> **hardcoded no build** — ele fica baked dentro da imagem Docker no momento do build.
> Isso significa que **mudar o path exige editar o workflow e abrir uma nova release**.
> Não é possível mudar o prefixo apenas trocando a variável no `compose.yaml` do runtime.

> **Sincronia obrigatória:** O pathname de `NEXTAUTH_URL` deve terminar com o mesmo
> valor de `APP_BASE_PATH`. Com `APP_BASE_PATH=/pkm`, use
> `NEXTAUTH_URL=https://meuhost.com/pkm`. A aplicação recusa iniciar se esses valores
> divergirem.

## Desenvolvimento

Para desenvolvimento local com `npm`, use [docs/dev-setup.md](/home/henrico/github/henricos/ai-pkm/docs/dev-setup.md). Para fechar e publicar uma release SemVer da imagem, use [docs/release-semver-ghcr.md](/home/henrico/github/henricos/ai-pkm/docs/release-semver-ghcr.md).

## Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para detalhes.
