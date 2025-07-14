import { ApiClient, ClientMediaService } from '@muc/common';

const apiClient = new ApiClient('/api');
export const mediaService = new ClientMediaService(apiClient);
