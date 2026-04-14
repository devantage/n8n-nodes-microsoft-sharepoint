import type {
  IAllExecuteFunctions,
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { ResourceOperation } from '../../models';
import { Folder } from '../models';
import { createFolder } from '../shared';

export class CreateOperation extends ResourceOperation {
  public readonly name: string = 'create';

  public readonly displayName: string = 'Create';

  public readonly description: string = 'Create a folder';

  public readonly properties: INodeProperties[] = [
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
      displayName: 'Folder Path',
      type: 'string',
      required: true,
      default: '/',
    },
    {
      name: 'additionalFields',
      displayName: 'Additional Fields',
      type: 'collection',
      required: false,
      options: [
        {
          name: 'createIntermediateFolders',
          displayName: 'Create Intermediate Folders',
          type: 'boolean',
          default: false,
        },
        {
          name: 'overwrite',
          displayName: 'Overwrite',
          type: 'boolean',
          default: false,
        },
      ],
      default: {},
    },
  ];

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const siteId: string = this.getNodeParameter('siteId', itemIndex) as string;

    const additionalFields: IDataObject = this.getNodeParameter(
      'additionalFields',
      itemIndex,
    );

    const path: string = this.getNodeParameter('path', itemIndex) as string;

    const folder: Folder = await createFolder.call<
      IAllExecuteFunctions,
      [string, string, boolean | undefined, boolean | undefined],
      Promise<Folder>
    >(
      this,
      siteId,
      path,
      additionalFields.createIntermediateFolders as boolean | undefined,
      additionalFields.overwrite as boolean | undefined,
    );

    return {
      json: folder,
      pairedItem: itemIndex,
    };
  }
}
