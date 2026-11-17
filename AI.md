# Uso de Inteligência Artificial

Ferramenta utilizada: **Claude (Anthropic)** e **Gemini**, por chat.

## Onde a IA foi usada
- **Planejamento:** passo a passo de desenvolvimento a partir do `backlog.md` e do documento de escopo.
- **Front-end:** geração da base do projeto (React, Vite, Tailwind), redesign Zestia preservando o verde institucional (#137A4D), telas, componentes e API simulada.
- **Revisão:** rodadas de busca e correção de bugs (contraste, foco no teclado, condições de corrida, arredondamento de decimais, validação de datas na edição e segurança contra XSS).
- **Testes:** escrita dos testes automatizados (Vitest + Testing Library).
- **Documentação:** rascunho do README.

## Decisões tomadas pelo grupo
- Nome do projeto: **Zestia**.
- Escopo do MVP e numeração das RN: as do `backlog.md`.
- Identidade visual Zestia mantendo o verde original (#137A4D).

## Como validamos o resultado da IA
- Execução da suíte de testes (`npm test`) e do build (`npm run build`).
