# **Global Solution FIAP 2026.2 — Requisitos completos das 7 disciplinas**

**Fonte:** briefing oficial _CitizenTech — Engenharia de Software, 1º ano, Porto Alegre_.

PRAZO FINAL

Hoje

# **19/11/2026 · 23h55**

As sete disciplinas exigem entregas separadas pelo Teams. Apenas um integrante da equipe precisa enviar cada entrega.

## **1. Computational Thinking with Python**

Professor(a): Maria Clara Martins · Lógica e processamento de dados

**Objetivo:** desenvolver uma solução em Python que armazene, manipule e processe dados de um problema real da cidade para apoiar decisões.

### **Requisitos e entregáveis**

- Desenvolver um programa funcional em Python.
- Utilizar dados relacionados ao problema escolhido.
- Armazenar, manipular e processar os dados.
- Produzir resultados que ajudem a compreender o problema ou tomar uma decisão.
- Disponibilizar o código-fonte no GitHub.
- Incluir os dados utilizados e/ou gerados.
- Incluir `requirements.txt`.
- Incluir `README.md` contendo:
  - Qual problema da cidade foi escolhido?
  - O que a solução proposta faz?
  - Quickstart: como executar a aplicação.
- Informar o nome completo de todos os integrantes no envio.
- Enviar o link do repositório pelo Teams.

### **Critérios de avaliação**

Lógica computacional

50%

Dados e organização do repositório

25%

Documentação

25%

**Aplicação na ReAlimenta:** analisar alimentos cadastrados, solicitações e quantidades aprovadas, gerando estatísticas e informações úteis para decisões.

## **2. Differentiated Problem Solving**

Professor(a): Celso · Modelagem Matemática Avançada

**Objetivo:** aplicar cálculo diferencial e integral a um fenômeno urbano ou social relacionado ao projeto.

### **Requisitos**

- Definir um problema matemático relacionado à CitizenTech.
- Construir um modelo matemático.
- Aplicar **limites** e analisar comportamentos extremos.
- Aplicar **derivadas**.
- Analisar **taxas de variação**.
- Aplicar **integrais** para calcular grandezas acumuladas.
- Produzir gráficos com Python ou GeoGebra.
- Interpretar os resultados no contexto do problema.

### **Entregáveis**

- Código `.py` **ou** arquivo `.ggb` do GeoGebra, com implementações e gráficos.
- Relatório técnico em **PDF**, contendo:
  - Descrição do problema.
  - Modelo matemático.
  - Análises de cálculo.
  - Interpretação dos resultados.
- Enviar os arquivos pelo Teams.

**Critérios de avaliação:** o briefing informa que estarão na avaliação, ao lado de cada questão. Não apresenta uma distribuição de pontos nessa seção.

**Aplicação na ReAlimenta:** modelar a evolução da quantidade de alimentos disponibilizados ou recebidos ao longo do tempo, calculando taxas e acumulados.

## **3. Edge Computing & Computer Systems**

Professor: Guilherme Salati · IoT com ESP32

**Objetivo:** desenvolver um dispositivo IoT simulado que leia sensores, atue localmente e troque dados com uma plataforma na nuvem.

### **Requisitos do dispositivo — 75 pontos**

**Leitura de sensores**

15 pts

- Utilizar ESP32 no Wokwi.
- Ler pelo menos um sensor analógico ou digital.
- Realizar medições com intervalo preciso e constante.

**Atuação local**

10 pts

- Implementar um atuador, como LED, relé ou outro dispositivo.
- Processar a lógica de acionamento no próprio ESP32.

**Display local**

15 pts

- Utilizar um display.
- Exibir o valor atual medido.
- Exibir o estado do atuador.
- Exibir o estado das conexões WiFi/MQTT.

**MQTT e nuvem**

35 pts

- Enviar dados via MQTT.
- Receber dados via MQTT.
- Utilizar uma plataforma IoT, como FIWARE ou ThingSpeak.
- Persistir dados usando STH Comet ou ThingSpeak.
- Receber valores de configuração remotos e/ou comandos para acionamento do atuador.
- Apresentar dashboard com informações do dispositivo.
- Utilizar Node-RED para o dashboard caso ele não seja implementado na disciplina de Front-end.

