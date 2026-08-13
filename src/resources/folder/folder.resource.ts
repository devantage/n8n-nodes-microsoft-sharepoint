import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { CreateOperation } from './create';
import { DeleteOperation } from './delete';

export class FolderResource extends Resource {
  public constructor() {
    super('folder', 'Folder', CreateOperation, DeleteOperation);
  }
}
