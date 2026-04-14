import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { Resource } from '../models';
import { ListOperation } from './list';
import { ListSitesResponse, Site } from './models';
import { listSites } from './shared';

async function getSiteOptions(
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

export class SiteResource extends Resource {
  public constructor() {
    super(
      'site',
      'Site',
      {
        loadOptions: {
          getSiteOptions,
        },
      },
      ListOperation,
    );
  }
}
