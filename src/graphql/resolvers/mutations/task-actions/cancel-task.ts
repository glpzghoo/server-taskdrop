import { Request } from 'express';
import Catch_Error from '../../../../utils/GraphqlError';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../../db/client';
import { and, eq, inArray, not } from 'drizzle-orm';
import { tasks, users } from '../../../../db/schema';

type TaskStatus = (typeof tasks.$inferSelect)['status'];

const cancelTask = async (
  _: unknown,
  { taskId }: { taskId: string },
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET)
      throw new Error('Серверийн тохиргоо дутуу байна.');
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');

    let userId: string;
    try {
      ({ id: userId } = verify(token, process.env.JWT_SECRET) as {
        id: string;
      });
    } catch {
      throw new Error('Токен хүчингүй байна.');
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });
    if (!user) throw new Error('Хэрэглэгч олдсонгүй!');

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: { id: true, posterId: true, status: true },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');
    if (task.posterId !== user.id)
      throw new Error('Танд энэ төлөв рүү өөрчлөх эрх алга!');

    const blocked = [
      'completed',
      'cancelled',
      'disputed',
      'overdue',
    ] as const satisfies readonly TaskStatus[];

    if ((blocked as readonly TaskStatus[]).includes(task.status)) {
      if (task.status === 'completed')
        throw new Error('Даалгавар аль хэдийн дууссан байна!');
      if (task.status === 'cancelled')
        throw new Error('Даалгавар цуцлагдсан байна!');
      if (task.status === 'disputed')
        throw new Error('Маргааныг эхлээд шийдвэрлэнэ үү!');
      if (task.status === 'overdue')
        throw new Error('Хугацаа хэтэрсэн төлөвтэй байна!');
    }

    const now = new Date();

    const updated = await db
      .update(tasks)
      .set({ status: 'cancelled', updatedAt: now })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.posterId, user.id),
          not(inArray(tasks.status, blocked))
        )
      )
      .returning({ id: tasks.id });

    if (updated.length === 0) {
      throw new Error('Төлөв өөрчлөгдсөн байж магадгүй. Дахин ачаална уу.');
    }

    return true;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { cancelTask };
