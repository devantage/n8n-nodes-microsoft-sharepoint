import { Resource } from '../models';
import { DeleteOperation } from './delete';
import { DownloadOperation } from './download';
import { UploadOperation } from './upload';

export class FileResource extends Resource {
  public constructor() {
    super(
      'file',
      'File',
      undefined,
      UploadOperation,
      DownloadOperation,
      DeleteOperation,
    );
  }
}
