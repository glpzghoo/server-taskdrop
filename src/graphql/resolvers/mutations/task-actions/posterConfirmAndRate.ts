import { Request } from 'express';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import { db } from '../../../../db/client';
import { tasks } from '../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import Catch_Error from '../../../../utils/GraphqlError';
import { verify } from 'jsonwebtoken';

export const posterConfirmAndRate = async (
  _: unknown,
  {
    taskId,
    ratingGiven,
    feedback,
  }: { taskId: string; ratingGiven: number; feedback?: string },
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('No Env');
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');
    const { id: userId } = verify(token, process.env.JWT_SECRET) as {
      id: string;
    };

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: { id: true, status: true, posterId: true },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');
    if (task.posterId !== userId)
      throw new Error('Зөвхөн захиалагч баталгаажуулна.');
    if (task.status !== 'in_progress')
      throw new Error('Зөвхөн явцтай ажлыг баталгаажуулна.');
    if (ratingGiven == null) throw new Error('Үнэлгээ заавал.');

    const now = new Date();
    const updated = await db
      .update(tasks)
      .set({
        markCompleted1: true,
        posterRating: ratingGiven.toFixed(2),
        posterFeedback: feedback ?? null,
        updatedAt: now,
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.status, 'in_progress'),
          eq(tasks.posterId, userId)
        )
      )
      .returning({ id: tasks.id });

    if (updated.length === 0) throw new Error('Алдаа гарлаа.');
    return true;
  } catch (err) {
    return Catch_Error(err);
  }
};
