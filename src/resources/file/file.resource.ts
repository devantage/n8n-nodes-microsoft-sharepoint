import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { DeleteOperation } from './delete';
import { DownloadOperation } from './download';
import { UploadOperation } from './upload';

export class FileResource extends Resource {
  public constructor() {
    super('file', 'File', UploadOperation, DownloadOperation, DeleteOperation);
  }
}
