# SafeClient

Plataforma de segurança para profissionais do sexo — consulta e registro de relatos sobre clientes.

---

## Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Decisões Técnicas e Arquiteturais](#decisões-técnicas-e-arquiteturais)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Pipeline de Qualidade](#pipeline-de-qualidade)
- [Dependências](#dependências)

---

## Visão Geral

O SafeClient é composto por três camadas:

| Componente       | Tecnologia     | Porta |
|------------------|----------------|-------|
| `SafeClientApi`  | NestJS + PostgreSQL | 3000 |
| `SafeClientWeb`  | Next.js 14     | 3001  |
| `SafeClientMobil`| React Native / Expo | — |

A **API** serve tanto o app mobile (autenticado via HMAC-SHA256) quanto a interface web (autenticada via JWT). O **web** oferece pesquisa pública de contatos, cadastro/login de usuárias e área de administração.

---

## Pré-requisitos

- [Docker](https://www.docker.com/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) >= 2.20
- Node.js 20+ (para desenvolvimento local sem Docker)

---

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone <repo-url> SafeClient
cd SafeClient
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha os valores obrigatórios:

```env
CONTACT_HASH_SECRET=<openssl rand -hex 32>
APP_SIGNING_SECRET=<openssl rand -hex 32>
JWT_SECRET=<openssl rand -hex 32>
```

### 3. Suba os serviços com Docker Compose

```bash
docker compose up --build
```

Isso inicia:
- PostgreSQL na porta `5432`
- API NestJS na porta `3000`
- Web Next.js na porta `3001`

### 4. Rode o seed (dados de teste + usuário admin)

```bash
docker compose exec api npm run seed
```

Isso cria o usuário administrador:
- **Email:** `admin@safeclient.com`
- **Senha:** `Admin@123456`

E insere relatos de teste para testar a busca.

### 5. Acesse a aplicação

| URL | Descrição |
|-----|-----------|
| http://localhost:3001 | Interface web |
| http://localhost:3001/admin | Painel de administração |
| http://localhost:3000/api/docs | Swagger da API |

### Desenvolvimento local (sem Docker)

```bash
# API
cd SafeClientApi
npm install
cp ../.env .env
npm run start:dev

# Web (outro terminal)
cd SafeClientWeb
npm install
npm run dev
```

---

## Variáveis de Ambiente

Arquivo: `SafeClient/.env` (ou `SafeClientApi/.env`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DB_HOST` | Sim | Host do PostgreSQL (padrão: `postgres` no Docker) |
| `DB_PORT` | Não | Porta PostgreSQL (padrão: `5432`) |
| `DB_USER` | Sim | Usuário do banco |
| `DB_PASSWORD` | Sim | Senha do banco |
| `DB_NAME` | Sim | Nome do banco de dados |
| `CONTACT_HASH_SECRET` | **Sim** | Segredo para HMAC-SHA256 dos dados de contato (LGPD) |
| `APP_SIGNING_SECRET` | **Sim** | Segredo compartilhado com o app mobile para autenticação HMAC |
| `JWT_SECRET` | **Sim** | Segredo para assinatura de tokens JWT das usuárias web |
| `PORT` | Não | Porta da API (padrão: `3000`) |
| `SIGNATURE_WINDOW_SEC` | Não | Janela de tolerância para assinaturas HMAC em segundos (padrão: `300`) |
| `NODE_ENV` | Não | Ambiente de execução (`development` ou `production`) |
| `API_INTERNAL_URL` | Não | URL interna da API acessada pelo Next.js (padrão: `http://localhost:3000`) |

---

## Decisões Técnicas e Arquiteturais

### Privacidade (LGPD)

Nenhum dado bruto de contato (telefone, @usuário, e-mail) é armazenado no banco de dados. Todos os contatos são transformados em **HMAC-SHA256** usando `CONTACT_HASH_SECRET` antes de serem persistidos. Isso garante conformidade com a LGPD: não há como reconstituir o dado original sem o segredo.

### Autenticação Dupla

O sistema possui dois mecanismos de autenticação:

- **App mobile → HMAC-SHA256**: Cada requisição é assinada com `APP_SIGNING_SECRET`. O guard valida timestamp (janela de ±300s), nonce único (anti-replay) e assinatura com `crypto.timingSafeEqual`.
- **Web → JWT (Bearer token)**: Após login, a usuária recebe um JWT (7 dias) armazenado como cookie `httpOnly`. O Next.js repassa o token no header `Authorization` para a API.

### Soft Delete

Relatos não são excluídos permanentemente — possuem um campo `active: boolean`. Isso permite cumprir pedidos de remoção (LGPD) sem perder auditoria, e reativar relatos caso o pedido seja indevido.

### Roles (Controle de Acesso)

A entidade `User` possui `role: 'user' | 'admin'`. O role é incluído no payload JWT. O `AdminGuard` no NestJS verifica `req.user.role === 'admin'`. O middleware do Next.js decodifica o JWT para proteger as rotas `/admin/*` no lado do servidor.

### Deduplicação de Relatos

Um mesmo IP não pode reportar o mesmo contato mais de uma vez em 24 horas (verificação por `ipHash` que é SHA256 do IP — nunca o IP bruto).

### Cron de Remoção

Um job agendado (`@nestjs/schedule`) processa pedidos de remoção a cada 6 horas, executando soft-delete em todos os relatos do contato solicitante.

---

## Estrutura do Projeto

```
SafeClient/
├── SafeClientApi/          # Backend NestJS
│   ├── src/
│   │   ├── admin/          # Módulo de administração (reports + users CRUD)
│   │   ├── auth/           # Autenticação JWT (register, login)
│   │   ├── common/
│   │   │   ├── enums/      # ContactType, FlagType
│   │   │   ├── guards/     # AppAuthGuard (HMAC), JwtAuthGuard, AdminGuard
│   │   │   ├── strategies/ # JwtStrategy (Passport)
│   │   │   └── utils/      # contact-hasher, contact-normalizer
│   │   ├── contacts/       # Consulta de risco de contatos
│   │   ├── cron/           # Processamento de pedidos de remoção
│   │   ├── database/       # Seed script
│   │   ├── removal-requests/ # Pedidos de remoção LGPD
│   │   ├── reports/        # Relatos (mobile)
│   │   ├── users/          # Entidade e serviço de usuários
│   │   └── web/            # Relatos (web, JWT)
│   └── test/               # Testes E2E
│
├── SafeClientWeb/          # Frontend Next.js 14
│   └── app/
│       ├── admin/          # Área administrativa (dashboard, relatos, usuários)
│       ├── api/            # Route handlers (proxy para a API)
│       ├── cadastro/       # Página de registro
│       ├── components/     # HeaderBar, SearchPage, RelatoPage
│       ├── login/          # Página de login
│       ├── relato/         # Formulário de novo relato
│       └── resultado/      # Resultado da consulta
│
├── SafeClientMobil/        # App mobile React Native / Expo
├── .husky/                 # Git hooks (pre-commit, commit-msg)
├── commitlint.config.js    # Padrão de commits (Conventional Commits)
├── package.json            # Raiz: husky + lint-staged + commitlint
└── README.md
```

---

## Testes

### Testes Unitários (SafeClientApi)

```bash
cd SafeClientApi
npm test              # Roda todos os testes unitários
npm run test:cov      # Com cobertura
npm run test:watch    # Modo watch
```

Cobertura:
- `AuthService` — registro, login, duplicatas, senha inválida
- `UsersService` — findByEmail, findById, create, findAll
- `ReportsService` — create (dedup, userId), findByContactHash, deactivate
- `ContactsService` — lookup (alto/médio/baixo risco, not found, recomendações)
- `AdminService` — listReports, getReport, softDelete, updateReport, listUsers, createUser, deleteUser

### Testes E2E (SafeClientApi)

Requerem banco de dados PostgreSQL ativo e seed rodado.

```bash
cd SafeClientApi
npm run test:e2e
```

Cobertura:
- `POST /auth/register` — sucesso, email duplicado, senha curta, email inválido
- `POST /auth/login` — sucesso com token, senha errada, email desconhecido
- `GET /admin/stats` — admin autorizado, usuário comum bloqueado, não autenticado bloqueado
- `GET /admin/users` — listagem para admin
- `GET /admin/reports` — listagem e filtro por `active`
- `POST /admin/users` — criação de usuário pelo admin

---

## Pipeline de Qualidade

### Linting

```bash
# API
cd SafeClientApi && npm run lint        # Verifica
cd SafeClientApi && npm run lint:fix    # Corrige automaticamente

# Web
cd SafeClientWeb && npm run lint
cd SafeClientWeb && npm run lint:fix
```

### Formatação

```bash
# API
cd SafeClientApi && npm run format         # Formata
cd SafeClientApi && npm run format:check   # Verifica sem alterar

# Web
cd SafeClientWeb && npm run format
cd SafeClientWeb && npm run format:check
```

### Git Hooks (Husky)

Instalados automaticamente após `npm install` na raiz:

- **pre-commit**: Executa `lint-staged` nos arquivos staged (ESLint + Prettier)
- **commit-msg**: Valida a mensagem de commit com Commitlint

### Padrão de Commits (Conventional Commits)

```
<tipo>(<escopo opcional>): <descrição curta>

Tipos permitidos: feat, fix, docs, style, refactor, test, chore, perf, ci, revert
```

Exemplos:
```
feat(admin): add user management endpoints
fix(auth): handle bcrypt timing in login
docs: update README with setup instructions
test(reports): add deduplication spec
```

---

## Dependências

### SafeClientApi (NestJS)

| Pacote | Versão | Justificativa |
|--------|--------|---------------|
| `@nestjs/common` | ^11 | Framework NestJS — IoC, decorators, pipes, guards |
| `@nestjs/core` | ^11 | Runtime do NestJS |
| `@nestjs/platform-express` | ^11 | Adapter HTTP (Express) |
| `@nestjs/config` | ^4 | Carregamento de variáveis de ambiente tipado |
| `@nestjs/typeorm` | ^11 | Integração TypeORM com NestJS (injeção de repositórios) |
| `@nestjs/jwt` | ^11 | Assinatura e verificação de tokens JWT |
| `@nestjs/passport` | ^11 | Integração Passport.js com NestJS (estratégias de autenticação) |
| `@nestjs/schedule` | ^5 | Jobs agendados com cron (processamento de remoções LGPD) |
| `@nestjs/swagger` | ^11 | Geração automática de documentação OpenAPI em `/api/docs` |
| `typeorm` | ^0.3 | ORM para PostgreSQL com suporte a decorators TypeScript |
| `pg` | ^8 | Driver PostgreSQL nativo para Node.js |
| `bcrypt` | ^5 | Hash seguro de senhas com salt automático (10 rounds) |
| `passport-jwt` | ^4 | Estratégia Passport para extração e validação de JWT |
| `passport` | ^0.7 | Middleware de autenticação extensível |
| `class-validator` | ^0.14 | Validação declarativa de DTOs via decorators |
| `class-transformer` | ^0.5 | Transformação e serialização de objetos (integra com class-validator) |
| `reflect-metadata` | ^0.2 | Polyfill para metadata de decorators (requerido pelo TypeORM e NestJS) |
| `rxjs` | ^7 | Programação reativa (requerido pelo NestJS internamente) |

**DevDependencies API:**

| Pacote | Justificativa |
|--------|---------------|
| `jest` + `ts-jest` | Runner de testes com suporte TypeScript |
| `@nestjs/testing` | Módulo de teste do NestJS (TestingModule) |
| `supertest` | Testes HTTP E2E sem iniciar servidor real |
| `@types/jest` | Tipos TypeScript para Jest |
| `@types/bcrypt` | Tipos para bcrypt |
| `@types/passport-jwt` | Tipos para passport-jwt |
| `@types/supertest` | Tipos para supertest |
| `eslint` + `@typescript-eslint/*` | Linting estático TypeScript |
| `prettier` | Formatação automática de código |
| `@nestjs/cli` | CLI para scaffold e build |
| `ts-node` | Execução direta de TypeScript (seed, scripts) |
| `typescript` | Compilador TypeScript |

### SafeClientWeb (Next.js)

| Pacote | Versão | Justificativa |
|--------|--------|---------------|
| `next` | ^14 | Framework React com SSR, App Router, route handlers |
| `react` + `react-dom` | ^18 | Biblioteca de UI |
| `tailwindcss` | ^3 | CSS utilitário — estilização rápida e consistente |
| `postcss` + `autoprefixer` | ^8 / ^10 | Processamento CSS requerido pelo Tailwind |
| `prettier` | ^3 | Formatação de código |
| `typescript` | ^5 | Tipagem estática |

### Raiz do Monorepo

| Pacote | Justificativa |
|--------|---------------|
| `husky` | Git hooks — executa validações antes do commit |
| `lint-staged` | Executa linters apenas nos arquivos staged (performance) |
| `@commitlint/cli` | Validação da mensagem de commit |
| `@commitlint/config-conventional` | Preset Conventional Commits para commitlint |
