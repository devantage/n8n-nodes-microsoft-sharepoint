jest.mock('../../shared', () => {
  const actualModule: typeof import('../../shared') =
    jest.requireActual('../../shared');

  return {
    ...actualModule,
    getItemIdByPath: jest.fn(),
  };
});

import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import { NodeOperationError } from 'n8n-workflow';

import { httpClient } from '../../../utils';
import * as sharedModule from '../../shared';
import { DeleteOperation } from './delete.operation';

describe('DeleteOperation', (): void => {
  it('deletes a folder by resolving its id from the path', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        siteId: 'site-id',
        path: '/Finance',
      });

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('folder-id');
    const deleteSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'delete')
      .mockResolvedValueOnce(undefined);

    const operation: DeleteOperation = new DeleteOperation('folder');
    const result: Awaited<ReturnType<DeleteOperation['execute']>> =
      await operation.execute.call(context as never, 1);

    expect(result).toEqual({
      json: {
        deleted: true,
      },
    });
    expect(deleteSpy).toHaveBeenCalledWith(
      context,
      'sites/site-id/drive/items/folder-id',
    );
  });

  it('throws when trying to delete a missing folder', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        siteId: 'site-id',
        path: '/Finance',
      });

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);

    const operation: DeleteOperation = new DeleteOperation('folder');

    await expect(operation.execute.call(context as never, 3)).rejects.toThrow(
      NodeOperationError,
    );
  });
});
