import {
  ExecuteFunctionsMock,
  TestUtil,
} from '@devantage/n8n-custom-nodes-framework';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { resourceRegistry } from '../resources';
import { MicrosoftSharePoint } from './MicrosoftSharePoint.node';

function mockOperation(execute: jest.Mock<Promise<unknown>, [number]>): void {
  jest.spyOn(resourceRegistry, 'getResource').mockReturnValue({
    getOperation: jest.fn().mockReturnValue({ execute }),
  } as never);
}

describe('MicrosoftSharePoint node', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('describes the node with the registry properties and the credential', (): void => {
    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    expect(node.description.name).toBe('microsoftSharePoint');
    expect(node.description.credentials).toEqual([
      {
        name: 'microsoftSharePointOAuth2Api',
        required: true,
      },
    ]);
    expect(node.description.properties[0].name).toBe('resource');
    expect(node.description.properties[0].options).toEqual([
      { name: 'Site', value: 'site' },
      { name: 'Folder', value: 'folder' },
      { name: 'File', value: 'file' },
    ]);
  });

  it('exposes the site load options method', (): void => {
    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    expect(node.methods?.loadOptions?.getSiteOptions).toBeInstanceOf(Function);
  });

  it('executes the selected resource operation for every item', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      resource: 'site',
      operation: 'list',
    });
    const executeMock: jest.Mock<Promise<unknown>, [number]> = jest
      .fn<Promise<unknown>, [number]>()
      .mockResolvedValue({ json: { ok: true } });

    mockOperation(executeMock);

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();
    const result: INodeExecutionData[][] = await TestUtil.executeNode(
      node,
      context as unknown as IExecuteFunctions,
    );

    expect(result).toEqual([[{ json: { ok: true } }]]);
    expect(executeMock).toHaveBeenCalledWith(0);
  });

  it('throws when the resource is missing', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      operation: 'list',
    });

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    await expect(
      TestUtil.executeNode(node, context as unknown as IExecuteFunctions),
    ).rejects.toThrow(NodeOperationError);
  });

  it('throws when the operation is missing', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      resource: 'site',
    });

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    await expect(
      TestUtil.executeNode(node, context as unknown as IExecuteFunctions),
    ).rejects.toThrow(NodeOperationError);
  });

  it('wraps generic errors into node operation errors', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      resource: 'site',
      operation: 'list',
    });

    mockOperation(
      jest
        .fn<Promise<unknown>, [number]>()
        .mockRejectedValue({ detail: 'plain failure' }),
    );

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    await expect(
      TestUtil.executeNode(node, context as unknown as IExecuteFunctions),
    ).rejects.toThrow('{"detail":"plain failure"}');
  });

  it('returns item errors instead of throwing when continueOnFail is enabled', async (): Promise<void> => {
    const context: ExecuteFunctionsMock = TestUtil.createExecuteFunctionsMock({
      resource: 'site',
      operation: 'list',
    });
    const operationError: NodeOperationError = new NodeOperationError(
      context.getNode(),
      'operation failed',
      { itemIndex: 0 },
    );

    context.continueOnFail.mockReturnValue(true);

    mockOperation(
      jest.fn<Promise<unknown>, [number]>().mockRejectedValue(operationError),
    );

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();
    const result: INodeExecutionData[][] = await TestUtil.executeNode(
      node,
      context as unknown as IExecuteFunctions,
    );

    expect(result).toEqual([
      [
        {
          error: operationError,
          json: {},
          pairedItem: 0,
        },
      ],
    ]);
  });
});
