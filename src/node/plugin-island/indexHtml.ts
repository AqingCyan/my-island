import { Plugin } from 'vite'
import { readFile } from 'fs/promises'
import { DEFAULT_TEMPLATE_PATH } from '../constants'

export function pluginIndexHtml(): Plugin {
  return {
    name: 'island:index-html',
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          // 1.读取 template.html 的内容
          const content = await readFile(DEFAULT_TEMPLATE_PATH)
          // 2.响应 HTML
          res.setHeader('Content-Type', 'text/html')
          res.end(content)
        })
      }
    }
  }
}
