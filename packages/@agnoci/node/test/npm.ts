import test from 'ava'

import * as agnoci from '@agnoci/core/lib/blocks'
import * as npm from '../src/npm'

function isCommandNode (x: agnoci.Node): x is agnoci.CommandNode {
  return x.type === agnoci.NodeType.Command
}

test('install with no args', (t) => {
  const result = npm.install()
  if (!isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'npm install')
})

test('install w/ package', (t) => {
  const result = npm.install({ package: 'my-test-package' })
  if (!isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'npm install my-test-package')
})

test('install w/ no save', (t) => {
  const result = npm.install({ noSave: true })
  if (!isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'npm install --no-save')
})

test('install w/ no optional', (t) => {
  const result = npm.install({ noOptional: true })
  if (!isCommandNode(result)) return t.fail()
  t.is(result.args.command, 'npm install --no-optional')
})
