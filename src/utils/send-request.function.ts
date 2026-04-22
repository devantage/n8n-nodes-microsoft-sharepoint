import {
  type IAllExecuteFunctions,
  type IDataObject,
  type IHttpRequestOptions,
  type IN8nHttpFullResponse,
  NodeOperationError,
} from 'n8n-workflow';

import { getErrorMessage } from './get-error-message.function';

export type HttpResponse<D> = Omit<IN8nHttpFullResponse, 'body'> & {
  body: D;
};

export type SendRequestOptions = Omit<IHttpRequestOptions, 'url'> & {
  url?: string;
  body?: IDataObject | Buffer;
  json?: boolean;
};

export async function sendRequest<D>(
  this: IAllExecuteFunctions,
  resource: string,
  options: SendRequestOptions = {},
): Promise<D> {
  try {
    if (!options.url || !options.url.startsWith('https://')) {
      options.url = `https://graph.microsoft.com/v1.0/${resource}`;
    }

    const credentialsType: string = 'microsoftSharePointOAuth2Api';

    const response: HttpResponse<D> =
      await this.helpers.httpRequestWithAuthentication.call<
        IAllExecuteFunctions,
        [string, IHttpRequestOptions],
        Promise<HttpResponse<D>>
      >(this, credentialsType, {
        ...options,
        ignoreHttpStatusErrors: true,
        returnFullResponse: true,
      } as IHttpRequestOptions);

    if (response.statusCode === 429 && response.headers['Retry-After']) {
      const retryAfterInSeconds: number =
        parseInt(response.headers['Retry-After'] as string, 10) || 10;

      this.logger.warn(
        `Requests throttled. Waiting ${retryAfterInSeconds.toString()} seconds to make next request`,
      );

      await new Promise((resolve: (value: unknown) => void) =>
        setTimeout(resolve, retryAfterInSeconds * 1000),
      );

      return await sendRequest.call<
        IAllExecuteFunctions,
        [string, SendRequestOptions],
        Promise<D>
      >(this, resource, options);
    } else if (response.statusCode >= 400) {
      throw new NodeOperationError(
        this.getNode(),
        new Error(
          `HTTP Error ${response.statusCode.toString()} - ${getErrorMessage(response.statusMessage)}${response.body ? `. Details: ${getErrorMessage(response.body)}` : ''}`,
        ),
      );
    }

    if (options.returnFullResponse) {
      return response as D;
    }

    return response.body;
  } catch (error: unknown) {
    const errorMessage: string = `Error while sending request. Message: ${getErrorMessage(error)}`;

    this.logger.error(errorMessage);

    throw new NodeOperationError(this.getNode(), errorMessage);
  }
}
