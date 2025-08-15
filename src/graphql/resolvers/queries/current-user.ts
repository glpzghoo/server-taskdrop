/* eslint-disable no-empty-pattern */
import { Request } from 'express';
import Catch_Error from '../../../utils/GraphqlError';
import { verify } from 'jsonwebtoken';
import { db } from '../../../db/client';
import { eq } from 'drizzle-orm';
import { parse } from 'cookie';
import { users } from '../../../db/schema/user';

const JWT_SECRET = process.env.JWT_SECRET!;

const currentUser = async (_: unknown, {}, { req }: { req: Request }) => {
  try {
    const cookies = parse(req.headers.cookie || '');
    const jwt = cookies['AccessToken'];
    if (!jwt) return null;

    const verified = verify(jwt!, JWT_SECRET) as { id: string; email: string };

    const user = await db.select().from(users).where(eq(users.id, verified.id));
    if (user.length === 0) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }

    void db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, verified.id))
      .catch((e) => console.error('updated', e));

    return user[0] || null;
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { currentUser };
