import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';
import { taskApplications } from '../../../db/schema/task-applications';
import { users } from '../../../db/schema';

const getUserById = async (_: unknown, { id }: { id: string }) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        postedTasks: true,
      },
    });
    const UserTasks = await db
      .select()
      .from(taskApplications)
      .where(eq(taskApplications.helperId, id));
    if (!user) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }

    return { user, taskApplications: UserTasks };
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { getUserById };
