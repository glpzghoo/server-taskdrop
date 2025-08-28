/* eslint-disable no-empty-pattern */
import { Request } from 'express';
import Catch_Error from '../../../utils/GraphqlError';
import { ExtractCookie } from '../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../db/client';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema';

const dashboard = async (_: unknown, {}, { req }: { req: Request }) => {
  try {
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Хэрэглэгч нэвтрээгүй байна!');

    const verified = verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await db.query.users.findFirst({
      where: eq(users.id, verified.id),
      with: {
        assignedTasks: true,
      },
    });
    if (!user) throw new Error('Хэрэглэгч олдсонгүй!');

    const fullname = `${user.firstName}, ${user.lastName}`;
    const response = {
      taskCompleted: user.tasksCompleted,
      totalEarned: user.totalEarned,
      ...(user.isHelper
        ? { avgRating: user.helperRating }
        : { avgRating: user.posterRating }),
      responseTime: user.responseTime,
      assignedTasks: user.assignedTasks,
      isAvailable: user.availableNow,
      fullname,
      isHelper: user.isHelper,
      isPoster: user.isTaskPoster,
    };

    return response;
  } catch (err) {
    return Catch_Error(err);
  }
};

export { dashboard };
