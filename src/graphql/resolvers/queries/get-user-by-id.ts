import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';
import { taskApplications, tasks, users } from '../../../db/schema';

const getUserById = async (_: unknown, { id }: { id: string }) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        postedTasks: {
          orderBy: desc(tasks.createdAt),
        },
        taskApplications: {
          orderBy: desc(taskApplications.appliedAt),
        },
      },
    });

    if (!user) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }

    return user;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { getUserById };
