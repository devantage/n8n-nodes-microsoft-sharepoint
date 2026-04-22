jest.mock('../../utils', () => {
  const actualModule: typeof import('../../utils') =
    jest.requireActual('../../utils');

  return {
    ...actualModule,
    sendRequest: jest.fn(),
  };
});

import * as utilsModule from '../../utils';
import { getItemIdByPath, type Item } from './get-item-id-by-path.function';

describe('getItemIdByPath', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('returns the item id when the item exists', async (): Promise<void> => {
    jest.spyOn(utilsModule, 'sendRequest').mockResolvedValueOnce({
      body: {
        id: 'item-id',
      } as Item,
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    });

    await expect(
      getItemIdByPath.call({} as never, 'site-id', 'documents/report.txt'),
    ).resolves.toBe('item-id');

    expect(utilsModule.sendRequest).toHaveBeenCalledWith(
      'sites/site-id/drive/root:/documents/report.txt',
      {
        returnFullResponse: true,
      },
    );
  });

  it('returns undefined when sendRequest throws a 404 error', async (): Promise<void> => {
    jest
      .spyOn(utilsModule, 'sendRequest')
      .mockRejectedValueOnce(new Error('HTTP Error 404 - Not Found'));

    await expect(
      getItemIdByPath.call({} as never, 'site-id', '/documents/report.txt'),
    ).resolves.toBeUndefined();
  });
});
