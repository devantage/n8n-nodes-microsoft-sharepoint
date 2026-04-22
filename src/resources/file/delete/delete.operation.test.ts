jest.mock('../../../utils', () => {
  const actualModule: typeof import('../../../utils') =
    jest.requireActual('../../../utils');

  return {
    ...actualModule,
    sendRequest: jest.fn(),
  };
});

jest.mock('../../shared', () => {
  const actualModule: typeof import('../../shared') =
    jest.requireActual('../../shared');

  return {
    ...actualModule,
    getItemIdByPath: jest.fn(),
  };
});

import { NodeOperationError } from 'n8n-workflow';

import * as utilsModule from '../../../utils';
import * as sharedModule from '../../shared';
import { DeleteOperation } from './delete.operation';

type OperationContext = {
  getNode(): { name: string; type: string };
  getNodeParameter: jest.Mock<unknown, [string, number]>;
};

describe('DeleteOperation', (): void => {
  it('deletes a file by resolving it from the path', async (): Promise<void> => {
    const context: OperationContext = {
      getNode: (): { name: string; type: string } => ({
        name: 'Microsoft SharePoint',
        type: 'microsoftSharePoint',
      }),
      getNodeParameter: jest
        .fn<unknown, [string, number]>()
        .mockReturnValueOnce('site-id')
        .mockReturnValueOnce('/Documents/report.pdf'),
    };

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('file-id');
    jest.spyOn(utilsModule, 'sendRequest').mockResolvedValueOnce(undefined);

    const operation: DeleteOperation = new DeleteOperation();
    const result: Awaited<ReturnType<DeleteOperation['execute']>> =
      await operation.execute.call(context as never, 1);

    expect(result).toEqual({
      json: {
        deleted: true,
      },
    });
    expect(utilsModule.sendRequest).toHaveBeenCalledWith(
      '/sites/site-id/drive/items/file-id',
      {
        method: 'DELETE',
      },
    );
  });

  it('throws when deleting a missing file', async (): Promise<void> => {
    const context: OperationContext = {
      getNode: (): { name: string; type: string } => ({
        name: 'Microsoft SharePoint',
        type: 'microsoftSharePoint',
      }),
      getNodeParameter: jest
        .fn<unknown, [string, number]>()
        .mockReturnValueOnce('site-id')
        .mockReturnValueOnce('/Documents/report.pdf'),
    };

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);

    const operation: DeleteOperation = new DeleteOperation();

    await expect(operation.execute.call(context as never, 1)).rejects.toThrow(
      NodeOperationError,
    );
  });
});
