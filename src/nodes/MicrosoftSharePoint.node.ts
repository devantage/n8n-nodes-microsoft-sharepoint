import { ResourceNode } from '@devantage/n8n-custom-nodes-framework';
import type { INodeType } from 'n8n-workflow';

import { resourceRegistry } from '../resources';
import { getSiteOptions } from '../resources/site';
import { MICROSOFT_SHAREPOINT_CREDENTIAL_TYPE } from '../utils';

export class MicrosoftSharePoint extends ResourceNode {
  public readonly methods: INodeType['methods'] = {
    loadOptions: {
      getSiteOptions,
    },
  };

  public constructor() {
    super(resourceRegistry, {
      displayName: 'Microsoft SharePoint',
      name: 'microsoftSharePoint',
      icon: 'file:../icons/icon.svg',
      version: 1,
      description: 'n8n community nodes for Microsoft SharePoint API',
      credentials: [
        {
          name: MICROSOFT_SHAREPOINT_CREDENTIAL_TYPE,
          required: true,
        },
      ],
    });
  }
}
