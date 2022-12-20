import { App } from './App'
import { renderToString } from 'react-dom/server'

function render() {
  return renderToString(<App />);
}

// TODO 这里存在问题，打包的时候指定了 cjs ，即使是使用 export function 的形式，最终得到的产物也应该是 module.exports 才对，而不是像现在这样手动去做
module.exports = { render }
