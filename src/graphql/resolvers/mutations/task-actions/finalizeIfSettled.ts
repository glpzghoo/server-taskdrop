/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import { ExtractCookie } from '../../../../utils/extract-cookie';
import { db } from '../../../../db/client';
import { tasks, users } from '../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import Catch_Error from '../../../../utils/GraphqlError';
import { verify } from 'jsonwebtoken';

export const finalizeIfSettled = async (
  _: unknown,
  { taskId }: { taskId: string },
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
      columns: {
        id: true,
        status: true,
        posterId: true,
        assignedTo: true,
        markCompleted1: true,
        markCompleted2: true,
        helperRating: true,
        posterRating: true,
        paymentAmount: true,
        urgencyFee: true,
      },
    });
    if (!task) throw new Error('Даалгавар олдсонгүй!');
    if (task.posterId !== userId) throw new Error('Зөвхөн захиалагч эцэслэнэ.');
    if (task.status !== 'in_progress')
      throw new Error('Энэ төлөвт эцэслэх боломжгүй.');
    if (!task.markCompleted1 || !task.markCompleted2) {
      throw new Error('Хоёр тал баталгаажаагүй байна.');
    }
    if (task.helperRating == null) {
      throw new Error('Гүйцэтгэгчийн үнэлгээ (poster → helper) дутуу байна.');
    }

    await db.transaction(async (tx) => {
      const now = new Date();

      const [locked] = await tx
        .update(tasks)
        .set({ status: 'completed', completedAt: now, updatedAt: now })
        .where(
          and(
            eq(tasks.id, task.id),
            eq(tasks.status, 'in_progress'),
            eq(tasks.posterId, userId),
            eq(tasks.markCompleted1, true),
            eq(tasks.markCompleted2, true)
          )
        )
        .returning({
          id: tasks.id,
          posterId: tasks.posterId,
          assignedTo: tasks.assignedTo,
          helperRating: tasks.helperRating,
          posterRating: tasks.posterRating,
          paymentAmount: tasks.paymentAmount,
          urgencyFee: tasks.urgencyFee,
        });

      if (!locked)
        throw new Error('Төлөв өөрчлөгдсөн байж магадгүй. Дахин оролдоно уу.');

      const [helper, poster] = await Promise.all([
        tx.query.users.findFirst({
          where: eq(users.id, locked.assignedTo!),
          columns: {
            id: true,
            helperRating: true,
            helperRatingCount: true,
            tasksCompleted: true,
            totalEarned: true,
          },
        }),
        tx.query.users.findFirst({
          where: eq(users.id, locked.posterId),
          columns: {
            id: true,
            posterRating: true,
            posterRatingCount: true,
            totalSpent: true,
          },
        }),
      ]);
      if (!helper || !poster)
        throw new Error('Хэрэглэгчийн мэдээлэл дутуу байна.');

      const posterToHelper = parseFloat(locked.helperRating!);
      const helperPrevCount = helper.helperRatingCount ?? 0;
      const helperPrevAvg = parseFloat(helper.helperRating ?? '0') || 0;
      const helperNewCount = helperPrevCount + 1;
      const helperNewAvg = (
        (helperPrevAvg * helperPrevCount + posterToHelper) /
        helperNewCount
      ).toFixed(2);

      const helperToPoster =
        locked.posterRating != null
          ? parseFloat(locked.posterRating)
          : undefined;
      const posterPrevCount = poster.posterRatingCount ?? 0;
      const posterPrevAvg = parseFloat(poster.posterRating ?? '0') || 0;
      const posterNewCount =
        helperToPoster != null ? posterPrevCount + 1 : posterPrevCount;
      const posterNewAvg =
        helperToPoster != null
          ? (
              (posterPrevAvg * posterPrevCount + helperToPoster) /
              posterNewCount
            ).toFixed(2)
          : poster.posterRating;

      const amount = (locked.paymentAmount ?? 0) + (locked.urgencyFee ?? 0);

      const updates: Promise<any>[] = [
        tx
          .update(users)
          .set({
            helperRating: helperNewAvg,
            helperRatingCount: helperNewCount,
            tasksCompleted: (helper.tasksCompleted ?? 0) + 1,
            totalEarned: (helper.totalEarned ?? 0) + amount,
          })
          .where(eq(users.id, helper.id)),

        tx
          .update(users)
          .set({
            totalSpent: (poster.totalSpent ?? 0) + amount,
            ...(helperToPoster != null
              ? {
                  posterRating: posterNewAvg,
                  posterRatingCount: posterNewCount,
                }
              : {}),
          })
          .where(eq(users.id, poster.id)),
      ];

      await Promise.all(updates);
    });

    return true;
  } catch (err) {
    return Catch_Error(err);
  }
};
