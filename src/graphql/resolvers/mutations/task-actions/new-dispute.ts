import { Request } from 'express';
import Catch_Error from '../../../../utils/GraphqlError';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../../db/client';
import { eq } from 'drizzle-orm';
import { tasks, users } from '../../../../db/schema';

const newDispute = async (
  _: unknown,
  { taskId, reason }: { taskId: string; reason: string },
  { req }: { req: Request }
) => {
  try {
    if (!reason?.trim()) throw new Error('Шалтгаан оруулна уу!');
    if (!process.env.JWT_SECRET)
      throw new Error('Серверийн тохиргоо дутуу байна.');

    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');

    const { id: userId } = verify(token, process.env.JWT_SECRET) as {
      id: string;
    };

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
        posterDisputed: true,
        helperDisputed: true,
        status: true,
        completedAt: true,
      },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');

    const whoIsDisputing =
      task.posterId === user.id
        ? 'poster'
        : task.assignedTo === user.id
          ? 'helper'
          : 'no';
    if (whoIsDisputing === 'no') throw new Error('Танд эрх алга');

    if (task.status === 'cancelled') {
      throw new Error('Цуцлагдсан даалгаварт маргаан үүсгэх боломжгүй.');
    }
    if (task.status === 'overdue') {
      throw new Error('Хугацаа хэтэрсэн даалгаварт маргаан үүсгэх боломжгүй.');
    }
    if (task.status === 'completed') {
      throw new Error('Дууссан даалгаварт маргаан үүсгэх боломжгүй!');
    }

    if (whoIsDisputing === 'poster' && task.posterDisputed) {
      throw new Error('Та өмнө нь маргаан үүсгэсэн байна.');
    }
    if (whoIsDisputing === 'helper' && task.helperDisputed) {
      throw new Error('Та өмнө нь маргаан үүсгэсэн байна.');
    }

    if (whoIsDisputing === 'helper') {
      const updated = await db
        .update(tasks)
        .set({
          disputeReason2: reason.trim(),
          helperDisputed: true,
          status: 'disputed',
        })
        .where(eq(tasks.id, taskId))
        .returning({ id: tasks.id });
      if (updated.length === 0) throw new Error('Алдаа гарлаа');
    } else {
      const updated = await db
        .update(tasks)
        .set({
          disputeReason1: reason.trim(),
          posterDisputed: true,
          status: 'disputed',
        })
        .where(eq(tasks.id, taskId))
        .returning({ id: tasks.id });
      if (updated.length === 0) throw new Error('Алдаа гарлаа');
    }

    return true;
  } catch (er) {
    return Catch_Error(er);
  }
};

export { newDispute };
