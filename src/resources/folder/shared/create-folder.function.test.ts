jest.mock('../../shared', () => {
  const actualModule: typeof import('../../shared') =
    jest.requireActual('../../shared');

  return {
    ...actualModule,
    getItemIdByPath: jest.fn(),
  };
});

import type { IDataObject } from 'n8n-workflow';

import { httpClient } from '../../../utils';
import * as sharedModule from '../../shared';
import type { Folder } from '../models';
import { createFolder } from './create-folder.function';

function createFolderBody(name: string, overwrite: boolean): IDataObject {
  return {
    '@microsoft.graph.conflictBehavior': overwrite ? 'replace' : 'fail',
    folder: {},
    name,
  };
}

describe('createFolder', (): void => {
  let postSpy: jest.SpyInstance;

  beforeEach((): void => {
    postSpy = jest.spyOn(httpClient, 'post');
  });

  afterEach((): void => {
    jest.resetAllMocks();
  });

  it('creates intermediate folders recursively when requested', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id')
      .mockResolvedValueOnce(undefined);
    postSpy
      .mockResolvedValueOnce({
        id: 'finance-id',
        name: 'Finance',
      })
      .mockResolvedValueOnce({
        id: 'invoices-id',
        name: 'Invoices',
      });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/Finance/Invoices',
      true,
      true,
    );

    expect(result).toEqual({
      id: 'invoices-id',
      name: 'Invoices',
    });
    expect(sharedModule.getItemIdByPath).toHaveBeenCalledTimes(2);
    expect(postSpy).toHaveBeenNthCalledWith(
      1,
      {},
      'sites/site-id/drive/root/children',
      createFolderBody('Finance', true),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      2,
      {},
      'sites/site-id/drive/items/finance-id/children',
      createFolderBody('Invoices', true),
    );
  });

  it('creates a root folder without intermediate folders by default', async (): Promise<void> => {
    postSpy.mockResolvedValueOnce({
      id: 'folder-id',
      name: 'Reports',
    });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/Reports',
    );

    expect(result).toEqual({
      id: 'folder-id',
      name: 'Reports',
    });
    expect(postSpy).toHaveBeenCalledWith(
      {},
      'sites/site-id/drive/root/children',
      createFolderBody('Reports', false),
    );
  });

  it('skips existing intermediate folders and creates only the missing path', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id');
    postSpy.mockResolvedValueOnce({
      id: 'invoices-id',
      name: 'Invoices',
    });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/Finance/Invoices',
      true,
      false,
    );

    expect(result).toEqual({
      id: 'invoices-id',
      name: 'Invoices',
    });
    expect(postSpy).toHaveBeenCalledWith(
      {},
      'sites/site-id/drive/items/finance-id/children',
      createFolderBody('Invoices', false),
    );
  });

  it('creates a deep nested path when no intermediate folder exists', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    postSpy
      .mockResolvedValueOnce({ id: 'A-id', name: 'A' })
      .mockResolvedValueOnce({ id: 'B-id', name: 'B' })
      .mockResolvedValueOnce({ id: 'C-id', name: 'C' })
      .mockResolvedValueOnce({ id: 'D-id', name: 'D' })
      .mockResolvedValueOnce({ id: 'Target-id', name: 'Target' });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/A/B/C/D/Target',
      true,
      false,
    );

    expect(result).toEqual({ id: 'Target-id', name: 'Target' });
    expect(sharedModule.getItemIdByPath).toHaveBeenCalledTimes(5);
    expect(postSpy).toHaveBeenCalledTimes(5);
    expect(postSpy).toHaveBeenNthCalledWith(
      1,
      {},
      'sites/site-id/drive/root/children',
      createFolderBody('A', false),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      2,
      {},
      'sites/site-id/drive/items/A-id/children',
      createFolderBody('B', false),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      3,
      {},
      'sites/site-id/drive/items/B-id/children',
      createFolderBody('C', false),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      4,
      {},
      'sites/site-id/drive/items/C-id/children',
      createFolderBody('D', false),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      5,
      {},
      'sites/site-id/drive/items/D-id/children',
      createFolderBody('Target', false),
    );
  });

  it('continues past existing intermediate folders before creating missing ones', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id');
    postSpy
      .mockResolvedValueOnce({
        id: 'archives-id',
        name: 'Archives',
      })
      .mockResolvedValueOnce({
        id: 'invoices-id',
        name: 'Invoices',
      });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/Finance/Archives/Invoices',
      true,
      false,
    );

    expect(result).toEqual({
      id: 'invoices-id',
      name: 'Invoices',
    });
    expect(sharedModule.getItemIdByPath).toHaveBeenCalledTimes(3);
    expect(postSpy).toHaveBeenNthCalledWith(
      2,
      {},
      'sites/site-id/drive/items/archives-id/children',
      createFolderBody('Invoices', false),
    );
  });

  it('skips intermediate folder creation when the full parent path already exists', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce('finance-id');
    postSpy.mockResolvedValueOnce({
      id: 'invoices-id',
      name: 'Invoices',
    });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/Finance/Invoices',
      true,
      false,
    );

    expect(result).toEqual({
      id: 'invoices-id',
      name: 'Invoices',
    });
    expect(sharedModule.getItemIdByPath).toHaveBeenCalledTimes(1);
    expect(sharedModule.getItemIdByPath).toHaveBeenCalledWith(
      'site-id',
      '/Finance',
    );
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      {},
      'sites/site-id/drive/items/finance-id/children',
      createFolderBody('Invoices', false),
    );
  });

  it('does not create intermediate folders when createIntermediateFolders is false', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined);
    postSpy.mockResolvedValueOnce({
      id: 'invoices-id',
      name: 'Invoices',
    });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/Finance/Invoices',
      false,
      false,
    );

    expect(result).toEqual({
      id: 'invoices-id',
      name: 'Invoices',
    });
    expect(sharedModule.getItemIdByPath).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      {},
      'sites/site-id/drive/root/children',
      createFolderBody('Invoices', false),
    );
  });

  it('uses replace conflict behavior for intermediate folders when overwrite is true', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    postSpy
      .mockResolvedValueOnce({ id: 'A-id', name: 'A' })
      .mockResolvedValueOnce({ id: 'B-id', name: 'B' })
      .mockResolvedValueOnce({ id: 'Target-id', name: 'Target' });

    const result: Folder = await createFolder.call(
      {} as never,
      'site-id',
      '/A/B/Target',
      true,
      true,
    );

    expect(result).toEqual({ id: 'Target-id', name: 'Target' });
    expect(postSpy).toHaveBeenNthCalledWith(
      1,
      {},
      'sites/site-id/drive/root/children',
      createFolderBody('A', true),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      2,
      {},
      'sites/site-id/drive/items/A-id/children',
      createFolderBody('B', true),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      3,
      {},
      'sites/site-id/drive/items/B-id/children',
      createFolderBody('Target', true),
    );
  });
});
