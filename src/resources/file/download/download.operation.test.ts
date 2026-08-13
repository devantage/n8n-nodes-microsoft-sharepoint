jest.mock('../../shared', () => {
  const actualModule: typeof import('../../shared') =
    jest.requireActual('../../shared');

  return {
    ...actualModule,
    getItemIdByPath: jest.fn(),
  };
});

import { TestUtil } from '@devantage/n8n-custom-nodes-framework';
import type { IBinaryData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { httpClient } from '../../../utils';
import * as sharedModule from '../../shared';
import type { GetFileResponse } from '../models';
import { DownloadOperation } from './download.operation';

type DownloadContext = ReturnType<typeof TestUtil.createExecuteFunctionsMock>;

function createContext(): DownloadContext {
  return TestUtil.createExecuteFunctionsMock(
    {
      siteId: 'site-id',
      path: '/Documents/report.pdf',
    },
    {
      helpers: {
        prepareBinaryData: jest.fn(),
      } as never,
    },
  );
}

describe('DownloadOperation', (): void => {
  it('downloads a file and exposes it as binary data', async (): Promise<void> => {
    const context: DownloadContext = createContext();
    const binaryData: IBinaryData = TestUtil.createBinaryData({
      fileName: 'report.pdf',
      mimeType: 'application/pdf',
    });
    const fileDetails: GetFileResponse = {
      '@microsoft.graph.downloadUrl': 'https://download.example.com/report.pdf',
      file: {
        mimeType: 'application/pdf',
      },
      id: 'file-id',
      name: 'report.pdf',
    };

    (
      context.helpers as unknown as {
        prepareBinaryData: jest.Mock;
      }
    ).prepareBinaryData.mockResolvedValueOnce(binaryData);

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('file-id');
    const getSpy: jest.SpyInstance = jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce(fileDetails)
      .mockResolvedValueOnce(Buffer.from('file-content'));

    const operation: DownloadOperation = new DownloadOperation('file');
    const result: Awaited<ReturnType<DownloadOperation['execute']>> =
      await operation.execute.call(context as never, 5);

    expect(result).toEqual({
      binary: {
        file: binaryData,
      },
      json: fileDetails,
    });
    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      context,
      'sites/site-id/drive/items/file-id',
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      context,
      'https://download.example.com/report.pdf',
      undefined,
      {
        encoding: 'stream',
        headers: {},
      },
    );
  });

  it('throws when downloading a missing file', async (): Promise<void> => {
    const context: DownloadContext = createContext();

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);

    const operation: DownloadOperation = new DownloadOperation('file');

    await expect(operation.execute.call(context as never, 2)).rejects.toThrow(
      NodeOperationError,
    );
  });
});
