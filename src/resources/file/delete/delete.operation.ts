import {
  IAllExecuteFunctions,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import { sendRequest, SendRequestOptions } from '../../../utils';
import { ResourceOperation } from '../../models';
import { getItemIdByPath } from '../../shared';

export class DeleteOperation extends ResourceOperation {
  public readonly name: string = 'delete';

  public readonly displayName: string = 'Delete';

  public readonly description: string = 'Delete a file';

  public readonly properties: INodeProperties[] = [
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
      displayName: 'File Path',
      type: 'string',
      required: true,
      default: '',
    },
  ];

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const siteId: string = this.getNodeParameter('siteId', itemIndex) as string;

    const path: string = this.getNodeParameter('path', itemIndex) as string;

    const fileId: string | undefined = await getItemIdByPath.call(
      this,
      siteId,
      path,
    );

    if (!fileId) {
      throw new NodeOperationError(
        this.getNode(),
        `No file found at '${path}'`,
        { itemIndex },
      );
    }

    await sendRequest.call<
      IAllExecuteFunctions,
      [string, SendRequestOptions],
      Promise<void>
    >(this, `/sites/${siteId}/drive/items/${fileId}`, {
      method: 'DELETE',
    });

    return {
      json: { deleted: true },
    };
  }
}
