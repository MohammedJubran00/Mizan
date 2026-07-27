import { AppError } from '../errors/AppError';

/** Extract a named route param as a guaranteed string. */
export function routeParam(params: Record<string, string | string[] | undefined>, name: string): string {
  const val = params[name];
  const str = Array.isArray(val) ? val[0] : val;
  if (!str) throw new AppError(400, `Missing route parameter: ${name}`);
  return str;
}
