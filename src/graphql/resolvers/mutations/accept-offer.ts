import { Request } from 'express';
import { ExtractCookie } from '../../../utils/extract-cookie';
import jwt from 'jsonwebtoken';
import Catch_Error from '../../../utils/GraphqlError';
import { db } from '../../../db/client';
import { eq } from 'drizzle-orm';
import { taskApplications, tasks, users } from '../../../db/schema';

const AcceptOffer = async (
  _: unknown,
  { TaskApplicationId }: { TaskApplicationId: string },
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('No Env');

    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');

    const verified = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };

    const apps = await db
      .select()
      .from(taskApplications)
      .where(eq(taskApplications.id, TaskApplicationId));

    if (apps.length === 0) throw new Error('Даалгаврын өргөдөл олдсонгүй!');
    const application = apps[0];

    const tasksRes = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, application.taskId));

    if (tasksRes.length === 0) throw new Error('Даалгавар олдсонгүй!');
    const task = tasksRes[0];

    const helpers = await db
      .select()
      .from(users)
      .where(eq(users.id, application.helperId));
    if (helpers.length === 0) throw new Error('Туслагч олдсонгүй!');
    const helper = helpers[0];

    const posters = await db
      .select()
      .from(users)
      .where(eq(users.id, task.posterId));
    if (posters.length === 0) throw new Error('Даалгавар тавигч олдсонгүй!');
    const poster = posters[0];

    if (task.posterId === application.helperId) {
      throw new Error('Та өөрийн даалгавартаа өргөдөл илгээж болохгүй!');
    }
    if (task.status === 'completed') {
      throw new Error('Энэ даалгавар аль хэдийн дууссан байна!');
    }
    if (task.status === 'cancelled') {
      throw new Error('Энэ даалгавар цуцлагдсан байна!');
    }
    if (task.dueDate && task.dueDate < new Date() && !task.assignedTo) {
      await Promise.all([
        db
          .update(tasks)
          .set({ status: 'overdue' })
          .where(eq(tasks.id, task.id)),
        db
          .update(taskApplications)
          .set({ status: 'overdue' })
          .where(eq(taskApplications.id, TaskApplicationId)),
      ]);

      throw new Error('Энэ даалгавар хугацаа хэтэрсэн байна!');
    }

    await db.transaction(async (tx) => {
      if (verified.id === poster.id && task.status === 'open') {
        if (task.assignedTo) {
          throw new Error('Энэ даалгавар аль хэдийн хуваарилагдсан байна!');
        }
        if (application.status !== 'pending') {
          throw new Error(
            'Энэ өргөдлийг баталгаажуулах боломжгүй төлөв байна!'
          );
        }

        const now = new Date();
        const diffMs = now.getTime() - application.appliedAt.getTime();
        const respondSeconds = Math.floor(diffMs / 1000);

        await tx.update(users).set({ responseTime: respondSeconds.toString() });

        await tx
          .update(taskApplications)
          .set({ status: 'accepted', respondedAt: now })
          .where(eq(taskApplications.id, TaskApplicationId));
        await tx
          .update(tasks)
          .set({
            status: 'assigned',
            assignedTo: application.helperId,
            startedAt: now,
            helperRating: helper.helperRating?.toString(),
            posterRating: poster.posterRating?.toString(),
          })
          .where(eq(tasks.id, task.id));
        return;
      }

      throw new Error('Энэ үйлдлийг хийх боломжгүй!');
    });

    return true;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { AcceptOffer };
