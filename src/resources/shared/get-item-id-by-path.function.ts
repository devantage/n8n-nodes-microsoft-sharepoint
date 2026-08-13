import type { IAllExecuteFunctions, NodeApiError } from 'n8n-workflow';

import { httpClient, HttpResponse, normalizePath } from '../../utils';

export type Item = {
  id: string;
};

export async function getItemIdByPath(
  this: IAllExecuteFunctions,
  siteId: string,
  path: string,
): Promise<string | undefined> {
  try {
    const response: HttpResponse<Item> = await httpClient.get<
      HttpResponse<Item>
    >(this, `sites/${siteId}/drive/root:${normalizePath(path)}`, undefined, {
      returnFullResponse: true,
    });

    return response.body.id;
  } catch (error: unknown) {
    const typedError: NodeApiError = error as NodeApiError;

    if (typedError.httpCode == '404') {
      return undefined;
    }

    throw error;
  }
}
