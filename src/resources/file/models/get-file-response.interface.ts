import { IDataObject } from 'n8n-workflow';

export type GetFileResponse = IDataObject & {
  id: string;

  name: string;

  file: {
    mimeType: string;
  };

  '@microsoft.graph.downloadUrl': string;
};
