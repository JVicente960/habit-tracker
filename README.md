# Habit Tracker — Jos & San

App de acompanhamento de hábitos hospedado no Cloudflare Pages, com dados
compartilhados armazenados no Cloudflare KV (sem Supabase, sem localStorage).

## Estrutura

```
habit-tracker/
├── index.html              # o app inteiro (frontend)
└── functions/
    └── api/
        └── data.js         # Pages Function: GET/PUT /api/data (lê e grava no KV)
```

## Passo a passo do deploy

### 1. GitHub
1. Crie um repositório (ex.: `habit-tracker`)
2. Suba os arquivos mantendo a estrutura acima (a pasta `functions/` na raiz é obrigatória)

### 2. Cloudflare Pages
1. Acesse: https://dash.cloudflare.com/?to=/:account/pages/new/provider/github
2. Conecte o GitHub e selecione o repositório
3. Configuração de build:
   - Framework preset: **None**
   - Build command: (vazio)
   - Build output directory: `/`
4. **Save and Deploy**

### 3. Criar o banco KV
1. No dashboard do Cloudflare: **Storage & Databases → KV → Create namespace**
2. Nome: `habit-tracker-kv` (qualquer nome serve)

### 4. Conectar o KV ao projeto (binding)
1. Volte no projeto em **Workers & Pages → habit-tracker → Settings → Bindings**
2. **Add → KV namespace**
   - Variable name: `HABITS`  ← precisa ser exatamente esse nome
   - KV namespace: `habit-tracker-kv`
3. Faça um **Retry deployment** (ou um novo push) para o binding valer

Pronto. A URL `https://habit-tracker.pages.dev` funciona para os dois,
em qualquer aparelho, com os mesmos dados.

## Como funciona
- O app carrega os dados de `GET /api/data` ao abrir (e sempre que a aba
  volta ao foco — então se a San marcar algo, você vê ao voltar pro app)
- Cada alteração salva automaticamente via `PUT /api/data` (com debounce de 400ms)
- No primeiro acesso, o app cria dados de demonstração; é só excluir os
  hábitos de exemplo e criar os de vocês

## Observações
- A URL é pública — quem tiver o link consegue ver/editar. Para proteger,
  ative **Cloudflare Access** (Zero Trust) no projeto, que pede login por
  e-mail. Grátis para até 50 usuários.
- Plano free do KV: 100.000 leituras/dia e 1.000 gravações/dia — muito mais
  que suficiente para dois usuários.
