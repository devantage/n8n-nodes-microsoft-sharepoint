import * as folderModule from './index';

describe('folder index', (): void => {
  it('loads the folder barrel file', (): void => {
    expect(folderModule).toBeDefined();
  });
});
