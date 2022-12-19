import { Plugin } from 'vite'
import { readFile } from 'fs/promises'
import { DEFAULT_TEMPLATE_PATH } from '../constants'

export function pluginIndexHtml(): Plugin {
  return {
    name: 'island:index-html',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: '/src/runtime/client-entry.tsx',
            },
            injectTo: 'body',
          },
        ],
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res) => {
          // 读取 template.html 的内容
          let content = await readFile(DEFAULT_TEMPLATE_PATH, 'utf-8')
          content = await server.transformIndexHtml(req.url, content, req.originalUrl)
          res.setHeader('Content-Type', 'text/html')
          res.end(content)
        })
      }
    }
  }
}
