import type { INodeProperties } from 'n8n-workflow';

import type { INodeMethods } from '../../interfaces';
import { FileResource } from '../file';
import { FolderResource } from '../folder';
import { SiteResource } from '../site';
import { Resource } from './resource.class';
import { Resources } from './resources.class';

function getResourcesState(): never[] {
  return Object.getOwnPropertyDescriptor(Resources, '_resources')
    ?.value as never[];
}

function setResourcesState(resources: never[]): void {
  Object.defineProperty(Resources, '_resources', {
    value: resources,
    writable: true,
  });
}

describe('Resources', (): void => {
  it('exposes node properties for all registered resources', (): void => {
    const properties: INodeProperties[] = Resources.getProperties();
    const resourceProperty: INodeProperties = properties[0];

    expect(resourceProperty.options).toEqual([
      { name: 'Site', value: 'site' },
      { name: 'Folder', value: 'folder' },
      { name: 'File', value: 'file' },
    ]);
    expect(
      properties.some(
        (property: INodeProperties): boolean => property.name === 'operation',
      ),
    ).toBe(true);
    expect(
      properties.some(
        (property: INodeProperties): boolean =>
          property.name === 'binaryPropertyName',
      ),
    ).toBe(true);
  });

  it('merges methods from all registered resources', (): void => {
    const methods: ReturnType<typeof Resources.getMethods> =
      Resources.getMethods();

    expect(methods?.loadOptions).toBeDefined();
    expect(typeof methods?.loadOptions?.getSiteOptions).toBe('function');
  });

  it('merges every supported method category across resources', (): void => {
    const originalResources: never[] = getResourcesState();
    const resourceA: { getMethods(): INodeMethods } = {
      getMethods: (): INodeMethods => ({
        actionHandler: {
          firstAction: async (): Promise<string> => Promise.resolve('a'),
        },
        credentialTest: {
          testA: async () => Promise.resolve({ message: 'ok', status: 'OK' }),
        },
        listSearch: {
          searchA: async () => Promise.resolve({ results: [] }),
        },
        loadOptions: {
          loadA: async () => Promise.resolve([]),
        },
        localResourceMapping: {
          localMapA: async () =>
            Promise.resolve({
              fields: [],
            }),
        },
        resourceMapping: {
          mapA: async () =>
            Promise.resolve({
              fields: [],
            }),
        },
      }),
    };
    const resourceB: { getMethods(): INodeMethods } = {
      getMethods: (): INodeMethods => ({
        actionHandler: {
          secondAction: async (): Promise<string> => Promise.resolve('b'),
        },
        credentialTest: {
          testB: async () => Promise.resolve({ message: 'ok', status: 'OK' }),
        },
        listSearch: {
          searchB: async () => Promise.resolve({ results: [] }),
        },
        loadOptions: {
          loadB: async () => Promise.resolve([]),
        },
        localResourceMapping: {
          localMapB: async () =>
            Promise.resolve({
              fields: [],
            }),
        },
        resourceMapping: {
          mapB: async () =>
            Promise.resolve({
              fields: [],
            }),
        },
      }),
    };
    const resourceC: { getMethods(): undefined } = {
      getMethods: (): undefined => undefined,
    };

    setResourcesState([
      resourceA as never,
      resourceB as never,
      resourceC as never,
    ]);

    const methods: ReturnType<typeof Resources.getMethods> =
      Resources.getMethods();

    expect(typeof methods?.actionHandler?.firstAction).toBe('function');
    expect(typeof methods?.actionHandler?.secondAction).toBe('function');
    expect(typeof methods?.credentialTest?.testA).toBe('function');
    expect(typeof methods?.credentialTest?.testB).toBe('function');
    expect(typeof methods?.listSearch?.searchA).toBe('function');
    expect(typeof methods?.listSearch?.searchB).toBe('function');
    expect(typeof methods?.loadOptions?.loadA).toBe('function');
    expect(typeof methods?.loadOptions?.loadB).toBe('function');
    expect(typeof methods?.localResourceMapping?.localMapA).toBe('function');
    expect(typeof methods?.localResourceMapping?.localMapB).toBe('function');
    expect(typeof methods?.resourceMapping?.mapA).toBe('function');
    expect(typeof methods?.resourceMapping?.mapB).toBe('function');

    setResourcesState(originalResources);
  });

  it('returns undefined when no resources expose methods', (): void => {
    const originalResources: never[] = getResourcesState();

    setResourcesState([
      {
        getMethods: (): undefined => undefined,
      } as never,
    ]);

    expect(Resources.getMethods()).toBeUndefined();

    setResourcesState(originalResources);
  });

  it('returns registered resources by name', (): void => {
    expect(Resources.getResource('site')).toBeInstanceOf(SiteResource);
    expect(Resources.getResource('folder')).toBeInstanceOf(FolderResource);
    expect(Resources.getResource('file')).toBeInstanceOf(FileResource);
  });

  it('throws when a resource is not supported', (): void => {
    expect((): Resource => Resources.getResource('missing')).toThrow(
      "The resource 'missing' is not supported",
    );
  });
});
