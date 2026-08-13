import { ListOperation } from './list';
import { SiteResource } from './site.resource';

describe('SiteResource', (): void => {
  it('registers the list operation in the resource', (): void => {
    const resource: SiteResource = new SiteResource();

    expect(resource.getOperation('list')).toBeInstanceOf(ListOperation);
    expect(resource.getOperationProperty().options).toEqual([
      {
        action: 'List sites',
        description: 'List sites',
        name: 'List',
        value: 'list',
      },
    ]);
  });
});
