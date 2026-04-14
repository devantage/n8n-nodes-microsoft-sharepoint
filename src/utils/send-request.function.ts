import FormData from 'form-data';
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
  body?: IDataObject | FormData | Buffer;
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
        returnFullResponse: true,
      } as IHttpRequestOptions);

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
