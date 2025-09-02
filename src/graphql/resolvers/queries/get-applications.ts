import { Request } from 'express';
import { ExtractCookie } from '../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../db/client';
import { eq } from 'drizzle-orm';
import { taskApplications, tasks } from '../../../db/schema';

const getApplications = async (
  _: unknown,
  { taskId }: { taskId: string },
  { req }: { req: Request }
) => {
  const token = ExtractCookie(req, 'AccessToken');
  if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');
  const verified = verify(token, process.env.JWT_SECRET!) as { id: string };
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) {
    throw new Error('Даалгавар олдсонгүй!');
  }

  if (task.posterId !== verified.id) {
    throw new Error('Таны даалгавар биш байна!');
  }

  const applications = await db.query.taskApplications.findMany({
    where: eq(taskApplications.taskId, taskId),
    with: {
      helper: true,
    },
  });

  return applications;
};

export { getApplications };
