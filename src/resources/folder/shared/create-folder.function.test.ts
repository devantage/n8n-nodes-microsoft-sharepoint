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

import * as utilsModule from '../../../utils';
import * as sharedModule from '../../shared';
import type { Folder } from '../models';
import { createFolder } from './create-folder.function';

describe('createFolder', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('creates intermediate folders recursively when requested', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id')
      .mockResolvedValueOnce(undefined);
    jest
      .spyOn(utilsModule, 'sendRequest')
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
    expect(utilsModule.sendRequest).toHaveBeenNthCalledWith(
      1,
      'sites/site-id/drive/root/children',
      {
        body: {
          '@microsoft.graph.conflictBehavior': 'replace',
          folder: {},
          name: 'Finance',
        },
        method: 'POST',
      },
    );
    expect(utilsModule.sendRequest).toHaveBeenNthCalledWith(
      2,
      'sites/site-id/drive/items/finance-id/children',
      {
        body: {
          '@microsoft.graph.conflictBehavior': 'replace',
          folder: {},
          name: 'Invoices',
        },
        method: 'POST',
      },
    );
  });

  it('creates a root folder without intermediate folders by default', async (): Promise<void> => {
    jest.spyOn(utilsModule, 'sendRequest').mockResolvedValueOnce({
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
    expect(utilsModule.sendRequest).toHaveBeenCalledWith(
      'sites/site-id/drive/root/children',
      {
        body: {
          '@microsoft.graph.conflictBehavior': 'fail',
          folder: {},
          name: 'Reports',
        },
        method: 'POST',
      },
    );
  });

  it('skips existing intermediate folders and creates only the missing path', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id');
    jest.spyOn(utilsModule, 'sendRequest').mockResolvedValueOnce({
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
    expect(utilsModule.sendRequest).toHaveBeenCalledWith(
      'sites/site-id/drive/items/finance-id/children',
      {
        body: {
          '@microsoft.graph.conflictBehavior': 'fail',
          folder: {},
          name: 'Invoices',
        },
        method: 'POST',
      },
    );
  });

  it('continues past existing intermediate folders before creating missing ones', async (): Promise<void> => {
    jest
      .spyOn(sharedModule, 'getItemIdByPath')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('finance-id');
    jest
      .spyOn(utilsModule, 'sendRequest')
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
    expect(utilsModule.sendRequest).toHaveBeenNthCalledWith(
      2,
      'sites/site-id/drive/items/archives-id/children',
      {
        body: {
          '@microsoft.graph.conflictBehavior': 'fail',
          folder: {},
          name: 'Invoices',
        },
        method: 'POST',
      },
    );
  });
});
