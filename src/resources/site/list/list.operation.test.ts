jest.mock('../shared', () => {
  const actualModule: typeof import('../shared') =
    jest.requireActual('../shared');

  return {
    ...actualModule,
    listSites: jest.fn(),
  };
});

import type { INodeExecutionData } from 'n8n-workflow';

import type { ListSitesResponse } from '../models';
import * as siteSharedModule from '../shared';
import { ListOperation } from './list.operation';

describe('ListOperation', (): void => {
  it('lists sites through the shared helper', async (): Promise<void> => {
    const sitesResponse: ListSitesResponse = {
      value: [
        {
          displayName: 'Team Site',
          id: 'site-1',
          name: 'team-site',
        },
      ],
    };

    jest
      .spyOn(siteSharedModule, 'listSites')
      .mockResolvedValueOnce(sitesResponse);

    const operation: ListOperation = new ListOperation();
    const result: INodeExecutionData = await operation.execute.call(
      {} as never,
      2,
    );

    expect(result).toEqual({
      json: sitesResponse.value,
      pairedItem: 2,
    });
    expect(siteSharedModule.listSites).toHaveBeenCalledTimes(1);
  });
});
