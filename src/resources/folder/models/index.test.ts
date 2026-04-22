import * as folderModelsModule from './index';

describe('folder models index', (): void => {
  it('loads the models barrel file', (): void => {
    expect(folderModelsModule).toBeDefined();
  });
});
