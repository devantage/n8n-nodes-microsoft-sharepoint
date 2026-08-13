import { ResourceRegistry } from '@devantage/n8n-custom-nodes-framework';

import { FileResource } from './file';
import { FolderResource } from './folder';
import { SiteResource } from './site';

export const resourceRegistry: ResourceRegistry = new ResourceRegistry(
  new SiteResource(),
  new FolderResource(),
  new FileResource(),
);
