import { IAllExecuteFunctions, IDataObject } from 'n8n-workflow';

import { normalizePath, sendRequest, SendRequestOptions } from '../../../utils';
import { getItemIdByPath } from '../../shared';
import { Folder } from '../models';

export async function createFolder(
  this: IAllExecuteFunctions,
  siteId: string,
  path: string,
  createIntermediateFolders: boolean = false,
  overwrite: boolean = false,
): Promise<Folder> {
  const pathParts: string[] = path
    .split('/')
    .filter((curPath: string) => curPath);

  const name: string | undefined = pathParts.pop();
  const parentPath: string = normalizePath(pathParts.join('/'));

  let parentId: string | undefined =
    parentPath !== '/'
      ? await getItemIdByPath.call(this, siteId, parentPath)
      : undefined;

  if (pathParts.length && !parentId && createIntermediateFolders) {
    for (const curParentIndex of pathParts.keys()) {
      const curParentPath: string = pathParts
        .slice(0, curParentIndex + 1)
        .join('/');

      const curParentId: string | undefined = await getItemIdByPath.call(
        this,
        siteId,
        curParentPath,
      );

      if (curParentId) {
        continue;
      }

      const { id: createdFolderId } = await createFolder.call<
        IAllExecuteFunctions,
        [string, string, boolean | undefined, boolean | undefined],
        Promise<Folder>
      >(this, siteId, curParentPath, createIntermediateFolders, overwrite);

      parentId = createdFolderId;
    }
  }

  const resource: string = parentId
    ? `sites/${siteId}/drive/items/${parentId}/children`
    : `sites/${siteId}/drive/root/children`;

  const body: IDataObject = {
    name,
    folder: {},
    '@microsoft.graph.conflictBehavior': overwrite ? 'replace' : 'fail',
  };

  return sendRequest.call<
    IAllExecuteFunctions,
    [string, SendRequestOptions],
    Promise<Folder>
  >(this, resource, {
    method: 'POST',
    body,
  });
}
