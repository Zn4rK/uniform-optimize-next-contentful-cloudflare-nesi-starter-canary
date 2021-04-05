import { DeliveryAPIResult } from '@uniformdev/optimize-common';
import { personalizeNesi } from '@uniformdev/optimize-tracker';
import intentManifest from '../lib/intentManifest.json';
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';
import { isHtmlRequest, isListRequest } from './utils';
import { initializeTracker } from './tracker';
import { ReevaluateSignalsResults } from '@uniformdev/optimize-tracker-common';

export async function handleRequest(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);

  /*
    If you are doing local development, sourcing your assets from KV might not be ideal because
    you'll have to constantly push new builds to KV to have the latest and greatest returned.

    Consider using the following line locally instead against your frameworks development server.

    const page = await fetch('<origin_here>' + url.pathname);

    Remember, the Cloudflare Worker can not see localhost so use an origin that is publicly accessible, using
    ngrok or similar service to make your local development service accessible.
  */

  const htmlRequest = isHtmlRequest(url);
  const listRequest = isListRequest(url);

  let reevaluationResult: ReevaluateSignalsResults | undefined;

  if (listRequest || htmlRequest) {
    reevaluationResult = await initializeTracker(intentManifest as DeliveryAPIResult, event.request);
  }

  if (listRequest) {
    const path = url.searchParams.get('path');

    if (!path) {
      return new Response(JSON.stringify({ error: 'path not provided.' }), {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
        },
      });
    }

    const customKeyModifier = (request: Request) => {
      const url = new URL(request.url);
      url.pathname = path;
      return mapRequestToAsset(new Request(url.toString(), request));
    };

    const asset = await getAssetFromKV(event, { mapRequestToAsset: customKeyModifier });

    const body = await asset.text();

    const { lists } = personalizeHtml({
      html: body,
      reevaluationResult,
    });

    return new Response(JSON.stringify({ path, lists }), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    });
  }

  const page = await getAssetFromKV(event, undefined);
  const res = new Response(page.body, page);

  if (htmlRequest) {
    const body = await res.text();

    const { html: personalized } = personalizeHtml({
      html: body,
      reevaluationResult,
    });

    const htmlResponse = new Response(personalized, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
      },
    });

    return htmlResponse;
  }

  return res;
}

const personalizeHtml = ({
  html,
  reevaluationResult,
}: {
  html: string;
  reevaluationResult: ReevaluateSignalsResults | undefined;
}): { html: string; lists: Record<string, number[]> } => {
  return personalizeNesi({
    html,
    reevaluationResult,
    pageStateSelectors: [
      {
        tag: 'script',
        attrs: { id: '__UNIFORM_DATA__' },
      },
    ],
  });
};
