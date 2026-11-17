# Uso de Inteligência Artificial

Ferramenta utilizada: **Claude (Anthropic)**, por chat.

## Onde a IA foi usada
- **Planejamento:** passo a passo de desenvolvimento a partir do `backlog.md` e do documento de escopo.
- **Front-end:** geração da base do projeto (React, Vite, Tailwind), das telas, dos componentes e da API simulada, a partir do design exportado do Stitch (`DESIGN.md`, `code.html`, `screen.png`).
- **Revisão:** rodadas de busca de bugs (contraste, foco no teclado, condições de corrida, arredondamento de decimais, validações).
- **Testes:** escrita dos testes automatizados (Vitest + Testing Library).
- **Documentação:** rascunho do README.

## Decisões tomadas pelo grupo
- Nome do projeto: **ReAlimenta**.
- Escopo do MVP e numeração das RN: as do `backlog.md`.
- Itens do design fora do MVP foram removidos (monitoramento IoT, compatibilidade/cadeia de frio, logística, cota parcial).

## Como validamos o resultado da IA
- Execução da suíte de testes (`npm test`) e do build (`npm run build`).
- _Preencher: o que o grupo revisou, testou manualmente e alterou por conta própria._

## Limitações observadas
- O código gerado foi validado em ambiente de teste (jsdom); testes em navegadores reais, leitores de tela e dispositivos móveis devem ser feitos pelo grupo.