### **Vídeo de demonstração — 15 pontos**

- Gravar a tela com o dispositivo funcionando no simulador.
- Alterar valores do sensor.
- Demonstrar atualização do display.
- Demonstrar atualização do dashboard.
- Demonstrar a situação de desconexão WiFi no display.
- Demonstrar a situação de desconexão MQTT no display.

### **README e repositório — 10 pontos**

- Repositório GitHub com os arquivos.
- README com nomes dos integrantes.
- Código-fonte.
- Arquivo de diagrama da simulação.
- Contextualização do projeto.
- Instruções de funcionamento da tela local.
- Plataforma IoT utilizada.
- Descrição dos devices/entidades (FIWARE) ou devices/canais (ThingSpeak).

**Aplicação na ReAlimenta:** ESP32 com sensor de temperatura, LED de alerta, display e comunicação MQTT para monitorar condições ambientais de armazenamento simuladas.

## **4. Front-end Design**

Professor: Sandro Martins da Costa · Interface e acessibilidade

**Objetivo:** construir uma interface web clara, acessível, responsiva e organizada em componentes.

### **Requisitos técnicos**

- Utilizar biblioteca ou framework de desenvolvimento web.
- Implementar pelo menos **8 componentes reutilizáveis**.
- Organizar os componentes por responsabilidade.
- Separar apresentação, regras de negócio e acesso aos dados.
- Criar interface coerente com o público e problema.
- Aplicar hierarquia visual e consistência.
- Garantir navegação compreensível.

### **Responsividade**

- Funcionar em celular.
- Funcionar em tablet.
- Funcionar em desktop.
- Evitar cortes, sobreposições e rolagem horizontal indevida.
- Manter menus, formulários e conteúdos utilizáveis.

### **Acessibilidade**

- Utilizar HTML semântico.
- Garantir contraste legível.
- Permitir navegação por teclado.
- Exibir foco visível.
- Identificar campos de formulários.
- Fornecer alternativas textuais pertinentes.
- Não depender exclusivamente de cores para comunicar informações.

### **Documentação e entrega**

- Repositório GitHub **privado**.
- Conceder acesso ao professor.
- Pelo menos **15 commits significativos**.
- ZIP do projeto.
- `README.md` com instruções de instalação e execução.
- `AI.md` documentando o uso real de IA ou declarando sua ausência.
- `PROMPTS.md` registrando as interações com IA, quando houver.
- `INTEGRANTES.md` com nome completo e RM.
- Enviar link e ZIP pelo Teams.

### **Critérios de avaliação**

| Critério                               | Pontos   |
| -------------------------------------- | -------- |
| Interface e usabilidade                | 3,0      |
| Responsividade                         | 2,0      |
| Acessibilidade                         | 2,0      |
| Componentização e implementação visual | 2,0      |
| Documentação e versionamento           | 1,0      |
| **Total**                              | **10,0** |

**Aplicação na ReAlimenta:** telas de organizações, alimentos, solicitações e métricas, com componentes reutilizáveis e layout acessível.

## **5. Software & Total Experience Design**

Experiência do usuário, requisitos e planejamento do produto

**Objetivo:** compreender o problema e os usuários, definir a solução e estruturar seus requisitos e backlog.

### **Requisitos obrigatórios**

- Levantar informações sobre o problema.
- Levantar informações sobre o negócio envolvido.
- Considerar os interesses e necessidades dos usuários.
- Definir uma solução coerente e viável.
- Elaborar o escopo da ideia, incluindo:
  - Problema.
  - Solução proposta.
- Documentar os **Requisitos Funcionais (RF)**.
- Documentar os **Requisitos Não Funcionais (RNF)**.
- Documentar as **Regras de Negócio (RN)**.
- Criar o Product Backlog.
- Ordenar o backlog por prioridade.
- Organizar o backlog por épicos.

### **Formato obrigatório**

