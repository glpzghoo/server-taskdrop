import { Request } from 'express';
import { ExtractCookie } from '../../../utils/extract-cookie';
import Catch_Error from '../../../utils/GraphqlError';
import { verify } from 'jsonwebtoken';
import { db } from '../../../db/client';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema/user';

export const UpdateBio = async (
  _: unknown,
  { bio }: { bio: string },
  { req }: { req: Request }
) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('No Env: JWT_SECRET');
    }
    const token = ExtractCookie(req, 'AccessToken');
    if (!token) {
      throw new Error('Хэрэглэгч нэвтрээгүй байна!');
    }
    const verified = verify(token, process.env.JWT_SECRET) as { id: string };
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, verified.id))
      .limit(1);
    if (user.length === 0) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }

    await db
      .update(users)
      .set({ bio })
      .where(eq(users.id, verified.id))
      .execute();

    return true;
  } catch (err) {
    return Catch_Error(err);
  }
};
