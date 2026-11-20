# Uso de Inteligência Artificial

Ferramenta utilizada: **Claude (Anthropic)**, por chat.

## Onde a IA foi usada
- **Planejamento:** passo a passo de desenvolvimento a partir do `backlog.md` e do documento de escopo.
- **Front-end:** geração da base do projeto (React, Vite, Tailwind), das telas, dos componentes e da API simulada, a partir do design exportado do Stitch (`DESIGN.md`, `code.html`, `screen.png`).
- **Revisão:** rodadas de busca de bugs (contraste, foco no teclado, condições de corrida, arredondamento de decimais, validações).
- **Testes:** escrita dos testes automatizados (Vitest + Testing Library).
- **Documentação:** rascunho do README.

## Decisões tomadas pelo grupo
- Nome oficial atual do projeto: **Zestia**.
- Escopo do MVP e numeração das RN: as do `backlog.md`.
- Itens do design fora do MVP foram removidos (monitoramento IoT, compatibilidade/cadeia de frio, logística, cota parcial).

## Como validamos o resultado da IA
- Execução da suíte de testes (`npm test`) e do build (`npm run build`).
- A revisão manual do grupo em navegadores e dispositivos ainda precisa ser registrada; não foi inventada.

## Limitações observadas
- O código gerado foi validado em ambiente de teste (jsdom); testes em navegadores reais, leitores de tela e dispositivos móveis devem ser feitos pelo grupo.

## Atualização com Codex — 19/11/2026

Codex/OpenAI foi usado para completar a integração da versão atual: recuperação,
restauração/encerramento, métricas detalhadas, saldo do servidor, revisão de sessão,
testes HTTP/interface e documentação. Os testes antigos ainda esperavam um mock removido
pela versão remota; foram adaptados para o contrato real mantendo cenários de validação,
propriedade, pedido, navegação e duplicidade, e acrescentando recuperação/restauração.
Os testes simulam fetch; integridade concorrente é validada separadamente no PostgreSQL.
Não há alegação de teste manual da equipe nem de aceitação real do SMTP.
