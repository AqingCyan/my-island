import * as path from 'path'
import * as fs from 'fs-extra'
import { build as viteBuild, InlineConfig } from 'vite'
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from './constants'
import type { RollupOutput } from 'rollup'

/**
 * 分别打包服务端和浏览器端产物
 * @param root
 */
export async function bundle(root: string) {
  try {
    const resolveViteConfig = (isServer: boolean): InlineConfig => {
      return {
        mode: 'production',
        root,
        build: {
          assetsDir: isServer ? '' : 'asset',
          outDir: isServer ? '.temp' : 'build',
          rollupOptions: {
            input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
            output: isServer ? { entryFileNames: '[name].js', format: 'cjs' } : { format: 'esm' }
          },
        },
      }
    }

    const clientBuild = async () => {
      return viteBuild(resolveViteConfig(false))
    }

    const serverBuild = async () => {
      return viteBuild(resolveViteConfig(true))
    }

    console.log('Building client + server bundles...')

    const [clientBundle, serverBundle] = await Promise.all([clientBuild(), serverBuild()])

    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput]
  } catch(error) {
    console.error(error)
  }
}

/**
 * 拿到服务端打包的产物进行 html 的拼接，并写入磁盘
 * @param render
 * @param root
 * @param clientBundle
 */
export async function renderPage(render: () => string, root: string, clientBundle: RollupOutput) {
  const appHtml = render()
  const clientChunk = clientBundle.output.find((chunk) => chunk.type === 'chunk' && chunk.isEntry)
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Document</title>
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script src="/${clientChunk?.fileName}" type="module"></script>
    </body>
    </html>
  `.trim()
  await fs.writeFile(path.join(root, 'build', 'index.html'), html)
  await fs.remove(path.join(root, '.temp')) // 已经有了拼接好的 html 内容，就不需要服务端打包产物了，删除即可
}

export async function build(root: string) {
  const [clientBundle] = await bundle(root)
  const serverEntryPath = path.resolve(root, '.temp', 'ssr-entry.js');
  const { render } = require(serverEntryPath)
  await renderPage(render, root, clientBundle)
}
