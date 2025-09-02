import { Request } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../../../db/client';
import { taskApplications, tasks } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import Catch_Error from '../../../utils/GraphqlError';
import { ExtractCookie } from '../../../utils/extract-cookie';

const InputSchema = z.object({
  taskId: z.string().min(1, 'Даалгаврын ID дутуу байна'),
  message: z.string().min(1, 'Зурвас шаардлагатай').max(2000, 'Хэт урт зурвас'),
  proposedStartTime: z.string(),
});

type Args = z.infer<typeof InputSchema>;

export const newTaskApplication = async (
  _: unknown,
  args: Args,
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET тохируулаагүй байна');
    }

    const token = ExtractCookie(req, 'AccessToken');
    if (!token) {
      throw new Error('Хэрэглэгч нэвтрээгүй байна!');
    }

    let userId: string;
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET) as {
        id: string;
      };
      userId = verified.id;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new Error('Нэвтрэх эрхийн хугацаа дууссан. Дахин нэвтэрнэ үү.');
      }
      if (err instanceof JsonWebTokenError) {
        throw new Error('Нэвтрэх эрх хүчингүй.');
      }
      throw err;
    }

    const { taskId, message, proposedStartTime } = InputSchema.parse(args);

    const proposed = new Date(proposedStartTime);
    if (Number.isNaN(proposed.getTime())) {
      throw new Error('Цаг хугацааны формат буруу байна');
    }
    const now = new Date();
    if (proposed.getTime() < now.getTime()) {
      throw new Error('Эхлэх цаг ирээдүйд байх ёстой');
    }

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    if (!task) {
      throw new Error('Даалгавар олдсонгүй!');
    }
    if (task.posterId && task.posterId === userId) {
      throw new Error('Өөрийн даалгаварт өөрөө хүсэлт илгээж болохгүй.');
    }
    if (task.status && task.status !== 'open') {
      throw new Error('Энэ даалгавар одоогоор хүсэлт авахгүй байна.');
    }
    if (task.dueDate && new Date(task.dueDate).getTime() < now.getTime()) {
      throw new Error('Даалгаврын хугацаа дууссан байна.');
    }

    const AllApplications = await db
      .select()
      .from(taskApplications)
      .where(eq(taskApplications.taskId, taskId))
      .limit(10);

    if (AllApplications.length >= (task.maxApplications ?? 0)) {
      throw new Error('Хүсэлтийн хязгаар хүрсэн байна.');
    }
    const inserted = await db
      .insert(taskApplications)
      .values({
        helperId: userId,
        taskId: task.id,
        message,
        proposedStartTime: proposed,
        appliedAt: now,
        posterId: task.posterId,
      })
      .onConflictDoNothing({
        target: [taskApplications.helperId, taskApplications.taskId],
      })
      .returning();

    if (inserted.length === 0) {
      throw new Error('Та энэ даалгаварт аль хэдийн хүсэлт илгээсэн байна.');
    }

    return inserted[0];
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};
