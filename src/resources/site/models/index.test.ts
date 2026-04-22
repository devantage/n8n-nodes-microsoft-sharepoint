import * as siteModelsModule from './index';

describe('site models index', (): void => {
  it('loads the models barrel file', (): void => {
    expect(siteModelsModule).toBeDefined();
  });
});
