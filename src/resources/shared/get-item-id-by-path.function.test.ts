import { INode, NodeApiError } from 'n8n-workflow';

import { httpClient } from '../../utils';
import { getItemIdByPath, type Item } from './get-item-id-by-path.function';

describe('getItemIdByPath', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('returns the item id when the item exists', async (): Promise<void> => {
    const getSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({
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

    expect(getSpy).toHaveBeenCalledWith(
      {},
      'sites/site-id/drive/root:/documents/report.txt',
      undefined,
      {
        returnFullResponse: true,
      },
    );
  });

  it('returns undefined when the request fails with a 404 error', async (): Promise<void> => {
    jest
      .spyOn(httpClient, 'get')
      .mockRejectedValueOnce(
        new NodeApiError({} as INode, {}, { httpCode: '404' }),
      );

    await expect(
      getItemIdByPath.call({} as never, 'site-id', '/documents/report.txt'),
    ).resolves.toBeUndefined();
  });

  it('rethrows errors other than 404', async (): Promise<void> => {
    jest
      .spyOn(httpClient, 'get')
      .mockRejectedValueOnce(
        new NodeApiError({} as INode, {}, { httpCode: '500' }),
      );

    await expect(
      getItemIdByPath.call({} as never, 'site-id', '/documents/report.txt'),
    ).rejects.toThrow(NodeApiError);
  });
});
