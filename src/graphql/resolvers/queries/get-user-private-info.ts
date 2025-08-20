import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';
import { taskApplications, tasks, users } from '../../../db/schema';
import { Request } from 'express';
import { ExtractCookie } from '../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';

const getUserPrivateInfoById = async (
  _: unknown,
  { id }: { id: string },
  { req }: { req: Request }
) => {
  try {
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) {
      throw new Error('Хэрэглэгч нэвтрээгүй байна.');
    }
    const verified = verify(token, process.env.JWT_SECRET!) as { id: string };
    if (!verified) {
      throw new Error('Хэрэглэгчийн токен баталгаажсангүй.');
    }
    if (id !== verified.id) {
      throw new Error('nope');
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, verified.id),
      with: {
        postedTasks: {
          orderBy: desc(tasks.createdAt),
        },
        taskApplications: {
          orderBy: desc(taskApplications.appliedAt),
          with: {
            task: {
              with: {
                poster: true,
              },
            },
            helper: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }

    return user;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { getUserPrivateInfoById };
