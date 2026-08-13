import { httpClient } from '../../../utils';
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

    const getSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce(sitesResponse);

    await expect(listSites.call({} as never)).resolves.toEqual(sitesResponse);

    expect(getSpy).toHaveBeenCalledWith({}, 'sites', {
      $select: 'id,name,displayName',
      search: '*',
    });
  });
});
