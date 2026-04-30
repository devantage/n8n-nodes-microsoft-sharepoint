import { type HttpResponse, sendRequest } from './send-request.function';

type HttpRequestWithAuthenticationMock = jest.Mock<
  Promise<HttpResponse<unknown>>,
  [string, Record<string, unknown>]
>;

type ExecutionContextMock = {
  helpers: {
    httpRequestWithAuthentication: HttpRequestWithAuthenticationMock;
  };
};

function createExecutionContext(): ExecutionContextMock {
  return {
    helpers: {
      httpRequestWithAuthentication: jest.fn<
        Promise<HttpResponse<unknown>>,
        [string, Record<string, unknown>]
      >(),
    },
  };
}

describe('sendRequest', (): void => {
  afterEach((): void => {
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
});
