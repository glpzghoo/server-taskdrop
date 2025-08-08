import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import { users } from '../../../db/schema';
import Catch_Error from '../../../utils/GraphqlError';
import bcrypt from 'bcrypt';

const createUser = async (
  _: unknown,
  {
    email,
    firstName,
    lastName,
    password,
    phone,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phone: string;
  }
) => {
  try {
    const userExistEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userExistEmail.length > 0) {
      return new Error('Хэрэглэгчийн мэйл бүртгэлтэй байна!');
    }

    const userExistPhone = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone));

    if (userExistPhone.length > 0) {
      return new Error('Хэрэглэгчийн утас бүртгэлтэй байна!');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db
      .insert(users)
      .values({ firstName, email, lastName, passwordHash, phone })
      .returning();

    return user[0];
  } catch (err) {
    return Catch_Error(err);
  }
};

export { createUser };