**Um único relatório** contendo:

- Capa.
- Nome completo de todos os integrantes.
- Índice.
- Justificativa.
- Escopo do problema e solução.
- RF, RNF e RN.
- Backlog priorizado por épicos.
- Conclusão.

### **Elementos adicionais**

Os itens abaixo são úteis, mas **não aparecem como entregáveis obrigatórios explícitos** nessa seção do briefing:

- SWOT.
- Personas.
- User Stories.
- Jornada do usuário.
- Critérios de aceite.
- Diagrama de arquitetura.

Podem ser incluídos para melhorar o relatório, sem substituir os requisitos obrigatórios.

**Observação:** o briefing não exige explicitamente que cada RF tenha uma RN associada. Essa rastreabilidade pode ser mantida como regra de documentação do projeto.

**Avaliação:** não há rubrica numérica detalhada no briefing consultado.

**Aplicação na ReAlimenta:** relatório consolidado com as entidades Organization, Food e Request, suas regras de negócio, métricas e backlog de quatro épicos.

## **6. Storytelling & Inspiração Empreendedora**

Professor: André Maluf · Pitch

**Objetivo:** apresentar a CitizenTech como uma solução integrada e demonstrável, centrada no cidadão.

### **Entregável obrigatório**

- **Um único vídeo pitch**, com duração máxima de 3 minutos.
- Mostrar quem é o cidadão beneficiado.
- Explicar o problema.
- Explicar como a solução funciona.
- Apresentar a proposta de valor.
- Demonstrar as entregas das disciplinas funcionando.
- Mostrar como as partes formam um produto.
- Explicar o impacto e como medi-lo.
- Relacionar o projeto aos ODS.
- A equipe deve aparecer e apresentar com imagem e voz.
- Utilizar slides apenas como apoio; não apresentar somente slides.
- Publicar no YouTube como **não listado**.
- Testar o link em janela anônima.
- Enviar o link pelo Teams com nomes completos e RMs.

### **Roteiro sugerido pela FIAP**

| Tempo | Conteúdo                       |
| ----- | ------------------------------ |
| 0:00  | Gancho: cena, pergunta ou dado |
| 0:20  | Cidadão e problema             |
| 0:50  | Solução e funcionamento        |
| 1:20  | Demonstração das disciplinas   |
| 2:20  | Impacto, métricas e ODS        |
| 2:45  | Equipe e encerramento          |

O roteiro é sugerido; o limite de três minutos é obrigatório.

### **Critérios de avaliação**

| Critério                                  | Pontos   |
| ----------------------------------------- | -------- |
| Cidadão e problema claros                 | 2,0      |
| Solução e proposta de valor               | 2,0      |
| Integração das entregas em um produto     | 2,5      |
| Narrativa: gancho, jornada e encerramento | 2,0      |
| Comunicação e uso do tempo                | 1,5      |
| **Total**                                 | **10,0** |

**Aplicação na ReAlimenta:** demonstrar uma organização cadastrando alimentos, outra solicitando, o doador aprovando e os indicadores sendo atualizados. Integrar também as evidências de Python, Matemática e IoT.

## **7. Web Development**

Professor: Sandro Martins da Costa · Interação, API e lógica

**Objetivo:** implementar funcionalidades reais, com gerenciamento de dados, estados, validações e tratamento de erros.

### **Integração de dados — 3 pontos**

- Integrar uma **API externa**.
- Implementar criação de registros (`POST`).
- Implementar consulta de registros (`GET`).
- Implementar atualização de registros (`PATCH` ou `PUT`).
- Implementar exclusão de registros (`DELETE`).
- Interpretar corretamente as respostas da API.
- Manter a interface sincronizada com os dados.

### **Gerenciamento de estado — 2 pontos**

- Gerenciar os estados da aplicação.
- Atualizar os estados corretamente após interações.
- Manter os dados sincronizados com a interface.
- Organizar e reutilizar a lógica de comportamento.

### **Arquitetura e componentes — 2 pontos**

