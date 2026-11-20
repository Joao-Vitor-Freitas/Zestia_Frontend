# Zestia — Frontend

CitizenTech da FIAP GS 2026.2, Grupo Orion. Organizações de Porto Alegre publicam alimentos,
solicitam quantidades e aprovam/rejeitam pedidos. Todos os tipos podem doar e receber;
participação exige verificação. Indicadores de aprovação não comprovam entrega.

## Ficha CitizenTech

| Campo | Informação |
|---|---|
| Nome | Zestia |
| Cidade e bairro | Porto Alegre/RS; bairro-piloto ainda a definir. |
| Cidadão beneficiado | Pessoas atendidas por cozinhas comunitárias e organizações receptoras. |
| Problema | Dificuldade de compatibilizar ofertas de alimentos com necessidades das organizações. |
| Funcionamento | Publicar, solicitar quantidades, aprovar/rejeitar e acompanhar indicadores. |
| Partes | Interface React; API Python valida operações; PostgreSQL persiste; análise Python e protótipo IoT são módulos do projeto. Não há alegação de conexão IoT ao app. |
| Repositório | https://github.com/Joao-Vitor-Freitas/Realimenta_Frontend |
| Indicador | Kg solicitados/aprovados; aprovação não comprova entrega nem desperdício evitado. |
| ODS | ODS 2 — Fome Zero; ODS 12 — Consumo e Produção Responsáveis. |

Não há entrevistas locais ou impacto real documentados. Dados demonstrativos são fictícios.

## Executar

Requer Node.js 20+ e API Zestia em execução com migrações aplicadas.

```sh
npm ci
npm run dev
npm test
npm run build
```

Configure `VITE_API_URL` no ambiente ou em arquivo local ignorado, apontando para a
origem da API ou sua URL com `/api/v1`. Exemplo de desenvolvimento:
`VITE_API_URL=http://localhost:8001/api/v1`. A API precisa permitir a origem do frontend
em seu CORS. Sem URL configurada, a aplicação informa o erro; não há modo mock.
Nunca use credenciais de banco, segredo JWT ou senha administrativa em variáveis VITE.

## Fluxo simples

1. Crie uma conta e cadastre uma organização.
2. Envie comprovação no aviso de verificação. Um administrador analisa em **Verificação**.
3. Depois de verificada, publique um alimento em **Nova doação**.
4. Outra conta, com outra organização verificada, solicita em **Explorar doações**.
5. O doador aprova ou recusa em **Aprovações**. Consulte o histórico e o **Painel**.
6. **Minha conta** permite restaurar organização arquivada, encerrar conta e verificar conexão.
7. Na entrada, **Recuperar conta** solicita instruções e confirma o código recebido.

Cada conta opera sua própria organização. Para demonstrar dois participantes, use duas
sessões de navegador ou saia e entre com a outra conta. Não existe seletor “Atuando como”.
O administrador é provisionado pelo operador no backend; não é escolhido no cadastro.
A entrega real do e-mail depende da configuração privada do operador; 503 é exibido como
indisponibilidade, sem fingir envio. Restaurar uma organização exige ausência de outra ativa.

## Cobertura da API

| Operação | Onde usar |
|---|---|
| Registrar, login, consultar conta e logout | Entrada e Sair |
| Encerrar conta | Minha conta |
| Solicitar/confirmar recuperação | Recuperar conta na entrada |
| Criar organização | Cadastro inicial |
| Listar, consultar detalhe, editar e excluir organização | Organizações |
| Listar arquivadas e restaurar | Minha conta; também acessível no cadastro inicial |
| Enviar comprovação | Aviso de verificação ou Minha conta |
| Ler evidência e registrar revisão | Verificação, somente ADMIN |
| Criar, listar, consultar, editar e excluir alimento | Nova doação, ofertas, meus lotes e resumo da aprovação |
| Saldo e existência de pedidos | GET /foods/{id}/availability, calculado no backend |
| Criar, listar e consultar pedido | Ofertas, histórico e resumo da aprovação |
| Aprovar/rejeitar pedido | Aprovações |
| Resumo e detalhamento de métricas com filtros | Painel e tabela Por organização |
| Saúde da API e banco | Minha conta → Verificar conexão |

O backend local inclui o endpoint de disponibilidade; publicar apenas o frontend sem essa
atualização do backend produzirá 404 na consulta de saldo. Não é necessária nova migração.

## Organização e decisões

React 18 + Vite + Tailwind. `components/` contém componentes reutilizáveis; `pages/` telas;
`context.jsx` sessão e organização; `services/api.js` HTTP/token/conversão/erros;
`services/data.js` paginação e preparação dos dados; `hooks/` carregamento e envio.
O servidor decide propriedade, elegibilidade e limites de quantidade. O frontend usa os
agregados de saldo do servidor, pois não pode consultar pedidos privados de terceiros.
O resumo de aprovação não comprova entrega nem gera código autenticador de retirada.

## Validação e entrega pelo TODO

- React, mais de 8 componentes, separação de responsabilidades, CRUD, sessão,
  formulários, loading/sucesso/erro/vazio e consumo da API estão implementados.
- Testes de interface usam fetch simulado no contrato real, sem provar implantação.
- Conferir manualmente celular/tablet/desktop, teclado, contraste e a configuração CORS
  do ambiente real. Esses aceites não são substituídos pelo build.
- O histórico consultado tem 12 commits; o TODO exige 15 commits significativos.
  Não foram fabricados commits nem executados commit/push nesta tarefa.
- Confirmar repositório privado e acesso do professor. Enviar link e ZIP em cada tarefa
  de Front-end Design e Web Development no Teams. Publicação/acesso/envio não foram feitos.
- Integrantes em INTEGRANTES.md; uso de IA em AI.md; interações em PROMPTS.md.

## Resultado da verificação local — 19/11/2026

14 testes do frontend passaram e o build de produção passou, em cópia isolada sem
carregar arquivos privados de ambiente. O backend passou no gate completo com 391 testes,
nenhum ignorado, cobertura 99%, scanner, lint, dependências e round trip de migrações.
Isso não comprova implantação, recebimento de e-mail ou execução em navegadores reais.
