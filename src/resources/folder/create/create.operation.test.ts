jest.mock('../shared', () => {
  const actualModule: typeof import('../shared') =
    jest.requireActual('../shared');

  return {
    ...actualModule,
    createFolder: jest.fn(),
  };
});

import { TestUtil } from '@devantage/n8n-custom-nodes-framework';

import type { Folder } from '../models';
import * as folderSharedModule from '../shared';
import { CreateOperation } from './create.operation';

describe('CreateOperation', (): void => {
  it('creates a folder with the configured additional fields', async (): Promise<void> => {
    const folder: Folder = {
      id: 'folder-id',
      name: 'Invoices',
    };
    const context: ReturnType<typeof TestUtil.createExecuteFunctionsMock> =
      TestUtil.createExecuteFunctionsMock({
        siteId: 'site-id',
        path: '/Finance/Invoices',
        additionalFields: {
          createIntermediateFolders: true,
          overwrite: true,
        },
      });

    jest
      .spyOn(folderSharedModule, 'createFolder')
      .mockResolvedValueOnce(folder);

    const operation: CreateOperation = new CreateOperation('folder');
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
