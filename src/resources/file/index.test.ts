import * as fileModule from './index';

describe('file index', (): void => {
  it('loads the file barrel file', (): void => {
    expect(fileModule).toBeDefined();
  });
});
