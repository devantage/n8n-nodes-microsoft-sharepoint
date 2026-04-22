import { MicrosoftSharePointOAuth2Api } from './MicrosoftSharePointOAuth2Api.credentials';

describe('MicrosoftSharePointOAuth2Api', (): void => {
  it('exposes the expected credential metadata', (): void => {
    const credentialType: MicrosoftSharePointOAuth2Api =
      new MicrosoftSharePointOAuth2Api();

    expect(credentialType.name).toBe('microsoftSharePointOAuth2Api');
    expect(credentialType.extends).toEqual(['microsoftOAuth2Api']);
    expect(credentialType.displayName).toBe('Microsoft SharePoint OAuth2 API');
    expect(credentialType.documentationUrl).toBe(
      'https://learn.microsoft.com/en-us/graph/auth/auth-concepts',
    );
    expect(credentialType.properties).toEqual([
      {
        default: 'openid offline_access Sites.ReadWrite.All',
        displayName: 'Scope',
        name: 'scope',
        type: 'hidden',
      },
    ]);
  });
});
