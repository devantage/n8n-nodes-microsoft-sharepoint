import { DeleteOperation } from './delete';
import { DownloadOperation } from './download';
import { FileResource } from './file.resource';
import { UploadOperation } from './upload';

describe('FileResource', (): void => {
  it('registers upload, download and delete operations', (): void => {
    const resource: FileResource = new FileResource();

    expect(resource.getOperation('upload')).toBeInstanceOf(UploadOperation);
    expect(resource.getOperation('download')).toBeInstanceOf(DownloadOperation);
    expect(resource.getOperation('delete')).toBeInstanceOf(DeleteOperation);
  });
});
