# Pokédex — Atividade 04

Continuação da Atividade 03: React + Vite consome uma API REST Spring Boot e persiste dados no MongoDB. A interface original, pesquisa por nome/ID, filtro por tipo secundário, ordenação, atributos, temas e equipes foram mantidos. Cadastro, edição e exclusão estão disponíveis na aba Pokémon.

## Estrutura

- `src/`: frontend React existente.
- `backend/`: Spring Boot 3.5.7, Spring Web, Validation e Spring Data MongoDB; pacotes controller, service, repository, model e config.
- `database/seed/Script_Pokedex.sql`: fonte original fornecida pelo professor.
- `scripts/convert-sql.mjs`: conversor reproduzível SQL → documentos.
- `compose.yaml`: MongoDB local com volume persistente e backend opcional.

### Organização das pastas

```text
pokedex/
├── backend/                 # API Spring Boot e carga MongoDB gerada
├── database/
│   └── seed/                # Script SQL original fornecido
├── docs/
│   ├── archive/atividade-03/ # Prompt histórico da atividade anterior
│   └── images/              # Capturas de tela da interface
├── e2e/                     # Testes de navegador
├── scripts/                 # Conversão dos dados e utilitários
├── src/                     # Frontend React
├── tests/                   # Testes unitários do frontend e conversor
├── compose.yaml
└── README.md
```

O material em `docs/archive/` é histórico e descreve a Atividade 03. Para a versão atual, siga este README.

## Execução rápida (Docker + Node.js)

Requisitos: Node.js 22.12+ e Docker Desktop em execução. Na raiz:

```powershell
npm ci
docker compose up -d --build
npm run dev
```

Abra **http://localhost:5173**. A API fica em **http://localhost:8080/api/pokemons**. O Vite encaminha `/api` ao backend. Na primeira inicialização, o backend carrega automaticamente no MongoDB os 151 Pokémon, 18 tipos e 12 treinadores do SQL. Aguarde a inicialização; se necessário, clique em **Tentar novamente**.

Para encerrar os contêineres, use `docker compose stop`. Os dados ficam no volume `pokedex-mongo` e sobrevivem a reinícios. Não remova o volume se quiser preservar alterações.

## Backend com Java e Maven

Requisitos: JDK 17+ e Maven 3.9+. Para executar apenas o MongoDB pelo Docker:

```powershell
docker compose up -d mongodb
mvn -f backend/pom.xml spring-boot:run
```

Em outro terminal, na raiz:

```powershell
npm ci
npm run dev
```

Não inicie simultaneamente dois backends na porta 8080. Se iniciou o backend pelo Compose, pare-o com `docker compose stop backend` antes de executar pelo Maven.

## MongoDB Atlas

1. Crie um cluster, um usuário de banco e autorize seu IP em Network Access.
2. Copie a URI e informe o banco `pokedex`. Codifique caracteres especiais da senha na URI.
3. Defina a variável no terminal que executará o backend:

```powershell
$env:MONGODB_URI = 'mongodb+srv://USUARIO:SENHA@SEU-CLUSTER/pokedex?retryWrites=true&w=majority'
mvn -f backend/pom.xml spring-boot:run
```

A URI acima é um exemplo. Não publique credenciais. Arquivos `.env*` são ignorados, exceto exemplos sem segredos. Spring Boot usa variáveis do ambiente; ele **não carrega automaticamente** `backend/.env`. Para Atlas, não é necessário iniciar o MongoDB local nem o Compose.

