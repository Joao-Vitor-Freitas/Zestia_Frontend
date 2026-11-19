# Zestia — Front-end

Aplicação web que conecta organizações (supermercados, ONGs e cozinhas comunitárias) para doação e solicitação de alimentos.
Projeto da **FIAP Global Solution 2026.2 — CitizenTech** (Grupo Orion).

Todos os tipos de organização podem **doar e receber**; o tipo descreve a instituição, não suas permissões.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagem | JavaScript (ES2022) + JSX |
| Interface | React 18 |
| Estilo | Tailwind CSS 3 com os tokens do guia visual (`Zestia.pdf`) em `tailwind.config.js`; fontes Space Grotesk (títulos) e Inter (texto) |
| Build | Vite 5 |
| Testes | Vitest 2 + Testing Library + jsdom |
| Estado | Context API (`src/context.jsx`) + hook `useAsync` |

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 14 testes (regras de negócio + fluxos de tela)
npm run build    # gera a pasta dist/
```

### Variáveis de ambiente

Copie `.env.example` para `.env`:

| Variável | Efeito |
|---|---|
| `VITE_API_URL` vazia | **Modo demonstração**: API simulada, dados salvos no `localStorage` do navegador (aparece uma faixa de aviso no topo). |
| `VITE_API_URL=http://localhost:8000` | Usa a API REST real. |

> Para a entrega (RNF-04), configure `VITE_API_URL`: dados do modo demonstração não ficam em API externa.

## Contrato esperado da API

Todas as chamadas enviam o header `X-Organization-Id` (organização ativa). O back-end deve **validar permissões e quantidades no servidor** (RNF-07) e liberar esse header no CORS.

| Método e rota | Descrição |
|---|---|
| `GET/POST /organizations`, `PUT/DELETE /organizations/{id}` | CRUD de organizações (RN-01, RN-02) |
| `GET /foods` | Lista com `donorName`, `availableKg` (= registrado − aprovado) e `hasRequests` |
| `POST /foods`, `PUT/DELETE /foods/{id}` | CRUD de alimentos (RN-03 a RN-06) |
| `GET /requests` | Solicitações com `foodName`, `donorOrganizationId`, `donorName`, `recipientName` (idealmente já filtradas pela organização do header) |
| `POST /requests` | `{ foodId, quantityKg }` (RN-07, RN-08) |
| `POST /requests/{id}/approve` e `/reject` | Somente o doador, somente `PENDING`, sem ultrapassar o registrado, com controle de concorrência (RN-09, RN-10) |
| `GET /metrics?organizationId=&status=` | `organizations, registeredKg, requestedKg, approvedKg, pending, approved, rejected` (RN-12, RN-13) |

Erros devem vir como `{ "detail": "mensagem" }` com o status HTTP adequado (400, 403, 404, 409).

## Estrutura

```
src/
  components/   Sidebar (navegação), PageHeader, Button, Field, Badges (selo de validade,
                origem, status, avatar), FoodCard, Modal, Toast, Alert, AsyncView, Icon, ErrorBoundary
  pages/        Offers (Explorar doações), MyFoods (Meus lotes), Donate (Nova doação/edição),
                Approvals (Aprovações), MyRequests (Minhas requisições), Dashboard, Organizations
  format.js     formatação (kg, datas) e regra do selo de validade (< 24h, 24–72h, > 72h)
  services/     api.js (acesso a dados) e mock.js (API simulada com as RN)
  hooks/        useAsync.js (carregando / erro / dados, ignora respostas antigas)
  context.jsx   organização ativa, lista de organizações e avisos (toast)
  *.test.*      testes automatizados
```

Separação de responsabilidades (RNF-06): **apresentação** em `components/` e `pages/`, **lógica/estado** em `context.jsx` e `hooks/`, **acesso a dados** em `services/`.

## Requisitos atendidos

- **RF-01 a RF-08** e **RN-01 a RN-13** do backlog (as RN são aplicadas também pela API simulada e cobertas por testes).
- **RNF-01 Responsividade:** barra lateral no desktop; no celular, topo + barra de navegação inferior com o botão “Nova doação”; tabelas rolam dentro do próprio container (focável pelo teclado).
- **RNF-02 Acessibilidade:** landmarks (`header`, `nav` rotuladas, `main`, `aside`), hierarquia de títulos, listas e `article` nos cards; rótulos visíveis com dica e erro ligados por `aria-describedby` e foco no primeiro campo inválido; selos sempre com ícone + texto (nunca só cor); contraste AA nos selos e 3:1 nas bordas dos campos; alvos de toque ≥ 44 px; `aria-current` na navegação e `aria-pressed` nos filtros; regiões ao vivo fixas para avisos e contagem de resultados; foco preso no modal e movido ao título ao trocar de tela; respeita `prefers-reduced-motion`.
- **RNF-05 Usabilidade:** validação nos formulários; estados de carregando (esqueleto), sucesso (aviso), erro (com "tentar novamente") e vazio; botões desabilitados durante o envio (sem cliques duplicados); botão "Atualizar" e recarga ao voltar para a janela; tela de erro amigável (`ErrorBoundary`).
- **RNF-03:** 13 componentes reutilizáveis.

## Limitações conhecidas

- Não há autenticação: a organização ativa é escolhida em "Atuando como" e enviada em `X-Organization-Id`. Em produção, trocar por login/token.
- O back-end não faz parte deste repositório.
- Nesta versão, solicitações aprovadas **não** significam entrega confirmada (fora do escopo do MVP, RN-13).
