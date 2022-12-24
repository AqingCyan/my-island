import { createServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import pluginReact from '@vitejs/plugin-react';
import { PACKAGE_ROOT } from './constants';
import { resolveUserConfig } from './config';

export async function createDevServer(root: string) {
  const config = await resolveUserConfig(root, 'serve', 'development');
  console.log(config);
  return createServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()],
    server: { fs: { allow: [PACKAGE_ROOT] } }
  });
}
