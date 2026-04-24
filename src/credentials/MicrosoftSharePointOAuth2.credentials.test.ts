import { MicrosoftSharePointOAuth2 } from './MicrosoftSharePointOAuth2.credentials';

describe('MicrosoftSharePointOAuth2', (): void => {
  it('exposes the expected credential metadata', (): void => {
    const credentialType: MicrosoftSharePointOAuth2 =
      new MicrosoftSharePointOAuth2();

    expect(credentialType.name).toBe('microsoftSharePointOAuth2');
    expect(credentialType.extends).toEqual(['microsoftOAuth2Api']);
    expect(credentialType.displayName).toBe('Microsoft SharePoint OAuth2');
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
