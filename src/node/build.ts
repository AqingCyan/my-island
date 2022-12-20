import path from 'path'
import fs from 'fs-extra'
import type { RollupOutput } from 'rollup'
import { build as viteBuild, InlineConfig } from 'vite'
import pluginReact from '@vitejs/plugin-react'
import ora from 'ora'
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from './constants'

const spinner = ora()

/**
 * 分别打包服务端和浏览器端产物
 * @param root
 */
export async function bundle(root: string) {
  const resolveViteConfig = (isServer: boolean): InlineConfig => {
    return {
      mode: 'production',
      root,
      plugins: [pluginReact()],
      build: {
        ssr: isServer,
        outDir: isServer ? '.temp' : 'build',
        rollupOptions: {
          input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
          output: { format: isServer ? 'cjs' : 'esm' }
        },
      },
    }
  }

  spinner.start('Building client + server bundles...')

  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(resolveViteConfig(false)),
      // server build
      viteBuild(resolveViteConfig(true)),
    ])
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
  const { render } = await import(serverEntryPath)
  await renderPage(render, root, clientBundle)
  spinner.succeed('client + server bundles ok')
}
