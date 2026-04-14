import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { INodeMethods } from '../interfaces';
import { Resources } from '../resources';
import { getErrorMessage } from '../utils';

export class MicrosoftSharePoint implements INodeType {
  public description: INodeTypeDescription = {
    displayName: 'Microsoft SharePoint',
    name: 'microsoftSharePoint',
    icon: 'file:../icons/icon.svg',
    group: ['transform'],
    version: 1,
    description: 'n8n community nodes for Microsoft SharePoint API',
    defaults: {
      name: 'Microsoft SharePoint',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'microsoftSharePointOAuth2Api',
        required: true,
      },
    ],
    properties: Resources.getProperties(),
  };

  public methods?: INodeMethods = Resources.getMethods();

  public async execute(
    this: IExecuteFunctions,
  ): Promise<INodeExecutionData[][]> {
    const items: INodeExecutionData[] = this.getInputData();

    const returnData: INodeExecutionData[] = [];

    for (let itemIndex: number = 0; itemIndex < items.length; itemIndex++) {
      try {
        const resource: string | undefined = this.getNodeParameter(
          'resource',
          itemIndex,
        );

        if (!resource) {
          throw new Error('Resource is required');
        }

        const operation: string | undefined = this.getNodeParameter(
          'operation',
          itemIndex,
        );

        if (!operation) {
          throw new Error('Operation is required');
        }

        const result: INodeExecutionData = await Resources.getResource(resource)
          .getOperation(operation)
          .execute.call(this, itemIndex);

        returnData.push(result);
      } catch (error: unknown) {
        const nodeOperationError: NodeOperationError =
          error instanceof NodeOperationError
            ? error
            : new NodeOperationError(this.getNode(), getErrorMessage(error), {
                itemIndex,
              });

        if (this.continueOnFail()) {
          returnData.push({
            json: {},
            error: nodeOperationError,
            pairedItem: itemIndex,
          });
        } else {
          throw nodeOperationError;
        }
      }
    }

    return [returnData];
  }
}
