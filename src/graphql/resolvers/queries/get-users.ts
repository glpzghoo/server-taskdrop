import { db } from '../../../db/client';
import { users as AllUsers } from '../../../db/schema/user';
import Catch_Error from '../../../utils/GraphqlError';

const getUsers = async () => {
  try {
    const users = await db.select().from(AllUsers);
    if (users.length === 0) {
      throw new Error('Хэрэглэгч олдсонгүй!');
    }
    return users;
  } catch (er) {
    return Catch_Error(er);
  }
};

export { getUsers };
