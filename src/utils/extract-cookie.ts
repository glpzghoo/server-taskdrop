import { parse } from 'cookie';
import { Request } from 'express';

export const ExtractCookie = (
  req: Request,
  cookieName: string
): string | null => {
  const cookies = parse(req.headers.cookie || '');
  const cookie = cookies[cookieName];
  return cookie || null;
};
