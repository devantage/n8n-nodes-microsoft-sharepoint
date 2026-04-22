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
import { UploadOperation } from './upload.operation';

type FileExecutionContextMock = {
  getNode(): { name: string; type: string };
  getNodeParameter: jest.Mock<unknown, [string, number]>;
  helpers: {
    getBinaryDataBuffer: jest.Mock<Promise<Buffer>, [number, string]>;
  };
};

function createContext(): FileExecutionContextMock {
  return {
    getNode: (): { name: string; type: string } => ({
      name: 'Microsoft SharePoint',
      type: 'microsoftSharePoint',
    }),
    getNodeParameter: jest.fn<unknown, [string, number]>(),
    helpers: {
      getBinaryDataBuffer: jest.fn<Promise<Buffer>, [number, string]>(),
    },
  };
}

describe('UploadOperation', (): void => {
  it('uploads a binary file into an existing folder', async (): Promise<void> => {
    const context: FileExecutionContextMock = createContext();

    context.getNodeParameter
      .mockReturnValueOnce('site-id')
      .mockReturnValueOnce('/Documents')
      .mockReturnValueOnce('report.pdf')
      .mockReturnValueOnce('file');
    context.helpers.getBinaryDataBuffer.mockResolvedValueOnce(
      Buffer.from('file-content'),
    );

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('folder-id');
    jest.spyOn(utilsModule, 'sendRequest').mockResolvedValueOnce({
      id: 'file-id',
      name: 'report.pdf',
    });

    const operation: UploadOperation = new UploadOperation();
    const result: Awaited<ReturnType<UploadOperation['execute']>> =
      await operation.execute.call(context as never, 0);

    expect(result).toEqual({
      json: {
        id: 'file-id',
        name: 'report.pdf',
      },
      pairedItem: 0,
    });
    expect(utilsModule.sendRequest).toHaveBeenCalledWith(
      '/sites/site-id/drive/items/folder-id:/report.pdf:/content',
      {
        body: Buffer.from('file-content'),
        method: 'PUT',
      },
    );
  });

  it('throws when uploading to a missing folder', async (): Promise<void> => {
    const context: FileExecutionContextMock = createContext();

    context.getNodeParameter
      .mockReturnValueOnce('site-id')
      .mockReturnValueOnce('/Documents')
      .mockReturnValueOnce('report.pdf')
      .mockReturnValueOnce('file');
    context.helpers.getBinaryDataBuffer.mockResolvedValueOnce(
      Buffer.from('file-content'),
    );

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);

    const operation: UploadOperation = new UploadOperation();

    await expect(operation.execute.call(context as never, 0)).rejects.toThrow(
      NodeOperationError,
    );
  });
});
