/* eslint-disable no-empty-pattern */
import { Request } from 'express';
import { ExtractCookie } from '../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../db/client';
import { eq, or } from 'drizzle-orm';
import { Task, tasks, users } from '../../../db/schema';
import Catch_Error from '../../../utils/GraphqlError';
import { orderBy } from 'lodash';

const getUserTasks = async (_: unknown, {}, { req }: { req: Request }) => {
  try {
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) throw new Error('Ахин нэвтэрнэ үү!');

    const verified = verify(token, process.env.JWT_SECRET!) as { id: string };

    const user = await db.query.users.findFirst({
      where: eq(users.id, verified.id),
      columns: {
        isTaskPoster: true,
        isHelper: true,
      },
    });
    if (!user) throw new Error('Хэрэглэгч олдсонгүй!');
    const isTaskPoster = user.isTaskPoster;
    const isHelper = user.isHelper;

    if (!isHelper && !isTaskPoster)
      throw new Error('Хэрэглэгчийн рол тодорхойгүй!');

    const userTasks = await db.query.tasks.findMany({
      where: or(
        eq(tasks.posterId, verified.id),
        eq(tasks.assignedTo, verified.id)
      ),
      with: {
        poster: true,
        assignee: true,
      },
    });

    const statusOrder: Record<Task['status'], number> = {
      in_progress: 0,
      assigned: 1,
      open: 2,
      disputed: 3,
      overdue: 4,
      cancelled: 5,
      completed: 5,
    };

    const orderedTasks = orderBy(
      userTasks,
      (t) => statusOrder[t.status],
      'asc'
    );

    return orderedTasks;
  } catch (err) {
    return Catch_Error(err);
  }
};

export { getUserTasks };
