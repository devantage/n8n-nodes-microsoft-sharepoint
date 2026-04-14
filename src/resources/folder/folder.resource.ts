import { Resource } from '../models';
import { CreateOperation } from './create';
import { DeleteOperation } from './delete';

export class FolderResource extends Resource {
  public constructor() {
    super('folder', 'Folder', undefined, CreateOperation, DeleteOperation);
  }
}
