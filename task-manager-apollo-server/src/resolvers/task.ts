import tasks from "../data/tasks";

const taskResolvers = {
  Query: {
    tasks: () => tasks,
  },
};

export default taskResolvers;
