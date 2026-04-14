import {
  IAllExecuteFunctions,
  IDataObject,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import { sendRequest, SendRequestOptions } from '../../../utils';
import { ResourceOperation } from '../../models';
import { getItemIdByPath } from '../../shared';

export class UploadOperation extends ResourceOperation {
  public readonly name: string = 'upload';

  public readonly displayName: string = 'Upload';

  public readonly description: string = 'Upload a file';

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
    {
      name: 'name',
      displayName: 'File Name',
      type: 'string',
      required: true,
      default: '',
    },
    {
      name: 'binaryPropertyName',
      displayName: 'File Binary Data Property Name',
      type: 'string',
      required: true,
      default: 'file',
    },
  ];

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const siteId: string = this.getNodeParameter('siteId', itemIndex) as string;

    const path: string = this.getNodeParameter('path', itemIndex) as string;

    const name: string = this.getNodeParameter('name', itemIndex) as string;

    const binaryPropertyName: string = this.getNodeParameter(
      'binaryPropertyName',
      itemIndex,
    );

    const fileBuffer: Buffer = await this.helpers.getBinaryDataBuffer(
      itemIndex,
      binaryPropertyName,
    );

    const parentId: string | undefined = await getItemIdByPath.call(
      this,
      siteId,
      path,
    );

    if (!parentId) {
      throw new NodeOperationError(
        this.getNode(),
        `No folder found at '${path}'`,
        { itemIndex },
      );
    }

    const file: IDataObject = await sendRequest.call<
      IAllExecuteFunctions,
      [string, SendRequestOptions],
      Promise<IDataObject>
    >(this, `/sites/${siteId}/drive/items/${parentId}:/${name}:/content`, {
      method: 'PUT',
      body: fileBuffer,
    });

    return {
      json: file,
      pairedItem: itemIndex,
    };
  }
}
