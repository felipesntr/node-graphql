## Capítulo 1: Uma breve introdução ao GraphQL

O desenvolvimento do GraphQL teve início em 2012 pela empresa Meta e foi lançado em 2015. Em 2018, a GraphQL Foundation foi criada e passou a ser hospedada pela Linux Foundation.

O GraphQL é uma tecnologia que fornece uma API para a web, onde os clientes definem a estrutura de dados que desejam receber do servidor. Isso ajuda a evitar o envio de muitos dados desnecessários na resposta.

O GraphQL é composto por um sistema de tipos, uma linguagem de consulta, execução semântica, validação estática e introspecção de tipos. Ele suporta operações de leitura, escrita (mutação) e assinaturas para atualizações em tempo real. Servidores GraphQL estão disponíveis para várias linguagens e o resultado de uma consulta é retornado no formato JSON.

Nesse artigo vamos aprender a utilizar o GraphQL, no NodeJS com Apollo Server, construindo uma simples API que busca uma lista de tarefas.

## Capítulo 2: Preparação - Configurando o ambiente de desenvolvimento

Neste capítulo, vou ajudar a preparar o ambiente para que possamos iniciar o projeto, seguindo a documentação do Apollo Server.

### ****Etapa 1: Criando um novo projeto Node.js****

Vamos começar criando uma pasta para o projeto. No meu caso, será `mkdir task-manager-apollo-server`e, em seguida, `cd task-manager-apollo-server` para entrar na pasta. Para iniciar um novo projeto Node.js, utilize o comando `npm init --yes && npm pkg set type="module"`. 

### ****Etapa 2: Instalando as dependências****

Nossa aplicação terá, inicialmente, as seguintes dependências:

- graphql (graphql-js), a biblioteca que implementa o core do GraphQL.
- @apollo/server, é a biblioteca principal do Apollo Server em si. Ele vai lidar com a tarefa de transformar respostas e requisições HTTP em operações GraphQL e executá-las.

Para instalar essas dependências, basta utilizar o seguinte comando:

Além disso, é recomendado pela documentação a configuração do TypeScript no projeto. Para fazer isso, utilize o comando `npm install --save-dev typescript @types/node`e, depois, crie um arquivo `tsconfig.json`na raiz do projeto e adicione o seguinte código:

```jsx
{
  "compilerOptions": {
    "rootDirs": ["src"],
    "outDir": "dist",
    "lib": ["es2020"],
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "types": ["node"]
  }
}
```

Adicione os scripts abaixo ao package.json, pois serão necessários para compilar os códigos TypeScript e rodá-los usando o comando **`npm start`.**

```jsx
{
  // ...etc.
  "type": "module",
  "scripts": {
    "compile": "tsc",
    "start": "npm run compile && node ./dist/index.js"
  }
  // ...outras configurações
}
```

Por fim, crie o arquivo index.ts na pasta src. Dessa forma, podemos começar a escrever códigos TypeScript e utilizar as funções do @apollo/server.

## **Capítulo 3: Criando o servidor GraphQL**

Com o ambiente devidamente configurado, é hora de começar a construir nossa aplicação. Neste capítulo, vamos definir os esquemas do projeto. Como se trata de um gerenciador de tarefas simples, teremos apenas o esquema de tarefa, mas você pode avançar e criar tudo o que falta relacionado aos usuários.

### Etapa 1: Definindo o schema da tarefa

A especificação do GraphQL define uma linguagem de fácil entendimento, chamada schema definition language (SDL), que usamos para definir nossos esquemas e salvá-los como uma string. Nesta etapa, devemos criar uma pasta chamada “schema” dentro da pasta “src”. Nessa pasta, podemos adicionar nossos esquemas. Neste caso, criaremos o arquivo “task.ts” e nele escreveremos o esquema da “tarefa” da seguinte maneira:

```jsx
const taskTypeDefs = `#graphql 
  type Task {
    id: ID
    title: String
    description: String
    status: String
    created_at: String
    updated_at: String
  }
`;

export default taskTypeDefs;
```

Como vocês podem ver, estamos definindo os tipos dos campos como fazemos naturalmente. Eu utilizei os tipos ID e String, mas vocês podem utilizar vários outros que são suportados pela linguagem.

Em seguida, vou definir o tipo “Query”. Esse é um tipo especial que define todas as buscas que podem ser executadas pelos clientes. Neste caso, teremos somente a query das “tasks”.

