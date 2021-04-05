import { DeliveryAPIResult } from '@uniformdev/optimize-common';
import { inMemoryScopeStorage } from '@uniformdev/optimize-tracker';
import { createDefaultTracker } from '@uniformdev/optimize-tracker-browser';
import { ReevaluateSignalsResults, TrackerRequestContext } from '@uniformdev/optimize-tracker-common';
import { createWorkerCookieStorage } from './cookieStorage';

export const initializeTracker = async (
  intentManifest: DeliveryAPIResult,
  request: Request
): Promise<ReevaluateSignalsResults | undefined> => {
  const tracker = createDefaultTracker({
    intentManifest: intentManifest,
    storage: {
      scopes: inMemoryScopeStorage({
        scoringStorage: createWorkerCookieStorage(request),
      }),
    },
  });

  await tracker.initialize();

  const requestContext: TrackerRequestContext = {
    cookies: request.headers.get('cookie') || '',
    url: request.url,
    userAgent: request.headers.get('user-agent') || '',
  };

  const result = await tracker.reevaluateSignals(requestContext);

  return result;
};
