import { INodeProperties } from 'n8n-workflow';

import { INodeMethods } from '../../interfaces/node-methods.interface';
import { FileResource } from '../file';
import { FolderResource } from '../folder';
import { SiteResource } from '../site';
import { Resource } from '.';

export class Resources {
  private static readonly _resources: Resource[] = [
    new SiteResource(),
    new FolderResource(),
    new FileResource(),
  ];

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

    for (const curResource of Resources._resources) {
      if (properties[0].options === undefined) {
        throw new Error(``);
      }

      properties[0].options.push(curResource.getResourcePropertyOption());

      properties.push(curResource.getOperationProperty());

      properties.push(...curResource.getOperationsProperties());
    }

    return properties;
  }

  public static getMethods(): INodeMethods | undefined {
    let methods: INodeMethods = {};

    for (const curResource of Resources._resources) {
      const curResourceMethods: INodeMethods | undefined =
        curResource.getMethods();

      if (curResourceMethods) {
        if (methods.loadOptions && curResourceMethods.loadOptions) {
          methods = {
            loadOptions: {
              ...methods.loadOptions,
              ...curResourceMethods.loadOptions,
            },
          };
        } else if (curResourceMethods.loadOptions) {
          methods = {
            loadOptions: curResourceMethods.loadOptions,
          };
        }

        if (methods.listSearch && curResourceMethods.listSearch) {
          methods = {
            listSearch: {
              ...methods.listSearch,
              ...curResourceMethods.listSearch,
            },
          };
        } else if (curResourceMethods.listSearch) {
          methods = {
            listSearch: curResourceMethods.listSearch,
          };
        }

        if (methods.credentialTest && curResourceMethods.credentialTest) {
          methods = {
            credentialTest: {
              ...methods.credentialTest,
              ...curResourceMethods.credentialTest,
            },
          };
        } else if (curResourceMethods.credentialTest) {
          methods = {
            credentialTest: curResourceMethods.credentialTest,
          };
        }

        if (methods.resourceMapping && curResourceMethods.resourceMapping) {
          methods = {
            resourceMapping: {
              ...methods.resourceMapping,
              ...curResourceMethods.resourceMapping,
            },
          };
        } else if (curResourceMethods.resourceMapping) {
          methods = {
            resourceMapping: curResourceMethods.resourceMapping,
          };
        }

        if (
          methods.localResourceMapping &&
          curResourceMethods.localResourceMapping
        ) {
          methods = {
            localResourceMapping: {
              ...methods.localResourceMapping,
              ...curResourceMethods.localResourceMapping,
            },
          };
        } else if (curResourceMethods.localResourceMapping) {
          methods = {
            localResourceMapping: curResourceMethods.localResourceMapping,
          };
        }

        if (methods.actionHandler && curResourceMethods.actionHandler) {
          methods = {
            actionHandler: {
              ...methods.actionHandler,
              ...curResourceMethods.actionHandler,
            },
          };
        } else if (curResourceMethods.actionHandler) {
          methods = {
            actionHandler: curResourceMethods.actionHandler,
          };
        }
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
