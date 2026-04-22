import { NodeOperationError } from 'n8n-workflow';

import { type HttpResponse, sendRequest } from './send-request.function';

type LoggerMock = {
  error: jest.Mock<undefined, [string]>;
  warn: jest.Mock<undefined, [string]>;
};

type HttpRequestWithAuthenticationMock = jest.Mock<
  Promise<HttpResponse<unknown>>,
  [string, Record<string, unknown>]
>;

type ExecutionContextMock = {
  getNode(): { name: string; type: string };
  helpers: {
    httpRequestWithAuthentication: HttpRequestWithAuthenticationMock;
  };
  logger: LoggerMock;
};

function createExecutionContext(): ExecutionContextMock {
  return {
    getNode: (): { name: string; type: string } => ({
      name: 'Microsoft SharePoint',
      type: 'microsoftSharePoint',
    }),
    helpers: {
      httpRequestWithAuthentication: jest.fn<
        Promise<HttpResponse<unknown>>,
        [string, Record<string, unknown>]
      >(),
    },
    logger: {
      error: jest.fn<undefined, [string]>(),
      warn: jest.fn<undefined, [string]>(),
    },
  };
}

describe('sendRequest', (): void => {
  afterEach((): void => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('sends authenticated requests to Microsoft Graph and returns the body by default', async (): Promise<void> => {
    const context: ExecutionContextMock = createExecutionContext();
    const response: HttpResponse<{ id: string }> = {
      body: { id: '123' },
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    };

    context.helpers.httpRequestWithAuthentication.mockResolvedValue(response);

    const result: { id: string } = (await sendRequest.call(
      context as never,
      'sites/site-id',
      {
        method: 'GET',
      },
    )) as { id: string };

    expect(result).toEqual({ id: '123' });
    expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
      'microsoftSharePointOAuth2Api',
      expect.objectContaining({
        method: 'GET',
        returnFullResponse: true,
        url: 'https://graph.microsoft.com/v1.0/sites/site-id',
      }),
    );
  });

  it('returns the full response when requested', async (): Promise<void> => {
    const context: ExecutionContextMock = createExecutionContext();
    const response: HttpResponse<{ id: string }> = {
      body: { id: '123' },
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    };

    context.helpers.httpRequestWithAuthentication.mockResolvedValue(response);

    const result: HttpResponse<{ id: string }> = (await sendRequest.call(
      context as never,
      'sites/site-id',
      {
        method: 'GET',
        returnFullResponse: true,
      },
    )) as HttpResponse<{ id: string }>;

    expect(result).toEqual(response);
  });

  it('uses a provided absolute url without rewriting it', async (): Promise<void> => {
    const context: ExecutionContextMock = createExecutionContext();
    const response: HttpResponse<Buffer> = {
      body: Buffer.from('file'),
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    };

    context.helpers.httpRequestWithAuthentication.mockResolvedValue(response);

    await sendRequest.call(context as never, '', {
      encoding: 'stream',
      headers: {},
      url: 'https://download.example.com/file.txt',
    });

    expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
      'microsoftSharePointOAuth2Api',
      expect.objectContaining({
        url: 'https://download.example.com/file.txt',
      }),
    );
  });

  it('rewrites non-https urls to the Microsoft Graph endpoint', async (): Promise<void> => {
    const context: ExecutionContextMock = createExecutionContext();
    const response: HttpResponse<{ id: string }> = {
      body: { id: '123' },
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    };

    context.helpers.httpRequestWithAuthentication.mockResolvedValue(response);

    await sendRequest.call(context as never, 'sites/site-id', {
      method: 'GET',
      url: 'http://download.example.com/file.txt',
    });

    expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
      'microsoftSharePointOAuth2Api',
      expect.objectContaining({
        url: 'https://graph.microsoft.com/v1.0/sites/site-id',
      }),
    );
  });

  it('uses the default empty options object when none is provided', async (): Promise<void> => {
    const context: ExecutionContextMock = createExecutionContext();
    const response: HttpResponse<{ id: string }> = {
      body: { id: '123' },
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    };

    context.helpers.httpRequestWithAuthentication.mockResolvedValue(response);

    await sendRequest.call(context as never, 'sites/site-id');

    expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
      'microsoftSharePointOAuth2Api',
      expect.objectContaining({
        url: 'https://graph.microsoft.com/v1.0/sites/site-id',
      }),
    );
  });

  it('retries throttled read requests after the Retry-After interval', async (): Promise<void> => {
    jest.useFakeTimers();

    const context: ExecutionContextMock = createExecutionContext();
    const throttledResponse: HttpResponse<{ id: string }> = {
      body: { id: '123' },
      headers: {
        'Retry-After': '2',
      },
      statusCode: 429,
      statusMessage: 'Too Many Requests',
    };
    const successResponse: HttpResponse<{ id: string }> = {
      body: { id: '456' },
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    };

    context.helpers.httpRequestWithAuthentication
      .mockResolvedValueOnce(throttledResponse)
      .mockResolvedValueOnce(successResponse);

    const requestPromise: Promise<{ id: string }> = sendRequest.call(
      context as never,
      'sites/site-id',
      {
        method: 'GET',
      },
    ) as Promise<{ id: string }>;

    await jest.advanceTimersByTimeAsync(2000);

    await expect(requestPromise).resolves.toEqual({ id: '456' });
    expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledTimes(
      2,
    );
    expect(context.logger.warn).toHaveBeenCalledWith(
      'Requests throttled. Waiting 2 seconds to make next request',
    );
  });

  it('retries throttled mutation requests with the same payload', async (): Promise<void> => {
    jest.useFakeTimers();

    const context: ExecutionContextMock = createExecutionContext();
    const body: Buffer = Buffer.from('file-content');
    const throttledResponse: HttpResponse<{ id: string }> = {
      body: { id: '123' },
      headers: {
        'Retry-After': '1',
      },
      statusCode: 429,
      statusMessage: 'Too Many Requests',
    };
    const successResponse: HttpResponse<{ id: string }> = {
      body: { id: 'uploaded-id' },
      headers: {},
      statusCode: 200,
      statusMessage: 'OK',
    };

    context.helpers.httpRequestWithAuthentication
      .mockResolvedValueOnce(throttledResponse)
      .mockResolvedValueOnce(successResponse);

    const requestPromise: Promise<{ id: string }> = sendRequest.call(
      context as never,
      'sites/site-id/drive/items/folder-id:/report.pdf:/content',
      {
        body,
        method: 'PUT',
      },
    ) as Promise<{ id: string }>;

    await jest.advanceTimersByTimeAsync(1000);

    await expect(requestPromise).resolves.toEqual({ id: 'uploaded-id' });
    expect(
      context.helpers.httpRequestWithAuthentication,
    ).toHaveBeenNthCalledWith(
      1,
      'microsoftSharePointOAuth2Api',
      expect.objectContaining({
        body,
        method: 'PUT',
        url: 'https://graph.microsoft.com/v1.0/sites/site-id/drive/items/folder-id:/report.pdf:/content',
      }),
    );
    expect(
      context.helpers.httpRequestWithAuthentication,
    ).toHaveBeenNthCalledWith(
      2,
      'microsoftSharePointOAuth2Api',
      expect.objectContaining({
        body,
        method: 'PUT',
        url: 'https://graph.microsoft.com/v1.0/sites/site-id/drive/items/folder-id:/report.pdf:/content',
      }),
    );
  });

  it('does not retry throttled responses that omit Retry-After', async (): Promise<void> => {
    const context: ExecutionContextMock = createExecutionContext();

    context.helpers.httpRequestWithAuthentication.mockResolvedValueOnce({
      body: {
        error: {
          message: 'Too many requests',
        },
      },
      headers: {},
      statusCode: 429,
      statusMessage: 'Too Many Requests',
    });

    await expect(
      sendRequest.call(context as never, 'sites/site-id', {
        method: 'GET',
      }),
    ).rejects.toThrow(NodeOperationError);

    expect(context.helpers.httpRequestWithAuthentication).toHaveBeenCalledTimes(
      1,
    );
    expect(context.logger.warn).not.toHaveBeenCalled();
  });

  it('logs and wraps request errors in a NodeOperationError', async (): Promise<void> => {
    const context: ExecutionContextMock = createExecutionContext();

    context.helpers.httpRequestWithAuthentication.mockRejectedValue(
      new Error('request failed'),
    );

    await expect(
      sendRequest.call(context as never, 'sites/site-id', {
        method: 'GET',
      }),
    ).rejects.toThrow(NodeOperationError);

    expect(context.logger.error).toHaveBeenCalledWith(
      'Error while sending request. Message: request failed',
    );
  });
});
