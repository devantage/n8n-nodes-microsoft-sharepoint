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
import { UploadOperation } from './upload.operation';

type UploadContext = ReturnType<typeof TestUtil.createExecuteFunctionsMock>;

function createContext(): UploadContext {
  return TestUtil.createExecuteFunctionsMock(
    {
      siteId: 'site-id',
      path: '/Documents',
      name: 'report.pdf',
      binaryPropertyName: 'file',
    },
    {
      helpers: {
        getBinaryDataBuffer: jest
          .fn<Promise<Buffer>, [number, string]>()
          .mockResolvedValue(Buffer.from('file-content')),
      },
    },
  );
}

describe('UploadOperation', (): void => {
  it('uploads a binary file into an existing folder', async (): Promise<void> => {
    const context: UploadContext = createContext();

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('folder-id');
    const putSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'put')
      .mockResolvedValueOnce({
        id: 'file-id',
        name: 'report.pdf',
      });

    const operation: UploadOperation = new UploadOperation('file');
    const result: Awaited<ReturnType<UploadOperation['execute']>> =
      await operation.execute.call(context as never, 0);

    expect(result).toEqual({
      json: {
        id: 'file-id',
        name: 'report.pdf',
      },
      pairedItem: 0,
    });
    expect(putSpy).toHaveBeenCalledWith(
      context,
      'sites/site-id/drive/items/folder-id:/report.pdf:/content',
      undefined,
      Buffer.from('file-content'),
    );
  });

  it('throws when uploading to a missing folder', async (): Promise<void> => {
    const context: UploadContext = createContext();

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);

    const operation: UploadOperation = new UploadOperation('file');

    await expect(operation.execute.call(context as never, 0)).rejects.toThrow(
      NodeOperationError,
    );
  });
});
