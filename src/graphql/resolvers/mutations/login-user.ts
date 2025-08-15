import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { users } from '../../../db/schema/user';

const JWT_SECRET = process.env.JWT_SECRET!;

const loginUser = async (
  _: unknown,
  { email, password }: { email: string; password: string },
  context: { res: Response; req: Request }
) => {
  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return new Error('Хэрэглэгч бүртгэлгүй байна!');
    }

    const passwordValid = await bcrypt.compare(password, user[0].passwordHash);
    if (!passwordValid) {
      return new Error('Нууц үг буруу байна!');
    }

    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    context.res.cookie('AccessToken', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 honog
    });

    return user[0];
  } catch (err) {
    console.error(err);
    return Catch_Error(err);
  }
};

export { loginUser };
