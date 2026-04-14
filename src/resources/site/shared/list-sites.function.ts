import { IAllExecuteFunctions } from 'n8n-workflow';

import { sendRequest, SendRequestOptions } from '../../../utils';
import { ListSitesResponse } from '../models';

export async function listSites(
  this: IAllExecuteFunctions,
): Promise<ListSitesResponse> {
  const response: ListSitesResponse = await sendRequest.call<
    IAllExecuteFunctions,
    [string, SendRequestOptions],
    Promise<ListSitesResponse>
  >(this, 'sites', {
    method: 'GET',
    qs: {
      search: '*',
      $select: 'id,name,displayName',
    },
  });

  return response;
}
