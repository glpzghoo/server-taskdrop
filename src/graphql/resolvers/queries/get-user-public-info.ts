import { eq } from 'drizzle-orm';
import { db } from '../../../db/client';
import Catch_Error from '../../../utils/GraphqlError';
import { users } from '../../../db/schema';

const getUserPublicInfoById = async (_: unknown, { id }: { id: string }) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        bio: true,
        city: true,
        availableNow: true,
        isHelper: true,
        isTaskPoster: true,
        maxTravelDistance: true,
        preferredCategories: true,
        helperRating: true,
        helperRatingCount: true,
        posterRating: true,
        posterRatingCount: true,
        tasksCompleted: true,
        tasksPosted: true,
        emailVerified: true,
        phoneVerified: true,
        backgroundCheckStatus: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
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

export { getUserPublicInfoById };
