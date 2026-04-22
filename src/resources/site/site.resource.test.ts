jest.mock('./shared', () => {
  const actualModule: typeof import('./shared') =
    jest.requireActual('./shared');

  return {
    ...actualModule,
    listSites: jest.fn(),
  };
});

import type { INodePropertyOptions } from 'n8n-workflow';

import type { ListSitesResponse } from './models';
import * as siteSharedModule from './shared';
import { SiteResource } from './site.resource';

describe('SiteResource', (): void => {
  it('maps load options from the available sites', async (): Promise<void> => {
    const sitesResponse: ListSitesResponse = {
      value: [
        {
          displayName: 'Team Site',
          id: 'site-1',
          name: 'team-site',
        },
        {
          displayName: 'Docs',
          id: 'site-2',
          name: 'docs',
        },
      ],
    };

    jest
      .spyOn(siteSharedModule, 'listSites')
      .mockResolvedValueOnce(sitesResponse);

    const resource: SiteResource = new SiteResource();
    const nodeMethods: ReturnType<SiteResource['getMethods']> =
      resource.getMethods();

    if (!nodeMethods?.loadOptions?.getSiteOptions) {
      throw new Error('Expected getSiteOptions to be defined');
    }

    const options: INodePropertyOptions[] =
      await nodeMethods.loadOptions.getSiteOptions.call({} as never);

    expect(options).toEqual([
      {
        name: 'Team Site',
        value: 'site-1',
      },
      {
        name: 'Docs',
        value: 'site-2',
      },
    ]);
  });

  it('registers the list operation in the resource', (): void => {
    const resource: SiteResource = new SiteResource();

    expect(resource.getOperation('list').name).toBe('list');
    expect(resource.getOperationProperty().options).toEqual([
      {
        action: 'List sites',
        description: 'List sites',
        name: 'List',
        value: 'list',
      },
    ]);
  });
});
