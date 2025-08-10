import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';

const getTasks = async () => {
  try {
    const tasksList = await db.query.tasks.findMany({
      with: {
        poster: true,
        category: true,
      },
    });

    return tasksList;
  } catch (er) {
    return Catch_Error(er);
  }
};

export { getTasks };
