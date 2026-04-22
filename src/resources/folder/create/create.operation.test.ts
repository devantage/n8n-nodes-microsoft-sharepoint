jest.mock('../../../utils', () => {
  const actualModule: typeof import('../../../utils') =
    jest.requireActual('../../../utils');

  return actualModule;
});

jest.mock('../shared', () => {
  const actualModule: typeof import('../shared') =
    jest.requireActual('../shared');

  return {
    ...actualModule,
    createFolder: jest.fn(),
  };
});

import type { Folder } from '../models';
import * as folderSharedModule from '../shared';
import { CreateOperation } from './create.operation';

type OperationContext = {
  getNode(): { name: string; type: string };
  getNodeParameter: jest.Mock<unknown, [string, number]>;
};

describe('CreateOperation', (): void => {
  it('creates a folder with the configured additional fields', async (): Promise<void> => {
    const folder: Folder = {
      id: 'folder-id',
      name: 'Invoices',
    };
    const context: OperationContext = {
      getNode: (): { name: string; type: string } => ({
        name: 'Microsoft SharePoint',
        type: 'microsoftSharePoint',
      }),
      getNodeParameter: jest
        .fn<unknown, [string, number]>()
        .mockReturnValueOnce('site-id')
        .mockReturnValueOnce({
          createIntermediateFolders: true,
          overwrite: true,
        })
        .mockReturnValueOnce('/Finance/Invoices'),
    };

    jest
      .spyOn(folderSharedModule, 'createFolder')
      .mockResolvedValueOnce(folder);

    const operation: CreateOperation = new CreateOperation();
    const result: Awaited<ReturnType<CreateOperation['execute']>> =
      await operation.execute.call(context as never, 4);

    expect(result).toEqual({
      json: folder,
      pairedItem: 4,
    });
    expect(folderSharedModule.createFolder).toHaveBeenCalledWith(
      'site-id',
      '/Finance/Invoices',
      true,
      true,
    );
  });
});
