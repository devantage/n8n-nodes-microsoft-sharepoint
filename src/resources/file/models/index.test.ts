import * as fileModelsModule from './index';

describe('file models index', (): void => {
  it('loads the models barrel file', (): void => {
    expect(fileModelsModule).toBeDefined();
  });
});
