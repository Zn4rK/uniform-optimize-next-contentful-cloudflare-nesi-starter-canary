import { cookieScoringStorage } from '@uniformdev/optimize-tracker';
import { ScoringStorage } from '@uniformdev/optimize-tracker-common';
import { parse } from 'cookie';

const parseCookies: (request: Request) => Record<string, string> | undefined = (request) => {
  const cookieValue = request.headers.get('Cookie');

  if (cookieValue) {
    const parsedCookies = parse(cookieValue);
    return parsedCookies;
  }

  return undefined;
};

export const createWorkerCookieStorage: (request: Request) => ScoringStorage = (request) => {
  const cookieStorage = cookieScoringStorage({
    getCookie: (name) => {
      const cookies = parseCookies(request) || {};
      return cookies[name];
    },

    setCookie: (_name, _value, _maxAge) => {
      // Worker should only read scores, not write them.
    },
  });

  return cookieStorage;
};
