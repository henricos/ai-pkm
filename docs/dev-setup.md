# Guia de Setup Local — ai-pkm

Este documento descreve como subir a aplicação `ai-pkm` em ambiente local/dev a partir do zero.

---

## Pré-requisitos

- **Node.js** >= 20.9.0 (`node --version`)
- **npm** >= 10.x (incluído com Node.js 20)
- **Repositório `pkm`** disponível por path local (ex: `/home/user/pkm`)

---

## 1. Clone e instalação

```bash
git clone <url-do-repositorio> ai-pkm
cd ai-pkm
npm install
```

---

## 2. Configuração do `.env.local`

Copie o arquivo de template e preencha com valores reais:

```bash
cp .env.example .env.local
```

O arquivo `.env.local` **nunca deve ser commitado** — já está no `.gitignore`.

### Variáveis obrigatórias

Abra `.env.local` e preencha cada variável:

#### `PKM_PATH`

Path absoluto para o diretório raiz do repositório `pkm`.

```env
PKM_PATH=/home/user/pkm
```

> **Importante:** deve ser sempre um caminho absoluto. Caminhos relativos funcionam
> apenas quando o `cwd` é a raiz do projeto, mas quebram em outros contextos.
> Se o `pkm/` está montado na raiz do projeto, use `$(pwd)/pkm` para obter o
> caminho absoluto, ou informe o path completo diretamente.

#### `AUTH_USERNAME`

Nome de usuário para login na interface web.

```env
AUTH_USERNAME=curator
```

Pode ser qualquer string. Escolha um valor que você vá lembrar.

#### `AUTH_PASSWORD`

Senha para login na interface web.

```env
AUTH_PASSWORD=senha_segura_aqui
```

Mínimo 8 caracteres. **Não use o valor de exemplo** — escolha uma senha real.

> **Aviso de segurança:** A comparação de credenciais é feita por igualdade de
> string simples. Isso é suficiente para uso local/dev single-user. Não exponha
> esta aplicação publicamente sem adicionar rate limiting e hashing de senha.

#### `NEXTAUTH_SECRET`

Chave secreta usada para assinar os cookies de sessão JWT. Deve ter no mínimo 32
caracteres aleatórios.

Gere um valor seguro com:

```bash
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET=<cole-o-valor-gerado-aqui>
```

> **Aviso de segurança:** Nunca use um valor previsível ou curto para o
> `NEXTAUTH_SECRET`. A segurança dos cookies de sessão depende diretamente da
> entropia desta chave.

#### `NEXTAUTH_URL`

URL base da aplicação. Para desenvolvimento local:

```env
NEXTAUTH_URL=http://localhost:3000
```

> **Nota:** Esta aplicação usa NextAuth v5 (Auth.js). O nome `NEXTAUTH_URL` é
> mantido por compatibilidade — Auth.js v5 também aceita `AUTH_URL`. Use
> `NEXTAUTH_URL` conforme configurado neste projeto.

---

### Exemplo de `.env.local` preenchido

```env
PKM_PATH=/home/user/pkm
AUTH_USERNAME=curator
AUTH_PASSWORD=minha_senha_local_segura
NEXTAUTH_SECRET=Xk3mP9rQ2vL7nT4wJ8eA1bC6dF0hI5jK
NEXTAUTH_URL=http://localhost:3000
```

---

## 3. Estrutura dos índices

A aplicação lê os arquivos `index/topicos.json` e `index/grupos.json` da **raiz do
repositório `ai-pkm`** — não do `pkm/` montado. Esses índices são gerados e
mantidos pelas skills do PKM.

Se você rodar a aplicação de outro diretório, o `process.cwd()` precisa apontar
para a raiz do `ai-pkm`. Em dev normal (`npm run dev` a partir da raiz), isso
funciona automaticamente.

---

## 4. Executar em modo dev

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## 5. Verificação do fluxo

1. Abra `http://localhost:3000` no navegador
2. Sem sessão ativa, deve redirecionar automaticamente para `/login`
3. Na tela de login, insira as credenciais configuradas no `.env.local`
4. Após login bem-sucedido, você verá a home autenticada com a lista de tópicos do PKM

---

## 6. Aviso de segurança

Esta aplicação foi projetada para uso **local/dev single-user**:

- **Credenciais:** a comparação é por igualdade de string simples — adequada para
  uso local, **insuficiente para exposição pública**.
- **Exposição pública:** antes de expor esta aplicação na internet, adicione:
  - Rate limiting nas rotas de login (ex: `next-rate-limit`)
  - Hashing de senha com bcrypt ou similar
  - HTTPS com `secure=true` nos cookies (configurar `NEXTAUTH_URL` com `https://`)
- **`NEXTAUTH_SECRET`:** deve ter ≥ 32 caracteres aleatórios. Use `openssl rand -base64 32`.
  Nunca use valor previsível.
- **`.env.local`:** nunca commitar este arquivo. Ele já está no `.gitignore`.

---

## 7. Troubleshooting

### `NEXTAUTH_SECRET é obrigatório` ao subir

O arquivo `.env.local` não foi criado ou a variável `NEXTAUTH_SECRET` está ausente.
Confirme que você copiou `.env.example` para `.env.local` e preencheu todas as 5 variáveis.

### Erro ao listar tópicos: `ENOENT index/topicos.json`

O arquivo `index/topicos.json` não existe na raiz do projeto. Rode a skill
`/recriar-indices` para regenerar os índices a partir do repositório `pkm`.
Confirme também que o `cwd` ao rodar `npm run dev` é a raiz do `ai-pkm`.

### `PKM_PATH inválido` ou tópicos não aparecem

Verifique que `PKM_PATH` é um caminho absoluto válido e que o diretório existe.
Caminhos relativos como `pkm` ou `./pkm` podem funcionar em dev mas quebram em
outros contextos. Use sempre o path completo.

### Cookie de sessão não persiste

Confirme que `NEXTAUTH_SECRET` tem pelo menos 32 caracteres. Chaves muito curtas
podem causar falhas silenciosas na assinatura do JWT.

---

*Última atualização: Phase 1 — Secure Read Model Foundation*
