import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';
import { users } from '../../../db/schema/user';
import { taskApplications } from '../../../db/schema/task-applications';

const getUserById = async (_: unknown, { id }: { id: string }) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const UserTasks = await db
      .select()
      .from(taskApplications)
      .where(eq(taskApplications.helperId, id));

    if (user.length === 0) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }

    return { user: user[0], taskApplications: UserTasks };
  } catch (err) {
    return Catch_Error(err);
  }
};

export { getUserById };
