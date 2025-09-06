import { Request } from 'express';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import jwt from 'jsonwebtoken';
import Catch_Error from '../../../../utils/GraphqlError';
import { db } from '../../../../db/client';
import { eq } from 'drizzle-orm';
import { tasks, users } from '../../../../db/schema';

const UpdateTaskStatus = async (
  _: unknown,
  { taskId, ratingGiven }: { taskId: string; ratingGiven?: number },
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('No Env');

    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');

    const verified = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };

    const tasksRes = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (tasksRes.length === 0) throw new Error('Даалгавар олдсонгүй!');
    const task = tasksRes[0];

    const helpers = await db
      .select()
      .from(users)
      .where(eq(users.id, task.assignedTo!));
    if (helpers.length === 0) throw new Error('Туслагч олдсонгүй!');
    const helper = helpers[0];

    const posters = await db
      .select()
      .from(users)
      .where(eq(users.id, task.posterId));
    if (posters.length === 0) throw new Error('Даалгавар тавигч олдсонгүй!');
    const poster = posters[0];

    if (task.status === 'completed') {
      throw new Error('Энэ даалгавар аль хэдийн дууссан байна!');
    }
    if (task.status === 'cancelled') {
      throw new Error('Энэ даалгавар цуцлагдсан байна!');
    }

    await db.transaction(async (tx) => {
      if (verified.id === helper.id && task.status === 'assigned') {
        await tx
          .update(tasks)
          .set({ status: 'in_progress' })
          .where(eq(tasks.id, task.id));
        return;
      }

      if (verified.id === helper.id && task.status === 'in_progress') {
        if (ratingGiven == null) {
          throw new Error('Та үнэлгээ өгөх хэрэгтэй!');
        }

        const newCount = helper.helperRatingCount + 1;
        const newRating =
          (parseFloat(helper.helperRating ?? '0') * helper.helperRatingCount +
            ratingGiven) /
          newCount;

        await Promise.all([
          tx
            .update(users)
            .set({
              helperRating: newRating.toFixed(2),
              helperRatingCount: newCount,
              tasksCompleted: helper.tasksCompleted + 1,
              totalEarned:
                helper.totalEarned + task.paymentAmount + task.urgencyFee,
            })
            .where(eq(users.id, helper.id)),
          tx
            .update(users)
            .set({
              totalSpent:
                poster.totalSpent + task.paymentAmount + task.urgencyFee,
            })
            .where(eq(users.id, poster.id)),
        ]);

        await tx
          .update(tasks)
          .set({ status: 'completed', completedAt: new Date() })
          .where(eq(tasks.id, task.id));
        return;
      }

      throw new Error('Та энэ үйлдлийг хийх эрхгүй эсвэл буруу төлөв байна!');
    });

    return true;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { UpdateTaskStatus };
