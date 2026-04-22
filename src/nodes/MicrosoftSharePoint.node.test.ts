import type { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { Resources } from '../resources';
import { MicrosoftSharePoint } from './MicrosoftSharePoint.node';

type ExecuteContextMock = {
  continueOnFail: jest.Mock<boolean, []>;
  getInputData: jest.Mock<Array<Record<string, unknown>>, []>;
  getNode: jest.Mock<INode, []>;
  getNodeParameter: jest.Mock<string | undefined, [string, number]>;
};

function createExecuteContext(): ExecuteContextMock {
  return {
    continueOnFail: jest.fn<boolean, []>().mockReturnValue(false),
    getInputData: jest
      .fn<Array<Record<string, unknown>>, []>()
      .mockReturnValue([{ json: { input: 1 } }]),
    getNode: jest.fn<INode, []>().mockReturnValue({
      id: '1',
      name: 'Microsoft SharePoint',
      parameters: {},
      position: [0, 0],
      type: 'microsoftSharePoint',
      typeVersion: 1,
    }),
    getNodeParameter: jest.fn<string | undefined, [string, number]>(),
  };
}

describe('MicrosoftSharePoint node', (): void => {
  afterEach((): void => {
    jest.restoreAllMocks();
  });

  it('executes the selected resource operation for every item', async (): Promise<void> => {
    const context: ExecuteContextMock = createExecuteContext();
    const executeMock: jest.Mock<
      Promise<{ json: { ok: boolean } }>,
      [number]
    > = jest
      .fn<Promise<{ json: { ok: boolean } }>, [number]>()
      .mockResolvedValue({
        json: {
          ok: true,
        },
      });

    context.getInputData.mockReturnValue([{ json: { input: 1 } }]);
    context.getNodeParameter
      .mockReturnValueOnce('site')
      .mockReturnValueOnce('list');

    jest.spyOn(Resources, 'getResource').mockReturnValue({
      getOperation: jest.fn().mockReturnValue({
        execute: executeMock,
      }),
    } as never);

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();
    const result: Awaited<ReturnType<MicrosoftSharePoint['execute']>> =
      await node.execute.call(context as never);

    expect(result).toEqual([
      [
        {
          json: {
            ok: true,
          },
        },
      ],
    ]);
    expect(executeMock).toHaveBeenCalledWith(0);
  });

  it('throws when the resource is missing', async (): Promise<void> => {
    const context: ExecuteContextMock = createExecuteContext();

    context.getNodeParameter.mockReturnValueOnce(undefined);

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    await expect(node.execute.call(context as never)).rejects.toThrow(
      NodeOperationError,
    );
  });

  it('throws when the operation is missing', async (): Promise<void> => {
    const context: ExecuteContextMock = createExecuteContext();

    context.getNodeParameter
      .mockReturnValueOnce('site')
      .mockReturnValueOnce(undefined);

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    await expect(node.execute.call(context as never)).rejects.toThrow(
      NodeOperationError,
    );
  });

  it('wraps generic errors with getErrorMessage', async (): Promise<void> => {
    const context: ExecuteContextMock = createExecuteContext();

    context.getNodeParameter
      .mockReturnValueOnce('site')
      .mockReturnValueOnce('list');

    jest.spyOn(Resources, 'getResource').mockReturnValue({
      getOperation: jest.fn().mockReturnValue({
        execute: jest.fn().mockRejectedValue({ detail: 'plain failure' }),
      }),
    } as never);

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();

    await expect(node.execute.call(context as never)).rejects.toThrow(
      '{"detail":"plain failure"}',
    );
  });

  it('returns item errors instead of throwing when continueOnFail is enabled', async (): Promise<void> => {
    const context: ExecuteContextMock = createExecuteContext();
    const operationError: NodeOperationError = new NodeOperationError(
      context.getNode(),
      'operation failed',
      { itemIndex: 0 },
    );

    context.continueOnFail.mockReturnValue(true);
    context.getNodeParameter
      .mockReturnValueOnce('site')
      .mockReturnValueOnce('list');

    jest.spyOn(Resources, 'getResource').mockReturnValue({
      getOperation: jest.fn().mockReturnValue({
        execute: jest.fn().mockRejectedValue(operationError),
      }),
    } as never);

    const node: MicrosoftSharePoint = new MicrosoftSharePoint();
    const result: Awaited<ReturnType<MicrosoftSharePoint['execute']>> =
      await node.execute.call(context as never);

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
