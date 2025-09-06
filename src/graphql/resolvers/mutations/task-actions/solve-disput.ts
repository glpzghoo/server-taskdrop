import { Request } from 'express';
import Catch_Error from '../../../../utils/GraphqlError';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../../db/client';
import { eq } from 'drizzle-orm';
import { tasks, users } from '../../../../db/schema';

const solveDispute = async (
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
      columns: {
        id: true,
        posterId: true,
        assignedTo: true,
        status: true,
        posterDisputed: true,
        helperDisputed: true,
      },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');

    const isPoster = task.posterId === userId;
    const isHelper = task.assignedTo === userId;
    if (!isPoster && !isHelper) throw new Error('Эрхгүй');

    if (task.status !== 'disputed') {
      throw new Error('Энэ даалгаварт маргаан алга.');
    }

    const clearFields = isPoster
      ? { disputeReason1: null, posterDisputed: false }
      : { disputeReason2: null, helperDisputed: false };

    await db.transaction(async (tx) => {
      const after = await tx
        .update(tasks)
        .set(clearFields)
        .where(eq(tasks.id, taskId))
        .returning({
          id: tasks.id,
          status: tasks.status,
          posterDisputed: tasks.posterDisputed,
          helperDisputed: tasks.helperDisputed,
        });

      if (after.length === 0) throw new Error('Алдаа гарлаа');
      const row = after[0];

      if (!row.posterDisputed && !row.helperDisputed) {
        await tx
          .update(tasks)
          .set({ status: 'in_progress' })
          .where(eq(tasks.id, taskId));
      }
    });

    return true;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { solveDispute };
