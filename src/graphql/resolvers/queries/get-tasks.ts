import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { tasks } from '../../../db/schema';
import Catch_Error from '../../../utils/GraphqlError';

const getTasks = async () => {
  try {
    const tasksList = await db.query.tasks.findMany({
      where: eq(tasks.status, 'open'),
      with: {
        poster: true,
        category: true,
      },
      orderBy: [desc(tasks.createdAt)],
    });

    return tasksList;
  } catch (er) {
    return Catch_Error(er);
  }
};

export { getTasks };
