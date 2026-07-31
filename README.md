# 💰 Finance App

Controle de gastos pessoais com Firebase, PWA e deploy no GitHub Pages.

Consulte [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) para ver o comportamento
detalhado de todas as áreas do aplicativo.

## Configuração

### 1. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais do Firebase:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com as chaves do seu projeto Firebase.

### 2. Instalar dependências

```bash
npm install --legacy-peer-deps
```

### 3. Rodar localmente

```bash
npm run dev
```

### 4. Build de produção

```bash
npm run build
```

---

## Deploy no GitHub Pages

### Configuração do repositório

1. Crie o repositório `finance-app` no GitHub
2. Confira as variáveis `VITE_FIREBASE_*` da etapa **Build** em
   `.github/workflows/deploy.yml`. Elas contêm a configuração pública do SDK
   Web do projeto Firebase.
3. Vá em **Settings → Pages** e configure:
   - Source: `Deploy from a branch`
   - Branch: `gh-pages` / `/ (root)`

4. Faça push para a branch `main` — o GitHub Actions fará o deploy automaticamente.

A chave Web do Firebase identifica o projeto, mas não autoriza acesso aos
dados. A proteção é feita pelo Authentication e pelas regras do Firestore.

---

## Configuração do Firebase

### Firestore — regras de segurança

As regras estão versionadas em `firestore.rules`, com a configuração em
`firebase.json`. Para publicá-las com o Firebase CLI:

```bash
firebase deploy --only firestore
```

### Firestore — índices

As consultas atuais usam apenas índices de campo único, criados automaticamente
pelo Firestore. O arquivo `firestore.indexes.json` fica versionado para futuras
consultas que exijam índices compostos.

## Qualidade

```bash
npm run lint
npm test
npm run build
```

O deploy executa as três verificações antes de publicar a aplicação.

---

## Estrutura do projeto

```
src/
├── config/          # Firebase e constantes
├── services/        # Camada de acesso ao Firebase (CRUD)
├── store/           # Estado global (Zustand)
├── pages/           # Dashboard, Lançamentos, Relatórios, Login
├── components/      # Componentes reutilizáveis
├── utils/           # Formatação, datas, exportação
├── types/           # Interfaces TypeScript
└── styles/          # CSS global e variáveis
```

## Gerenciar categorias

As categorias pertencem ao usuário e ficam na coleção
`users/{userId}/categories` do Firestore. Depois de entrar no aplicativo, use a
tela **Categorias** para criar, editar ou excluir categorias. No primeiro login,
o arquivo `public/default-categories.json` é importado automaticamente quando a
coleção ainda está vazia.
