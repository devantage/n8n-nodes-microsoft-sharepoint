import * as siteModule from './index';

describe('site index', (): void => {
  it('loads the site barrel file', (): void => {
    expect(siteModule).toBeDefined();
  });
});
