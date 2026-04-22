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
import type { GetFileResponse } from '../models';
import { DownloadOperation } from './download.operation';

type BinaryData = {
  fileName: string;
  mimeType: string;
};

type FileExecutionContextMock = {
  getNode(): { name: string; type: string };
  getNodeParameter: jest.Mock<unknown, [string, number]>;
  helpers: {
    prepareBinaryData: jest.Mock<
      Promise<BinaryData>,
      [Buffer, string, string | undefined]
    >;
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
      prepareBinaryData: jest.fn<
        Promise<BinaryData>,
        [Buffer, string, string | undefined]
      >(),
    },
  };
}

describe('DownloadOperation', (): void => {
  it('downloads a file and exposes it as binary data', async (): Promise<void> => {
    const context: FileExecutionContextMock = createContext();
    const fileDetails: GetFileResponse = {
      '@microsoft.graph.downloadUrl': 'https://download.example.com/report.pdf',
      file: {
        mimeType: 'application/pdf',
      },
      id: 'file-id',
      name: 'report.pdf',
    };

    context.getNodeParameter
      .mockReturnValueOnce('site-id')
      .mockReturnValueOnce('/Documents/report.pdf');
    context.helpers.prepareBinaryData.mockResolvedValueOnce({
      fileName: 'report.pdf',
      mimeType: 'application/pdf',
    });

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('file-id');
    jest
      .spyOn(utilsModule, 'sendRequest')
      .mockResolvedValueOnce(fileDetails)
      .mockResolvedValueOnce(Buffer.from('file-content'));

    const operation: DownloadOperation = new DownloadOperation();
    const result: Awaited<ReturnType<DownloadOperation['execute']>> =
      await operation.execute.call(context as never, 5);

    expect(result).toEqual({
      binary: {
        file: {
          fileName: 'report.pdf',
          mimeType: 'application/pdf',
        },
      },
      json: fileDetails,
    });
    expect(utilsModule.sendRequest).toHaveBeenNthCalledWith(
      1,
      '/sites/site-id/drive/items/file-id',
      {
        method: 'GET',
      },
    );
    expect(utilsModule.sendRequest).toHaveBeenNthCalledWith(2, '', {
      encoding: 'stream',
      headers: {},
      url: 'https://download.example.com/report.pdf',
    });
  });

  it('throws when downloading a missing file', async (): Promise<void> => {
    const context: FileExecutionContextMock = createContext();

    context.getNodeParameter
      .mockReturnValueOnce('site-id')
      .mockReturnValueOnce('/Documents/report.pdf');

    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);

    const operation: DownloadOperation = new DownloadOperation();

    await expect(operation.execute.call(context as never, 2)).rejects.toThrow(
      NodeOperationError,
    );
  });
});
