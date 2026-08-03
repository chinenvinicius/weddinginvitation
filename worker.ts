import { onRequest } from './functions/api/[[path]]';

interface WorkerEnv {
  TIDB_DATABASE_URL: string;
  IMGBB_API_KEY: string;
  EVENT_CODE: string;
  ADMIN_TOKEN: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return new URL(request.url).pathname.startsWith('/api/')
      ? onRequest({ request, env })
      : env.ASSETS.fetch(request);
  },
};
