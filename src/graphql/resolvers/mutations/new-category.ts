import Catch_Error from '../../../utils/GraphqlError';
import { db } from '../../../db/client';
import { categories } from '../../../db/schema';

const NewCategory = async (_: unknown, { name }: { name: string }) => {
  try {
    if (!name.trim()) {
      throw new Error('Нэр оруулна уу');
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const newCategory = await db
      .insert(categories)
      .values({ name, slug })
      .returning();
    if (newCategory.length === 0) {
      throw new Error('Категори нэмэгдсэнгүй');
    }
    return newCategory[0];
  } catch (err) {
    return Catch_Error(err);
  }
};

export { NewCategory };
