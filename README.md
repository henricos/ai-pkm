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
- Credenciais reais para `AUTH_USERNAME`, `AUTH_PASSWORD`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL`

Crie um diretório de runtime com estes dois arquivos:

`compose.yaml`

```yaml
services:
  web:
    image: ghcr.io/henricos/ai-pkm:latest
    environment:
      APP_ROOT_PATH: /app
      PKM_PATH: /data/pkm
      INDEX_PATH: /data/index
      AUTH_USERNAME: ${AUTH_USERNAME}
      AUTH_PASSWORD: ${AUTH_PASSWORD}
      AUTH_TRUST_HOST: ${AUTH_TRUST_HOST:-true}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "${WEB_HOST_PORT:-3000}:3000"
    volumes:
      - type: bind
        source: ${PKM_HOST_PATH}
        target: /data/pkm
        read_only: true
      - type: bind
        source: ${INDEX_HOST_PATH}
        target: /data/index
        read_only: true
```

`.env.compose`

```env
PKM_HOST_PATH=/absolute/path/to/pkm
INDEX_HOST_PATH=/absolute/path/to/ai-pkm/index
WEB_HOST_PORT=3000
AUTH_USERNAME=curator
AUTH_PASSWORD=uma-senha-segura
AUTH_TRUST_HOST=true
NEXTAUTH_SECRET=string-aleatoria-com-pelo-menos-32-caracteres
NEXTAUTH_URL=http://localhost:3000
```

Suba a aplicação:

```bash
docker compose --env-file .env.compose up -d
```

Atualize para a imagem mais recente publicada:

```bash
docker compose --env-file .env.compose pull
docker compose --env-file .env.compose up -d
```

Depois, abra `http://localhost:3000` e confirme que a aplicação chega à tela de login.

## Desenvolvimento

Para desenvolvimento local com `npm`, use [docs/dev-setup.md](/home/henrico/github/henricos/ai-pkm/docs/dev-setup.md). Para fechar e publicar uma release SemVer da imagem, use [docs/release-semver-ghcr.md](/home/henrico/github/henricos/ai-pkm/docs/release-semver-ghcr.md).

## Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para detalhes.
