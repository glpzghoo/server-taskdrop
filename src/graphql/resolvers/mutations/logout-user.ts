/* eslint-disable no-empty-pattern */
import { Response } from 'express';
import Catch_Error from '../../../utils/GraphqlError';

const logoutUser = (_: unknown, {}, { res }: { res: Response }) => {
  try {
    res.cookie('AccessToken', '', {
      maxAge: 0,
    });

    return true;
  } catch (err) {
    return Catch_Error(err);
  }
};

export { logoutUser };
