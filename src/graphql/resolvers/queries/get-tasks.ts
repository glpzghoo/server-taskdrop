import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';
const order = {
  open: 1,
  assigned: 2,
  in_progress: 3,
  completed: 4,
  cancelled: 5,
  disputed: 6,
  overdue: 7,
};
const getTasks = async () => {
  try {
    const tasksList = await db.query.tasks.findMany({
      with: {
        poster: true,
        category: true,
      },
    });

    const sortedTasks = tasksList.sort((a, b) => {
      return order[a.status] - order[b.status];
    });

    return sortedTasks;
  } catch (er) {
    return Catch_Error(er);
  }
};

export { getTasks };
