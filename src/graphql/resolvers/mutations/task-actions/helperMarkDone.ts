import { Request } from 'express';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import { db } from '../../../../db/client';
import { tasks } from '../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { verify } from 'jsonwebtoken';
import Catch_Error from '../../../../utils/GraphqlError';

export const helperMarkDone = async (
  _: unknown,
  {
    taskId,
    feedback,
    ratingGiven,
  }: { taskId: string; feedback?: string; ratingGiven?: number },
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
      columns: { id: true, status: true, assignedTo: true },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');
    if (task.assignedTo !== userId)
      throw new Error('Энэ ажлыг дууссанд тооцох эрхгүй.');
    if (task.status !== 'in_progress')
      throw new Error('Зөвхөн явцтай ажлыг дууссанд тооцож болно.');

    const now = new Date();
    const updated = await db
      .update(tasks)
      .set({
        markCompleted2: true,
        helperFeedback: feedback ?? null,
        helperRating: ratingGiven != null ? ratingGiven.toFixed(2) : null,
        updatedAt: now,
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.status, 'in_progress'),
          eq(tasks.assignedTo, userId)
        )
      )
      .returning({ id: tasks.id });

    if (updated.length === 0) throw new Error('Алдаа гарлаа.');
    return true;
  } catch (err) {
    return Catch_Error(err);
  }
};
