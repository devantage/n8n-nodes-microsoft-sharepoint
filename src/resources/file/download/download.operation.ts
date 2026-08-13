import { ResourceOperation } from '@devantage/n8n-custom-nodes-framework';
import {
  IBinaryData,
  type IExecuteFunctions,
  type INodeExecutionData,
  type INodeProperties,
  NodeOperationError,
} from 'n8n-workflow';

import { httpClient, withOperationDisplayOptions } from '../../../utils';
import { getItemIdByPath } from '../../shared';
import { GetFileResponse } from '../models';

export class DownloadOperation extends ResourceOperation {
  public readonly name: string = 'download';

  public readonly displayName: string = 'Download';

  public readonly description: string = 'Download a file';

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
        displayName: 'File Path',
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

    const fileDetails: GetFileResponse = await httpClient.get<GetFileResponse>(
      this,
      `sites/${siteId}/drive/items/${fileId}`,
    );

    const downloadedFile: Buffer = await httpClient.get<Buffer>(
      this,
      fileDetails['@microsoft.graph.downloadUrl'],
      undefined,
      {
        headers: {},
        encoding: 'stream',
      },
    );

    const binaryData: IBinaryData = await this.helpers.prepareBinaryData(
      downloadedFile,
      fileDetails.name,
      fileDetails.file.mimeType,
    );

    return {
      json: fileDetails,
      binary: {
        file: binaryData,
      },
    };
  }
}
