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
  it('deletes a file by resolving it from the path', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        siteId: 'site-id',
        path: '/Documents/report.pdf',
      });

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('file-id');
    const deleteSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'delete')
      .mockResolvedValueOnce(undefined);

    const operation: DeleteOperation = new DeleteOperation('file');
    const result: Awaited<ReturnType<DeleteOperation['execute']>> =
      await operation.execute.call(context as never, 1);

    expect(result).toEqual({
      json: {
        deleted: true,
      },
    });
    expect(deleteSpy).toHaveBeenCalledWith(
      context,
      'sites/site-id/drive/items/file-id',
    );
  });

  it('throws when deleting a missing file', async (): Promise<void> => {
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        siteId: 'site-id',
        path: '/Documents/report.pdf',
      });

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);

    const operation: DeleteOperation = new DeleteOperation('file');

    await expect(operation.execute.call(context as never, 1)).rejects.toThrow(
      NodeOperationError,
    );
  });

  it('declares its properties for the file delete operation only', (): void => {
    const operation: DeleteOperation = new DeleteOperation('file');

    for (const curProperty of operation.properties) {
      expect(curProperty.displayOptions?.show).toEqual({
        resource: ['file'],
        operation: ['delete'],
      });
    }
  });
});
