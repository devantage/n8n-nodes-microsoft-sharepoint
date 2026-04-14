import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

import { ResourceOperation } from '../../models';
import { ListSitesResponse } from '../models/list-sites-response';
import { listSites } from '../shared';

export class ListOperation extends ResourceOperation {
  public readonly name: string = 'list';

  public readonly displayName: string = 'List';

  public readonly description: string = 'List sites';

  public readonly properties: INodeProperties[] = [];

  public async execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData> {
    const response: ListSitesResponse = await listSites.call(this);

    return {
      json: response.value as unknown as IDataObject,
      pairedItem: itemIndex,
    };
  }
}
