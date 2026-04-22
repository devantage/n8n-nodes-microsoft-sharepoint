import type { INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { Resource } from './resource.class';
import { ResourceOperation } from './resource-operation.class';

class TestOperation extends ResourceOperation {
  public readonly name: string = 'testOperation';

  public readonly displayName: string = 'Test Operation';

  public readonly description: string = 'Execute the test operation';

  public readonly properties: INodeProperties[] = [
    {
      default: '',
      displayName: 'Name',
      name: 'name',
      type: 'string',
    },
    {
      default: '',
      displayName: 'Value',
      displayOptions: {
        show: {
          feature: ['test'],
        },
      },
      name: 'value',
      type: 'string',
    },
  ];

  public async execute(): Promise<INodeExecutionData> {
    return Promise.resolve({
      json: {
        ok: true,
      },
    });
  }
}

class AnotherTestOperation extends ResourceOperation {
  public readonly name: string = 'anotherOperation';

  public readonly displayName: string = 'Another Operation';

  public readonly description: string = 'Execute another operation';

  public readonly properties: INodeProperties[] = [];

  public async execute(): Promise<INodeExecutionData> {
    return Promise.resolve({
      json: {
        ok: true,
      },
    });
  }
}

class TestResource extends Resource {
  public constructor() {
    super(
      'test',
      'Test',
      {
        actionHandler: {
          runAction: async (): Promise<string> => Promise.resolve('action'),
        },
        loadOptions: {
          getOptions: async (): Promise<
            Array<{ name: string; value: string }>
          > => Promise.resolve([{ name: 'Option', value: '1' }]),
        },
      },
      TestOperation,
      AnotherTestOperation,
    );
  }
}

describe('Resource', (): void => {
  it('builds the resource and operation properties', (): void => {
    const resource: TestResource = new TestResource();

    expect(resource.getResourcePropertyOption()).toEqual({
      name: 'Test',
      value: 'test',
    });
    expect(resource.getOperationProperty()).toEqual({
      default: null,
      displayName: 'Operation',
      displayOptions: {
        show: {
          resource: ['test'],
        },
      },
      name: 'operation',
      noDataExpression: true,
      options: [
        {
          action: 'Execute the test operation',
          description: 'Execute the test operation',
          name: 'Test Operation',
          value: 'testOperation',
        },
        {
          action: 'Execute another operation',
          description: 'Execute another operation',
          name: 'Another Operation',
          value: 'anotherOperation',
        },
      ],
      required: true,
      type: 'options',
    });

    expect(resource.getOperationsProperties()).toEqual([
      {
        default: '',
        displayName: 'Name',
        displayOptions: {
          show: {
            operation: ['testOperation'],
            resource: ['test'],
          },
        },
        name: 'name',
        type: 'string',
      },
      {
        default: '',
        displayName: 'Value',
        displayOptions: {
          show: {
            feature: ['test'],
            operation: ['testOperation'],
            resource: ['test'],
          },
        },
        name: 'value',
        type: 'string',
      },
    ]);
  });

  it('returns methods and operations by name', (): void => {
    const resource: TestResource = new TestResource();

    expect(resource.getMethods()).toBeDefined();
    expect(resource.getOperation('testOperation')).toBeInstanceOf(
      TestOperation,
    );
  });

  it('throws when the operation is not supported', (): void => {
    const resource: TestResource = new TestResource();

    expect((): ResourceOperation => resource.getOperation('missing')).toThrow(
      "The operation 'missing' is not supported by resource 'test'",
    );
  });
});
