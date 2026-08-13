import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { ListSitesResponse, Site } from '../models';
import { listSites } from './list-sites.function';

export async function getSiteOptions(
  this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
  const sites: ListSitesResponse = await listSites.call(this);

  return sites.value.map(
    (site: Site): INodePropertyOptions => ({
      name: site.displayName,
      value: site.id,
    }),
  );
}