```jsx
const taskTypeDefs = `#graphql 
  type Task {
    id: ID
    title: String
    description: String
    status: String
    created_at: String
    updated_at: String
  }

  type Query {
    tasks: [Task]
  }
`;

export default taskTypeDefs;
```

## Etapa 2: Criando um conjunto de dados em memória para testes

Essa é uma etapa bem simples, vamos definir alguns dados para simular o retorno de um banco de dados. Você pode avançar o projeto e integrar com algum banco de dados de sua preferência para tornar a aplicação mais próxima da realidade.

Vou criar uma pequena lista de tarefas dentro de um arquivo src/data/tasks.ts:

```jsx
const tasks = [
	{
		id: "7815696ecbf1c96e6894b779456d330e", 
		title: "Criar um projeto usando Node.js e GraphQL",
		description: "Conseguir concluir graças a esse artigo!",
		status: "Done",
		created_at: "2023-04-14",
		updated_at: "2023-04-14"
	},
	{
		id: "e2a521bc01c1ca09e173bcf65bcc97e9", 
		title: "Adicionar MongoDB ao meu projeto Node.js + GraphQL",
		description: "Uma tarefa recomendada para trabalho futuro!",
		status: "To-Do",
		created_at: "2023-04-14",
		updated_at: "2023-04-14"
	},
]

export default tasks;
```

### ****Etapa 3: Criando os resolvers da tarefa****

Em GraphQL, um resolver é uma função que é responsável por buscar e retornar os dados solicitados em uma consulta ou mutação. Os resolvers são definidos para cada campo do “schema” GraphQL e eles sabem como obter os dados para esse campo. Ou seja, o resolver dependendo do campo vai trazer o dado ou realizar a mutação de uma maneira que vamos determinar. Eles dizem ao Apollo Server como realizar o “fetch” desses dados.

Para os resolvers da tarefa, vamos criar um arquivo TypeScript chamado “task.resolver.ts” dentro da pasta “src/resolvers”.

```jsx
import tasks from "../data/tasks";

const taskResolvers = {
  Query: {
    tasks: () => tasks,
  },
};

export default taskResolvers;
```

Dessa forma, quando realizarmos a query “tasks”, nossa interface irá trazer a pequena lista de tarefas que foi definida anteriormente.

Para criar e executar o Apollo Server, basta criar uma instância do ApolloServer disponível em @apollo/server e passar um objeto com os “typeDefs” e “resolvers”. Para executar, podemos usar o startStandaloneServer disponível em @apollo/server/standalone e passar o server e a configuração da porta. Segue como o meu código ficou:

```jsx
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import taskTypeDefs from "./schema/task";
import taskResolvers from "./resolvers/task";

const server = new ApolloServer({
  typeDefs: [taskTypeDefs],
  resolvers: [taskResolvers],
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
```

E por fim, para rodar de fato nossa API, basta executar o comando "npm start" que configuramos no início. Será exibida a mensagem 🚀 "Server ready at: [http://localhost:4000/](http://localhost:4000/)", e poderemos acessar a interface do Apollo no navegador, abrindo o link [http://localhost:4000/](http://localhost:4000/).

## Capítulo 6: Criando nossas consultas GraphQL

Por fim, com a interface do Apollo aberta, podemos realizar as consultas. Na consulta que fiz abaixo, escolhi trazer somente os campos title, description e status de uma tarefa.

Um dos conceitos mais importantes do GraphQL é que podemos escolher consultar somente os campos que precisamos no momento. Você pode editar a consulta e trazer somente o title ou somente description e executar novamente para ver o resultado.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/871e1558-57cc-49b3-b349-0385aea5bf94/Untitled.png)

## Capítulo 8: Conclusão

Neste artigo, aprendemos como criar um servidor GraphQL simples usando o Apollo Server. Passamos por todas as etapas necessárias, desde a preparação do ambiente até a implementação de resolvers e a execução do servidor. Definimos um schema usando uma das maneiras disponíveis e criamos um conjunto de dados em memória para testes. Com isso, podemos desenvolver APIs e aprofundar ainda mais, adicionando funcionalidades sofisticadas, como integrar um banco de dados e, por fim, fazer o deploy da aplicação em um servidor. Espero que este artigo tenha sido útil e que você possa desenvolver suas aplicações com NodeJS e GraphQL!
