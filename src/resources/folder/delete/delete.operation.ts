import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import { httpClient, withOperationDisplayOptions } from '../../../utils';
import { getItemIdByPath } from '../../shared';

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string = 'Delete a folder';

  public readonly properties: INodeProperties[] = withOperationDisplayOptions(
    this.resource,
    this.name,
    [
      {
        name: 'siteId',
        displayName: 'Site or ID',
        description: 'The ID of the site',
        required: true,
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'getSiteOptions',
        },
        default: '',
      },
      {
        name: 'path',
        displayName: 'Folder Path',
        type: 'string',
        required: true,
        default: '',
      },
    ],
  );

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const siteId: string = this.getNodeParameter('siteId', itemIndex) as string;

    const path: string = this.getNodeParameter('path', itemIndex) as string;

    const folderId: string | undefined = await getItemIdByPath.call(
      this,
      siteId,
      path,
    );

    if (!folderId) {
      throw new NodeOperationError(
        this.getNode(),
        `No folder found at '${path}'`,
        { itemIndex },
      );
    }

    await httpClient.delete<unknown>(
      this,
      `sites/${siteId}/drive/items/${folderId}`,
    );

    return {
      json: { deleted: true },
    };
  }
}