Configurações opcionais do backend: `PORT` (8080), `CORS_ORIGINS` (http://localhost:5173,http://127.0.0.1:5173) e `SEED_ENABLED` (true). No frontend, `VITE_API_URL` usa `/api` por padrão; configure uma URL absoluta se publicar frontend e backend em domínios diferentes. Em produção, configure o encaminhamento de `/api` no servidor ou essa variável durante o build.

## Origem e modelagem dos dados

```text
database/seed/Script_Pokedex.sql → conversor Node.js → carga inicial Spring Boot → MongoDB → API REST → React
```

O frontend não importa JSON de dados nem usa uma cópia local se a API falhar. `backend/src/main/resources/seed/pokedex.json` é somente uma carga inicial gerada do SQL, empacotada com o backend. Para regenerá-la após alterar o SQL:

```powershell
npm run seed:generate
```

Não é necessário MySQL. As coleções são `pokemons`, `types`, `trainers` e `seed_history`. Cada Pokémon tem ID numérico, nome, objeto `stats` e tipos incorporados. Treinadores têm insígnias e IDs dos Pokémon da equipe. A carga preserva as repetições das equipes de Koga e Lance, o apóstrofo de Farfetch'd e a ausência de relacionamento de tipo para Mew no SQL. Não acrescenta dados de outra fonte.

O marcador `sql-v1` em `seed_history` impede que edições ou exclusões sejam desfeitas ao reiniciar. Regenerar a carga não altera um banco já inicializado. Use um banco novo para testar novamente a carga original. Excluir um Pokémon remove todas as suas ocorrências nas equipes.

## API

| Método | Endpoint | Resultado |
|---|---|---|
| GET | /api/pokemons | Lista; filtros opcionais `?name=pika&type=5` |
| GET | /api/pokemons/{id} | Consulta detalhes por ID |
| POST | /api/pokemons | Cria, retorna 201 e Location |
| PUT | /api/pokemons/{id} | Atualiza um registro existente |
| DELETE | /api/pokemons/{id} | Exclui, retorna 204 |
| GET | /api/types | Lista tipos persistidos |
| GET | /api/trainers | Lista treinadores e equipes persistidos |

Corpo de POST e PUT (o ID do PUT deve ser o mesmo da URL):

```json
{
  "id": 152,
  "name": "Chikorita",
  "stats": {
    "hp": 45,
    "attack": 49,
    "defense": 65,
    "specialAttack": 49,
    "specialDefense": 65,
    "speed": 45
  },
  "typeIds": [4]
}
```

IDs positivos, nome obrigatório (até 80 caracteres), seis atributos inteiros de 0 a 999 e até dois tipos existentes e distintos. `typeIds: []` permite representar tipo não informado. Respostas incluem `types: [{"id":4,"name":"Grass"}]`. Erros usam `{"message":"..."}`: 400 para dados inválidos, 404 para Pokémon ausente e 409 para ID duplicado.

Exemplo de consulta no PowerShell:

```powershell
Invoke-RestMethod http://localhost:8080/api/pokemons/25
Invoke-RestMethod 'http://localhost:8080/api/pokemons?name=pika&type=5'
```

Os mesmos endpoints podem ser exercitados no Postman, Insomnia ou Thunder Client. Na interface, use **Cadastrar Pokémon**, **Editar** e **Excluir** abaixo das cartas. A exclusão pede confirmação; erros preservam o formulário preenchido. Virar uma carta consulta o endpoint de detalhes.

## Validação

```powershell
npm run lint
npm test
npm run build
npm run test:e2e
mvn -f backend/pom.xml test
```

Os testes do navegador usam Microsoft Edge instalado (configuração em `playwright.config.js`), iniciam o Vite e simulam respostas HTTP para testar interface e erros independentemente do banco. Os testes Java verificam o contrato HTTP, validações e regras do serviço. Para testar a persistência real com MongoDB e API em execução:

```powershell
npm run test:api
```

Esse teste cria um Pokémon temporário com ID livre, consulta, edita e exclui somente esse registro. Execute contra um banco de desenvolvimento.

## Problemas de execução

### Porta 8080 ocupada ao iniciar o Docker

Se o build terminar, mas o contêiner falhar com `ports are not available` ou `bind`, confira se o backend está rodando por Java ou Maven em outro terminal. Encerre essa execução com **Ctrl+C** e tente novamente:

```powershell
docker compose up -d --build
docker compose ps
```

O backend deve ser executado por apenas uma das opções: Docker ou Java/Maven. No PowerShell, é possível identificar quem ocupa a porta sem encerrar processos automaticamente:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object LocalPort, OwningProcess
```

### Vite não reconhecido ou erro EPERM no esbuild

Se `npm run build` informar que `vite` não é reconhecido, as dependências de desenvolvimento podem estar ausentes ou a instalação ter sido interrompida. Antes de reinstalar, encerre o frontend com **Ctrl+C** em todos os terminais deste projeto. Um Vite em execução pode manter `esbuild.exe` bloqueado no Windows e causar `EPERM: operation not permitted, unlink`. Depois execute:

```powershell
npm ci --include=dev
npm run build
npm run dev
```

## Entrega

Entregar o link deste repositório no Canvas pelos dois integrantes da dupla. O desenvolvimento deve seguir a orientação de Pair Programming da atividade. Configure e execute a aplicação com MongoDB local ou Atlas antes da apresentação.
