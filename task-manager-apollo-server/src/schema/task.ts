export const taskTypeDefs = `#graphql 
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