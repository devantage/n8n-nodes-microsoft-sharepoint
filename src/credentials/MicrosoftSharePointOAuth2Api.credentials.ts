import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MicrosoftSharePointOAuth2Api implements ICredentialType {
  public name: string = 'microsoftSharePointOAuth2Api';

  public extends: string[] = ['microsoftOAuth2Api'];

  public displayName: string = 'Microsoft SharePoint OAuth2 API';

  public documentationUrl: string =
    'https://learn.microsoft.com/en-us/graph/auth/auth-concepts';

  public properties: INodeProperties[] = [
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'hidden',
      default: 'openid offline_access Sites.ReadWrite.All',
    },
  ];
}
