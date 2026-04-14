import type {
  ICredentialTestFunction,
  IDataObject,
  ILoadOptionsFunctions,
  ILocalLoadOptionsFunctions,
  INodeListSearchResult,
  INodePropertyOptions,
  NodeParameterValueType,
  ResourceMapperFields,
} from 'n8n-workflow';

export interface INodeMethods {
  loadOptions?: {
    [key: string]: (
      this: ILoadOptionsFunctions,
    ) => Promise<INodePropertyOptions[]>;
  };

  listSearch?: {
    [key: string]: (
      this: ILoadOptionsFunctions,
      filter?: string,
      paginationToken?: string,
    ) => Promise<INodeListSearchResult>;
  };

  credentialTest?: {
    [functionName: string]: ICredentialTestFunction;
  };

  resourceMapping?: {
    [functionName: string]: (
      this: ILoadOptionsFunctions,
    ) => Promise<ResourceMapperFields>;
  };

  localResourceMapping?: {
    [functionName: string]: (
      this: ILocalLoadOptionsFunctions,
    ) => Promise<ResourceMapperFields>;
  };

  actionHandler?: {
    [functionName: string]: (
      this: ILoadOptionsFunctions,
      payload: IDataObject | string | undefined,
    ) => Promise<NodeParameterValueType>;
  };
}
