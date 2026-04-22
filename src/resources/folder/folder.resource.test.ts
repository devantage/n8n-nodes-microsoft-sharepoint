import { CreateOperation } from './create';
import { DeleteOperation } from './delete';
import { FolderResource } from './folder.resource';

describe('FolderResource', (): void => {
  it('registers create and delete operations', (): void => {
    const resource: FolderResource = new FolderResource();

    expect(resource.getOperation('create')).toBeInstanceOf(CreateOperation);
    expect(resource.getOperation('delete')).toBeInstanceOf(DeleteOperation);
  });
});
