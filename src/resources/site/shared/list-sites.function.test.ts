jest.mock('../../../utils', () => {
  const actualModule: typeof import('../../../utils') =
    jest.requireActual('../../../utils');

  return {
    ...actualModule,
    sendRequest: jest.fn(),
  };
});

import * as utilsModule from '../../../utils';
import type { ListSitesResponse } from '../models';
import { listSites } from './list-sites.function';

describe('listSites', (): void => {
  it('requests the site list from Microsoft Graph', async (): Promise<void> => {
    const sitesResponse: ListSitesResponse = {
      value: [
        {
          displayName: 'Team Site',
          id: 'site-1',
          name: 'team-site',
        },
      ],
    };

    jest.spyOn(utilsModule, 'sendRequest').mockResolvedValueOnce(sitesResponse);

    await expect(listSites.call({} as never)).resolves.toEqual(sitesResponse);

    expect(utilsModule.sendRequest).toHaveBeenCalledWith('sites', {
      method: 'GET',
      qs: {
        $select: 'id,name,displayName',
        search: '*',
      },
    });
  });
});
