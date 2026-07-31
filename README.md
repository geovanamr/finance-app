# 💰 Finance App

Controle de gastos pessoais com Firebase, PWA e deploy no GitHub Pages.

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
2. Vá em **Settings → Secrets and variables → Actions**
3. Adicione os seguintes secrets com os valores do seu Firebase:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

4. Vá em **Settings → Pages** e configure:
   - Source: `Deploy from a branch`
   - Branch: `gh-pages` / `/ (root)`

5. Faça push para a branch `main` — o GitHub Actions fará o deploy automaticamente.

---

## Configuração do Firebase

### Firestore — regras de segurança

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firestore — índices necessários

Crie os seguintes índices compostos no console do Firebase:

**Coleção:** `users/{userId}/transactions`
- `monthKey` (ASC) + `date` (DESC)
- `monthKey` (ASC) + `monthKey` (ASC) + `date` (ASC) — para queries de período

**Coleção:** `users/{userId}/subcategories`
- `categoryId` (ASC) + `name` (ASC)

---

## Estrutura do projeto

```
src/
├── config/          # Firebase, categorias fixas, constantes
├── services/        # Camada de acesso ao Firebase (CRUD)
├── store/           # Estado global (Zustand)
├── pages/           # Dashboard, Lançamentos, Relatórios, Login
├── components/      # Componentes reutilizáveis
├── utils/           # Formatação, datas, exportação
├── types/           # Interfaces TypeScript
└── styles/          # CSS global e variáveis
```

## Adicionar categorias

Edite `src/config/categories.ts` e adicione um novo objeto ao array `CATEGORIES`.
