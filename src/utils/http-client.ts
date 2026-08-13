import { HttpClient } from '@devantage/n8n-custom-nodes-framework';
import type { IN8nHttpFullResponse } from 'n8n-workflow';

export type HttpResponse<D> = Omit<IN8nHttpFullResponse, 'body'> & {
  body: D;
};

export const MICROSOFT_SHAREPOINT_CREDENTIAL_TYPE: string =
  'microsoftSharePointOAuth2Api';

export const httpClient: HttpClient = new HttpClient({
  baseURL: 'https://graph.microsoft.com/v1.0/',
  credentialType: MICROSOFT_SHAREPOINT_CREDENTIAL_TYPE,
});
