import type { IAllExecuteFunctions } from 'n8n-workflow';

import { httpClient } from '../../../utils';
import { ListSitesResponse } from '../models';

export async function listSites(
  this: IAllExecuteFunctions,
): Promise<ListSitesResponse> {
  return httpClient.get<ListSitesResponse>(this, 'sites', {
    search: '*',
    $select: 'id,name,displayName',
  });
}
