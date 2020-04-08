import test from 'ava'

import * as agnoci from '@agnoci/core'

import * as nvm from '../src/nvm'

const nodeVersion = '12.16.1'
const rewriteItems = [ 'node', 'npm', 'npx', 'yarn' ]

rewriteItems.forEach((item) => {
  test(`useHook: correctly rewrites node ('${item}')`, (t) => {
    const node = agnoci.command(`${item} --version`)
    const result = nvm.useHook(nodeVersion)(node)
    if (!agnoci.isCommandNode(result)) return t.fail()
    t.is(result.args.command, `nvm install ${nodeVersion} && ${item} --version`)
  })
})

test('useHook: correctly ignores node', (t) => {
  const node = agnoci.command('blah --version')
  const result = nvm.useHook(nodeVersion)(node)
  if (!agnoci.isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'blah --version')
})