- Implementar pelo menos **8 componentes**.
- Definir responsabilidades claras.
- Separar:
  - Apresentação.
  - Regras de negócio.
  - Acesso aos dados.
- Evitar duplicações desnecessárias.

### **Validação e experiência — 2 pontos**

- Implementar tarefas coerentes com a necessidade do cidadão.
- Validar entradas de formulários.
- Tratar falhas da API.
- Exibir estado de carregamento.
- Exibir confirmação de sucesso.
- Exibir mensagens de erro.
- Exibir estado vazio quando não houver dados.
- Permitir que o usuário compreenda os resultados e prossiga.

### **Documentação e versionamento — 1 ponto**

- Repositório privado com acesso ao professor.
- Pelo menos **15 commits significativos**.
- ZIP completo.
- `README.md` com instalação, execução e decisões do projeto.
- `AI.md`.
- `PROMPTS.md`.
- `INTEGRANTES.md` com nomes completos e RMs.
- Envio pelo Teams.

### **Critérios de avaliação**

| Critério                            | Pontos   |
| ----------------------------------- | -------- |
| Integração e gerenciamento de dados | 3,0      |
| Estados e comportamentos            | 2,0      |
| Estrutura e organização             | 2,0      |
| Resolução de problemas e interação  | 2,0      |
| Documentação e versionamento        | 1,0      |
| **Total**                           | **10,0** |

**Aplicação na ReAlimenta:** CRUD de organizações e alimentos, criação e aprovação de solicitações, persistência pela API e atualização das métricas.

## **8. Requisitos gerais da Global Solution**

Além das exigências individuais, o briefing estabelece:

- Escolher um problema real de Porto Alegre ou da cidade dos integrantes.
- Identificar o território e o cidadão beneficiado.
- Conversar com alguém que convive com o problema.
- Desenvolver uma única CitizenTech para as sete disciplinas.
- Construir um protótipo funcional, mesmo que pequeno.
- Demonstrar como as partes da solução se relacionam.
- Identificar os ODS relacionados e explicar a contribuição.
- Evitar dados pessoais reais; utilizar dados públicos ou simulados, identificando sua origem.
- Preencher a **Ficha CitizenTech** e colocá-la no início do README.
- Registrar os prompts utilizados com IA e compreender o código entregue.
- Garantir que os integrantes conheçam o projeto.
- Respeitar o limite de três integrantes da mesma turma.
- Respeitar a presença nas aulas de orientação, conforme o formato da disciplina.
- Fazer sete submissões separadas no Teams.

### **Ficha CitizenTech obrigatória no README**

- Nome da CitizenTech.
- Cidade e bairro.
- Cidadão beneficiado.
- Problema em uma frase.
- Como funciona.
- O que cada parte faz.
- Link do repositório.
- Indicador de impacto.
- ODS conectados.

## **9. Resumo final dos entregáveis**

| Disciplina   | O que entregar                                                         |
| ------------ | ---------------------------------------------------------------------- |
| Python       | GitHub com código, dados, `requirements.txt` e README                  |
| Matemática   | `.py` ou `.ggb`, gráficos e relatório PDF                              |
| Edge         | GitHub com ESP32/Wokwi, código, diagrama, README e vídeo               |
| Front-end    | Repositório privado, ZIP, 15 commits e quatro arquivos de documentação |
| Experience   | Relatório único com escopo, RF, RNF, RN e backlog                      |
| Storytelling | Link YouTube não listado, vídeo de até 3 minutos                       |
| Web          | Repositório privado, ZIP, 15 commits, CRUD externo e documentação      |

**Pontos críticos para a ReAlimenta:** o MVP Web pode continuar pequeno, mas isso não elimina os requisitos de Matemática, Python e Edge. Especialmente em Edge, **MQTT bidirecional, persistência, configuração remota e demonstração de desconexão** são exigências explícitas, não funcionalidades opcionais.

Os requisitos acima foram extraídos do briefing oficial fornecido. Exigências adicionais que algum professor tenha publicado exclusivamente no Teams, como os critérios específicos de Matemática, precisam ser conferidas na tarefa correspondente.
