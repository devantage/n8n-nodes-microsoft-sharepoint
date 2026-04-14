import { IAllExecuteFunctions } from 'n8n-workflow';

import {
  HttpResponse,
  normalizePath,
  sendRequest,
  SendRequestOptions,
} from '../../utils';

export type Item = {
  id: string;
};

export async function getItemIdByPath(
  this: IAllExecuteFunctions,
  siteId: string,
  path: string,
): Promise<string | undefined> {
  const response: HttpResponse<Item> = await sendRequest.call<
    IAllExecuteFunctions,
    [string, SendRequestOptions],
    Promise<HttpResponse<Item>>
  >(this, `sites/${siteId}/drive/root:${normalizePath(path)}`, {
    returnFullResponse: true,
    ignoreHttpStatusErrors: true,
  });

  if (response.statusCode >= 400) {
    return undefined;
  }

  return response.body.id;
}
