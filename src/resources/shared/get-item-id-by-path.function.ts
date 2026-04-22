import { IAllExecuteFunctions } from 'n8n-workflow';

import {
  getErrorMessage,
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
  try {
    const response: HttpResponse<Item> = await sendRequest.call<
      IAllExecuteFunctions,
      [string, SendRequestOptions],
      Promise<HttpResponse<Item>>
    >(this, `sites/${siteId}/drive/root:${normalizePath(path)}`, {
      returnFullResponse: true,
    });

    return response.body.id;
  } catch (error: unknown) {
    const errorMessage: string = getErrorMessage(error);

    if (errorMessage.includes('404')) {
      return undefined;
    }

    throw error;
  }
}
