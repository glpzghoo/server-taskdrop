import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { tasks } from '../../../db/schema';
import Catch_Error from '../../../utils/GraphqlError';

export const getTaskById = (_: unknown, { id }: { id: string }) => {
  try {
    const task = db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        poster: true,
        category: true,
        applications: {
          with: {
            helper: true,
          },
        },
      },
    });
    if (!task) {
      throw new Error('Даалгавар олдсонгүй!');
    }
    return task;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};
