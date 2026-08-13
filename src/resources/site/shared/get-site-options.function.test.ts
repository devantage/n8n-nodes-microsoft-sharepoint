jest.mock('./list-sites.function', () => ({
  listSites: jest.fn(),
}));

import type { INodePropertyOptions } from 'n8n-workflow';

import { getSiteOptions } from './get-site-options.function';
import { listSites } from './list-sites.function';

describe('getSiteOptions', (): void => {
  it('maps load options from the available sites', async (): Promise<void> => {
    (listSites as jest.Mock).mockResolvedValueOnce({
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
    });

    const options: INodePropertyOptions[] = await getSiteOptions.call(
      {} as never,
    );

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
});
