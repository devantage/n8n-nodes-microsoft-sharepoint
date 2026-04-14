import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
} from 'n8n-workflow';

export abstract class ResourceOperation {
  public abstract readonly name: string;

  public abstract readonly displayName: string;

  public abstract readonly description: string;

  public abstract readonly properties: INodeProperties[];

  public abstract execute(
    this: IExecuteFunctions,
    itemIndex: number,
  ): Promise<INodeExecutionData>;
}
