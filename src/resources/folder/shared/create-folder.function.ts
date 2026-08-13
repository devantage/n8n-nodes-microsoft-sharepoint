import {
  IAllExecuteFunctions,
  IDataObject,
  NodeOperationError,
} from 'n8n-workflow';

import { httpClient, normalizePath } from '../../../utils';
import { getItemIdByPath } from '../../shared';
import { Folder } from '../models';

async function sendCreateFolderRequest(
  this: IAllExecuteFunctions,
  siteId: string,
  parentId: string | undefined,
  name: string,
  overwrite: boolean = false,
): Promise<Folder> {
  const resource: string = parentId
    ? `sites/${siteId}/drive/items/${parentId}/children`
    : `sites/${siteId}/drive/root/children`;

  const body: IDataObject = {
    name,
    folder: {},
    '@microsoft.graph.conflictBehavior': overwrite ? 'replace' : 'fail',
  };

  return httpClient.post<Folder>(this, resource, body);
}

async function createParentFolders(
  this: IAllExecuteFunctions,
  siteId: string,
  parentPathParts: string[],
  overwrite: boolean | undefined = false,
): Promise<string> {
  let parentId: string | undefined;

  for (const curParentIndex of parentPathParts.keys()) {
    const curParentName: string = parentPathParts[curParentIndex];
    const curParentPath: string = parentPathParts
      .slice(0, curParentIndex + 1)
      .join('/');

    const curParentId: string | undefined = await getItemIdByPath.call(
      this,
      siteId,
      curParentPath,
    );

    if (curParentId) {
      parentId = curParentId;

      continue;
    }

    const { id: createdParentId } = await sendCreateFolderRequest.call<
      IAllExecuteFunctions,
      [string, string | undefined, string, boolean | undefined],
      Promise<Folder>
    >(this, siteId, parentId, curParentName, overwrite);

    parentId = createdParentId;
  }

  if (!parentId) {
    throw new NodeOperationError(
      this.getNode(),
      `Error while creating intermediate folders`,
    );
  }

  return parentId;
}

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

  const name: string = pathParts.pop() as string;
  const parentPath: string = normalizePath(pathParts.join('/'));

  let parentId: string | undefined =
    parentPath !== '/'
      ? await getItemIdByPath.call(this, siteId, parentPath)
      : undefined;

  if (pathParts.length && !parentId && createIntermediateFolders) {
    parentId = await createParentFolders.call<
      IAllExecuteFunctions,
      [string, string[], boolean | undefined],
      Promise<string>
    >(this, siteId, pathParts, overwrite);
  }

  return sendCreateFolderRequest.call<
    IAllExecuteFunctions,
    [string, string | undefined, string, boolean | undefined],
    Promise<Folder>
  >(this, siteId, parentId, name, overwrite);
}
