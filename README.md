# 🚚 Rastreamento de Entregas em Tempo Real

Sistema de **rastreamento de entregadores em tempo real**, desenvolvido em **Node.js**, utilizando **WebSockets (Socket.IO)**, **MongoDB**, **PostgreSQL**, **Sequelize** e **Leaflet.js** para visualização no mapa.

O projeto simula a movimentação de entregadores e exibe sua posição atual, histórico de deslocamento e rota planejada em um mapa interativo.

---

##  Funcionalidades

-  Rastreamento de entregadores em tempo real
-  Atualização automática da posição via WebSocket
-  Visualização em mapa interativo (Leaflet + OpenStreetMap)
-  Histórico de movimentação (rastro no mapa)
-  Backend híbrido:
  - **MongoDB** → dados em tempo real
  - **PostgreSQL** → dados estruturados (entregadores, rotas, checkpoints)
-  Simulador de entregador (movimento contínuo)

---

##  Arquitetura do Projeto

O sistema é dividido em três camadas principais:

### 1️⃣ Backend (Node.js + Express)
Responsável por:
- Servir a API REST
- Gerenciar conexões WebSocket
- Persistir dados em bancos distintos conforme o tipo de informação

Principais arquivos:
- `server.js` → servidor principal (Express + Socket.IO)
- `seed.js` → população inicial do MongoDB
- `seed-pg.js` → população inicial do PostgreSQL

---

### 2️⃣ Banco de Dados
O projeto utiliza **dois bancos de dados**, cada um com um papel específico:

#### 🔹 MongoDB (tempo real)
- Armazena:
  - Localização atual do entregador
  - Histórico de posições
- Usado para atualizações rápidas e frequentes
- Ideal para dados voláteis

#### 🔹 PostgreSQL (dados estruturados)
- Armazena:
  - Entregadores
  - Rotas
  - Checkpoints
- Relacionamentos bem definidos
- Gerenciado via **Sequelize ORM**

---

### 3️⃣ Frontend (Leaflet.js)
Responsável pela visualização:
- Mapa interativo com OpenStreetMap
- Marcadores de entregadores
- Rastro da movimentação
- Rota planejada

Arquivos principais:
- `frontend/index.html`
- `frontend/app.js`
- `frontend/style.css`


---

##  Como Rodar o Projeto Localmente

Siga os passos abaixo para executar o projeto em ambiente local.

###  Pré-requisitos
Certifique-se de ter instalado:
- Node.js (v18 ou superior)
- MongoDB (local ou MongoDB Atlas)
- PostgreSQL
- Git

---

###  1️⃣ Instalar as dependências
No diretório do projeto, execute:

```bash
npm install



##  Observação sobre a movimentação no mapa

A movimentação do entregador no mapa é **simulada matematicamente**, utilizando variação incremental de latitude e longitude.

Por esse motivo, o marcador pode atravessar prédios, rios ou áreas fora das ruas.

Isso é **intencional** e faz parte do escopo do projeto, que tem como foco:
- comunicação em tempo real
- arquitetura backend
- persistência de dados
- visualização geográfica

Uma possível evolução futura seria a integração com APIs de roteamento real, como:
- Google Directions API
- OpenRouteService
- OSRM

---

##  Status do Projeto

✔️ Funcional  
✔️ Estável  
✔️ Pronto para avaliação técnica  
 Aberto para melhorias futuras

---

## Autor

**Denis Gonçalves Santos**  
Projeto desenvolvido como estudo e desafio técnico sobre sistemas de rastreamento em tempo real.

