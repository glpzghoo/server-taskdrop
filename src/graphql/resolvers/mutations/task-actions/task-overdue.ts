import { Request } from 'express';
import Catch_Error from '../../../../utils/GraphqlError';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../../db/client';
import { and, eq, inArray, lt, not } from 'drizzle-orm';
import { tasks, users } from '../../../../db/schema';

const changeToOverdue = async (
  _: unknown,
  { taskId }: { taskId: string },
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET)
      throw new Error('Серверийн тохиргоо дутуу байна.');
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Нэвтрээгүй байна.');

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
      columns: {
        id: true,
        posterId: true,
        status: true,
        dueDate: true,
      },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');
    if (task.posterId !== user.id)
      throw new Error('Танд энэ төлөв рүү өөрчлөх эрх алга!');
    if (!task.dueDate) throw new Error('Дуусах хугацаа тохируулаагүй байна.');

    const blocked = ['completed', 'cancelled', 'disputed', 'overdue'] as const;
    if ((blocked as readonly string[]).includes(task.status)) {
      if (task.status === 'completed')
        throw new Error('Даалгавар аль хэдийн дууссан байна!');
      if (task.status === 'cancelled')
        throw new Error('Даалгавар цуцлагдсан байна!');
      if (task.status === 'disputed')
        throw new Error('Маргааныг эхлээд шийдвэрлэнэ үү!');
      if (task.status === 'overdue')
        throw new Error('Аль хэдийн хугацаа хэтэрсэн төлөвтэй байна!');
    }

    const now = new Date();
    if (task.dueDate > now) {
      throw new Error('Хугацаа хараахан дуусаагүй байна.');
    }

    const updated = await db
      .update(tasks)
      .set({ status: 'overdue', updatedAt: now })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.posterId, user.id),
          not(inArray(tasks.status, blocked)),
          lt(tasks.dueDate, now)
        )
      )
      .returning({ id: tasks.id, status: tasks.status });

    if (updated.length === 0) {
      throw new Error('Төлөв өөрчлөгдсөн байж магадгүй. Дахин ачаална уу.');
    }

    return true;
  } catch (err) {
    return Catch_Error(err);
  }
};

export { changeToOverdue };
