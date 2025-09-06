import { Request } from 'express';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import jwt from 'jsonwebtoken';
import Catch_Error from '../../../../utils/GraphqlError';
import { db } from '../../../../db/client';
import { and, eq } from 'drizzle-orm';
import { tasks } from '../../../../db/schema';

export const helperStartTask = async (
  _: unknown,
  { taskId }: { taskId: string },
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('No Env');
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: { id: true, status: true, assignedTo: true },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');
    if (task.assignedTo !== userId)
      throw new Error('Энэ ажлыг эхлүүлэх эрхгүй.');
    if (task.status !== 'assigned')
      throw new Error('Зөвхөн хуваарилагдсан ажлыг эхлүүлнэ.');

    const now = new Date();
    const updated = await db
      .update(tasks)
      .set({ status: 'in_progress', startedAt: now, updatedAt: now })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.status, 'assigned'),
          eq(tasks.assignedTo, userId)
        )
      )
      .returning({ id: tasks.id });

    if (updated.length === 0)
      throw new Error('Төлөв өөрчлөгдсөн байж магадгүй. Дахин оролдоно уу.');
    return true;
  } catch (err) {
    return Catch_Error(err);
  }
};
