import * as interfacesModule from './index';

describe('interfaces index', (): void => {
  it('loads the interfaces barrel file', (): void => {
    expect(interfacesModule).toBeDefined();
  });
});
