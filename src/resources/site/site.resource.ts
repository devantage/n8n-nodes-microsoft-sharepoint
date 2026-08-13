import { Resource } from '@devantage/n8n-custom-nodes-framework';

import { ListOperation } from './list';

export class SiteResource extends Resource {
  public constructor() {
    super('site', 'Site', ListOperation);
  }
}
