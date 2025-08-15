import { db } from '../../../db/client';
import { categories } from '../../../db/schema/categories';
import Catch_Error from '../../../utils/GraphqlError';

const getCategories = async () => {
  try {
    const AllCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.name);

    return AllCategories;
  } catch (err) {
    return Catch_Error(err);
  }
};

export { getCategories };
