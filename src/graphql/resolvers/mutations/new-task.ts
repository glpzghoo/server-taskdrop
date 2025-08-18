import { Request } from 'express';
import { ExtractCookie } from '../../../utils/extract-cookie';
import { verify } from 'jsonwebtoken';
import { db } from '../../../db/client';
import { eq } from 'drizzle-orm';
import Catch_Error from '../../../utils/GraphqlError';
import { users } from '../../../db/schema/user';
import { tasks } from '../../../db/schema/tasks';

const NewTask = async (
  _: unknown,
  {
    title,
    description,
    type,
    duration,
    estimatedCost,
    location,
    isRemote,
    isUrgent,
    requirements,
    urgencyFee,
  }: {
    title: string;
    description: string;
    type: string;
    duration: string;
    estimatedCost: number;
    location: string;
    isRemote: boolean;
    isUrgent: boolean;
    requirements: string;
    urgencyFee: number;
  },
  { req }: { req: Request }
) => {
  try {
    if (
      !title.trim() ||
      !description.trim() ||
      !type ||
      estimatedCost === undefined ||
      location === undefined ||
      isRemote === undefined ||
      isUrgent === undefined
    ) {
      throw new Error('Бүх талбарыг бөглөх шаардлагатай!');
    }

    const token = ExtractCookie(req, 'AccessToken');
    if (!token) {
      throw new Error('Хэрэглэгч нэвтрээгүй байна!');
    }
    const verified = verify(token, process.env.JWT_SECRET!) as { id: string };

    const getUser = await db
      .select()
      .from(users)
      .where(eq(users.id, verified.id))
      .limit(1);

    if (getUser.length === 0) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }
    const user = getUser[0];

    if (!user.isTaskPoster) {
      throw new Error(
        'Та даалгавар байршуулах боломжгүй. Та даалгавар байршуулдаг хэрэглэгч биш байна!'
      );
    }

    const newTask = await db
      .insert(tasks)
      .values({
        title,
        description,
        posterId: user.id,
        categoryId: type,
        estimatedDuration: Number(duration),
        paymentAmount: estimatedCost,
        address: location,
        isRemote,
        isUrgent,
        ...(requirements !== undefined ? { requirements } : {}),
        status: 'open',
        ...(isUrgent && urgencyFee !== undefined
          ? { urgencyFee: urgencyFee }
          : {}),
        posterRating: user.posterRating?.toString(),
      })
      .returning();
    if (newTask.length === 0) {
      throw new Error('Даалгавар нэмэгдсэнгүй!');
    }

    const task = newTask[0];

    const AllTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.posterId, user.id));
    const taskCount = AllTasks.length;

    await db
      .update(users)
      .set({ tasksPosted: taskCount })
      .where(eq(users.id, user.id));

    return task;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { NewTask };
