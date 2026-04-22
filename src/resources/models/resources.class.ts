import { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

import { INodeMethods } from '../../interfaces/node-methods.interface';
import { FileResource } from '../file';
import { FolderResource } from '../folder';
import { SiteResource } from '../site';
import { Resource } from './resource.class';

export class Resources {
  private static readonly _resources: Resource[] = [
    new SiteResource(),
    new FolderResource(),
    new FileResource(),
  ];

  private static readonly _methodCategories: Array<keyof INodeMethods> = [
    'loadOptions',
    'listSearch',
    'credentialTest',
    'resourceMapping',
    'localResourceMapping',
    'actionHandler',
  ];

  private static _mergeCategory(
    methods: INodeMethods,
    curResourceMethods: INodeMethods,
    category: keyof INodeMethods,
  ): void {
    const categoryMethods: INodeMethods[keyof INodeMethods] | undefined =
      curResourceMethods[category];

    if (!categoryMethods) {
      return;
    }

    methods[category] = {
      ...(methods[category] ?? {}),
      ...categoryMethods,
    } as never;
  }

  public static getProperties(): INodeProperties[] {
    const properties: INodeProperties[] = [
      {
        name: 'resource',
        displayName: 'Resource',
        type: 'options',
        required: true,
        noDataExpression: true,
        options: [],
        default: null,
      },
    ];

    const resourceOptions: INodePropertyOptions[] = properties[0]
      .options as INodePropertyOptions[];

    for (const curResource of Resources._resources) {
      resourceOptions.push(curResource.getResourcePropertyOption());

      properties.push(curResource.getOperationProperty());

      properties.push(...curResource.getOperationsProperties());
    }

    return properties;
  }

  public static getMethods(): INodeMethods | undefined {
    const methods: INodeMethods = {};

    for (const curResource of Resources._resources) {
      const curResourceMethods: INodeMethods | undefined =
        curResource.getMethods();

      if (!curResourceMethods) {
        continue;
      }

      for (const category of Resources._methodCategories) {
        Resources._mergeCategory(methods, curResourceMethods, category);
      }
    }

    return JSON.stringify(methods) !== '{}' ? methods : undefined;
  }

  public static getResource(name: string): Resource {
    const resource: Resource | undefined = this._resources.find(
      (curResourceInstance: Resource) => curResourceInstance.name === name,
    );

    if (!resource) {
      throw new Error(`The resource '${name}' is not supported`);
    }

    return resource;
  }
}
